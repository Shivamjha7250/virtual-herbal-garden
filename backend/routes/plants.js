const express = require("express");
const router = express.Router();
const Plant = require("../models/Plant");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "herbal_garden_secret_key_123";

// =====================================================
// ✅ DATASET JSON FILE (Sync with DB)
// =====================================================
const DATASET_PATH = path.join(__dirname, "../data/plants.json");

const ensureDatasetFile = () => {
  const dir = path.dirname(DATASET_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATASET_PATH)) {
    fs.writeFileSync(DATASET_PATH, JSON.stringify([], null, 2));
  }
};

const readDataset = () => {
  ensureDatasetFile();
  try {
    const raw = fs.readFileSync(DATASET_PATH, "utf-8");
    return JSON.parse(raw || "[]");
  } catch (e) {
    return [];
  }
};

const writeDataset = (arr) => {
  ensureDatasetFile();
  fs.writeFileSync(DATASET_PATH, JSON.stringify(arr, null, 2));
};

// ✅ Plant doc (legacy keys in DB) -> dataset record
const toDatasetRecord = (p) => ({
  id: String(p._id),

  "Common Name": p["Common Name"] || "",
  "Scientific Name": p["Scientific Name"] || "",
  "Description": p["Description"] || "",

  "Uses": p["Uses"] || "",
  "Advantages": p["Advantages"] || "",
  "Disadvantages": p["Disadvantages"] || "",
  "Side Effects": p["Side Effects"] || "",
  "Related Plants": p["Related Plants"] || "",

  // store as public url path
  "Image 1": p["Image 1"] ? `/images/${p["Image 1"]}` : "",
  "Image 2": p["Image 2"] ? `/images/${p["Image 2"]}` : "",
  "Image 3": p["Image 3"] ? `/images/${p["Image 3"]}` : "",
  "Image 4": p["Image 4"] ? `/images/${p["Image 4"]}` : "",

  "3D Model Link": p["3D Model Link"] || "",

  isApproved: !!p.isApproved,
  createdAt: p.createdAt,
});

const upsertDatasetPlant = (plantDoc) => {
  const dataset = readDataset();
  const record = toDatasetRecord(plantDoc);

  const idx = dataset.findIndex((x) => String(x.id) === String(record.id));
  if (idx >= 0) dataset[idx] = record;
  else dataset.push(record);

  writeDataset(dataset);
};

const deleteFromDataset = (id) => {
  const dataset = readDataset();
  writeDataset(dataset.filter((x) => String(x.id) !== String(id)));
};

// =====================================================
// 🔒 AUTH MIDDLEWARES
// =====================================================
const verifyToken = (req, res, next) => {
  const tokenHeader = req.header("Authorization");
  if (!tokenHeader) return res.status(401).json({ message: "Access Denied. Login Required." });

  try {
    const token = tokenHeader.replace("Bearer ", "");
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid Token" });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ message: "Access Denied. Admins only." });
};

// =====================================================
// 📸 MULTER CONFIG (Image Upload)
// =====================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../images");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ✅ For update: image1..image4
const uploadPlantImages = upload.fields([
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
  { name: "image4", maxCount: 1 },
]);

// ✅ JSON + multipart both accepted
const maybeUploadPlantImages = (req, res, next) => {
  const ct = req.headers["content-type"] || "";
  if (ct.includes("multipart/form-data")) return uploadPlantImages(req, res, next);
  return next();
};

// ✅ delete file safely
const deleteImageIfExists = (filename) => {
  if (!filename) return;
  const fullPath = path.join(__dirname, "../images", filename);
  if (fs.existsSync(fullPath)) {
    try { fs.unlinkSync(fullPath); } catch (e) {}
  }
};

// =====================================================
// 🔁 FIELD MAPPING (NEW -> OLD keys)
// =====================================================
const NEW_TO_OLD = {
  commonName: "Common Name",
  scientificName: "Scientific Name",
  description: "Description",
  uses: "Uses",
  advantages: "Advantages",
  disadvantages: "Disadvantages",
  sideEffects: "Side Effects",
  relatedPlants: "Related Plants",
  threeDModelLink: "3D Model Link",
};

// =====================================================
// 🌐 PUBLIC ROUTES
// =====================================================

// 1) Get All Approved Plants
router.get("/", async (req, res) => {
  try {
    const plants = await Plant.find({ isApproved: true });
    res.json(plants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =====================================================
// 🔒 ADMIN ROUTES (MUST BE BEFORE "/:id")
// =====================================================

// 2) Get Pending Plants (Admin)
router.get("/admin/pending", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const plants = await Plant.find({ isApproved: false });
    res.json(plants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3) Approve Plant (Admin)
router.put("/admin/approve/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ message: "Plant not found" });

    plant.isApproved = true;
    plant.approvedBy = req.user.id;

    const updated = await plant.save();

    // ✅ dataset sync
    upsertDatasetPlant(updated);

    res.json({ message: "Approved successfully!", plant: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4) ✅ UPDATE Plant (Admin) — updates DB legacy keys + dataset
router.put("/admin/update/:id", verifyToken, verifyAdmin, maybeUploadPlantImages, async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ message: "Plant not found" });

    // ✅ Save new keys into OLD keys
    Object.entries(NEW_TO_OLD).forEach(([newKey, oldKey]) => {
      if (req.body[newKey] !== undefined) plant[oldKey] = req.body[newKey];
      if (req.body[oldKey] !== undefined) plant[oldKey] = req.body[oldKey];
    });

    // ✅ Replace images if provided
    const files = req.files || {};

    if (files.image1?.[0]) {
      deleteImageIfExists(plant["Image 1"]);
      plant["Image 1"] = files.image1[0].filename;
    }
    if (files.image2?.[0]) {
      deleteImageIfExists(plant["Image 2"]);
      plant["Image 2"] = files.image2[0].filename;
    }
    if (files.image3?.[0]) {
      deleteImageIfExists(plant["Image 3"]);
      plant["Image 3"] = files.image3[0].filename;
    }
    if (files.image4?.[0]) {
      deleteImageIfExists(plant["Image 4"]);
      plant["Image 4"] = files.image4[0].filename;
    }

    const updated = await plant.save();

    // ✅ dataset sync
    upsertDatasetPlant(updated);

    res.json({ message: "Updated successfully!", plant: updated });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// =====================================================
// 🔒 ADD PLANT (User/Admin) (Login Required)
// =====================================================

// 5) Add Plant (images[] max 4) — stores in legacy keys + dataset
router.post("/", verifyToken, upload.array("images", 4), async (req, res) => {
  try {
    const files = req.files || [];
    const isAdmin = req.user.role === "admin";

    const newPlant = new Plant({
      // ✅ store in legacy keys
      "Common Name": req.body.commonName || req.body["Common Name"] || "",
      "Scientific Name": req.body.scientificName || req.body["Scientific Name"] || "",
      "Description": req.body.description || req.body["Description"] || "",

      "Uses": req.body.uses || req.body["Uses"] || "",
      "Advantages": req.body.advantages || req.body["Advantages"] || "",
      "Disadvantages": req.body.disadvantages || req.body["Disadvantages"] || "",
      "Side Effects": req.body.sideEffects || req.body["Side Effects"] || "",
      "Related Plants": req.body.relatedPlants || req.body["Related Plants"] || "",

      "Image 1": files[0] ? files[0].filename : "",
      "Image 2": files[1] ? files[1].filename : "",
      "Image 3": files[2] ? files[2].filename : "",
      "Image 4": files[3] ? files[3].filename : "",

      "3D Model Link": req.body.threeDModelLink || req.body["3D Model Link"] || "",

      addedBy: req.user.id,
      isApproved: isAdmin,
      approvedBy: isAdmin ? req.user.id : null,
    });

    const saved = await newPlant.save();

    // ✅ dataset sync
    upsertDatasetPlant(saved);

    res.status(201).json(saved);
  } catch (err) {
    console.error("ADD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// =====================================================
// 🌿 PUBLIC: Get Single Plant (KEEP AFTER ADMIN ROUTES)
// =====================================================
router.get("/:id", async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ message: "Plant not found" });
    res.json(plant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6) Delete Plant (Admin) — deletes DB + images + dataset
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ message: "Plant not found" });

    deleteImageIfExists(plant["Image 1"]);
    deleteImageIfExists(plant["Image 2"]);
    deleteImageIfExists(plant["Image 3"]);
    deleteImageIfExists(plant["Image 4"]);

    await Plant.findByIdAndDelete(req.params.id);

    // ✅ dataset delete
    deleteFromDataset(req.params.id);

    res.json({ message: "Deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

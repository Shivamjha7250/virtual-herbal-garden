const express = require('express');
const router = express.Router();
const Plant = require('../models/Plant');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'herbal_garden_secret_key_123';

// ==========================================
// 🔒 MIDDLEWARE: Verify Token
// ==========================================
const verifyToken = (req, res, next) => {
  const tokenHeader = req.header('Authorization');
  if (!tokenHeader) return res.status(401).json({ message: "Access Denied. Login Required." });

  try {
    const token = tokenHeader.replace('Bearer ', '');
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

// ==========================================
// 🛡️ MIDDLEWARE: Verify Admin
// (Sirf Admin hi Delete/Approve kar sake)
// ==========================================
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Access Denied. Admins only." });
  }
};

// ==========================================
// 📸 MULTER CONFIG (Image Upload)
// ==========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ✅ PATH FIX: 'routes' folder se bahar nikal kar 'images' folder mein jao
    const dir = path.join(__dirname, '../images'); 
    
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Unique Filename
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// ==========================================
// 🌐 GET ROUTES (Public)
// ==========================================

// 1. Get All Approved Plants
router.get('/', async (req, res) => {
  try {
    const plants = await Plant.find({ isApproved: true });
    res.json(plants);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. Get Single Plant
router.get('/:id', async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ message: 'Plant not found' });
    res.json(plant);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ==========================================
// 🔒 SECURE ROUTES (Login Required)
// ==========================================

// 3. Get Pending Plants (Only Admin)
router.get('/admin/pending', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const plants = await Plant.find({ isApproved: false });
    res.json(plants);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 4. ADD PLANT (User or Admin)
router.post('/', verifyToken, upload.array('images', 4), async (req, res) => {
  try {
    console.log("📥 Adding Plant by User:", req.user.id);
    
    const files = req.files || [];
    const isAdmin = req.user.role === 'admin';

    // ✅ SCHEMA MATCH: Database ke field names se match kiya
    const newPlant = new Plant({
      commonName: req.body.commonName,       // 'name' nahi, 'commonName'
      scientificName: req.body.scientificName, // 'botanicalName' nahi
      description: req.body.description,
      
      uses: req.body.uses,
      advantages: req.body.advantages,
      disadvantages: req.body.disadvantages,
      sideEffects: req.body.sideEffects,
      relatedPlants: req.body.relatedPlants,

      // ✅ IMAGES: Array ko alag strings mein convert kiya
      image1: files[0] ? files[0].filename : "",
      image2: files[1] ? files[1].filename : "",
      image3: files[2] ? files[2].filename : "",
      image4: files[3] ? files[3].filename : "",

      threeDModelLink: req.body.threeDModelLink || "",

      // Tracking
      addedBy: req.user.id,
      isApproved: isAdmin, // Admin hai to direct approve
      approvedBy: isAdmin ? req.user.id : null
    });

    const savedPlant = await newPlant.save();
    console.log("✅ Plant Saved:", savedPlant.commonName);
    res.status(201).json(savedPlant);

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 5. Approve Plant (Only Admin)
router.put('/approve/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if(!plant) return res.status(404).json({ message: "Plant not found" });

    plant.isApproved = true;
    plant.approvedBy = req.user.id;

    await plant.save();
    res.json({ message: "Approved successfully!", plant });
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
});

// 6. Delete Plant (Only Admin)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Plant.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully!" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
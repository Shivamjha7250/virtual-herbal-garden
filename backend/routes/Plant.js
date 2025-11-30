const express = require('express');
const router = express.Router();
const Plant = require('../models/Plant');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken'); // ✅ JWT Import kiya (Token check ke liye)

const JWT_SECRET = process.env.JWT_SECRET || 'herbal_garden_secret_key_123';

// ==========================================
// 🔒 INTERNAL MIDDLEWARE (Verify Token)
// (Ye check karega ki user login hai ya nahi)
// ==========================================
const verifyToken = (req, res, next) => {
  const tokenHeader = req.header('Authorization');

  if (!tokenHeader) {
    return res.status(401).json({ message: "Access Denied. Login Required." });
  }

  try {
    // "Bearer " hatakar token nikalo
    const token = tokenHeader.replace('Bearer ', '');
    // Verify karo
    const verified = jwt.verify(token, JWT_SECRET);
    // User data req.user mein save karo
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

// ==========================================
// 📸 IMAGE UPLOAD SETUP (Multer)
// ==========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../public/images');
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// ==========================================
// 🌐 GET ROUTES (Public - No Login Needed)
// ==========================================

// Get All Approved Plants
router.get('/', async (req, res) => {
  try {
    const plants = await Plant.find({ isApproved: true });
    res.json(plants);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get Pending Plants
router.get('/pending', async (req, res) => {
  try {
    const plants = await Plant.find({ isApproved: false });
    res.json(plants);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get Single Plant
router.get('/:id', async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ message: 'Plant not found' });
    res.json(plant);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ==========================================
// ➕ POST ROUTE (ADD PLANT - Login Required)
// ==========================================
// ✅ 'verifyToken' use kiya taaki user ID mil sake
router.post('/', verifyToken, upload.array('images', 5), async (req, res) => {
  try {
    console.log("📥 Adding Plant by User ID:", req.user.id);

    const imagePaths = req.files ? req.files.map(file => `/images/${file.filename}`) : [];
    
    // Check if user is admin (req.user se check karna secure hai)
    const isAdmin = req.user.role === 'admin'; 

    const newPlant = new Plant({
      name: req.body.name,
      botanicalName: req.body.botanicalName,
      description: req.body.description,
      region: req.body.region,
      
      // ✅ Naya Field
      partsUsed: req.body.partsUsed,

      uses: req.body.uses ? req.body.uses.split(',') : [],
      advantages: req.body.advantages ? req.body.advantages.split(',') : [],
      disadvantages: req.body.disadvantages ? req.body.disadvantages.split(',') : [],
      
      sideEffects: req.body.sideEffects,
      images: imagePaths,
      selected3DImageIndex: req.body.selected3DImageIndex || 0,
      
      category: req.body.category || "General",

      // ✅ Tracking Info
      addedBy: req.user.id,             // Kisne add kiya
      isApproved: isAdmin,              // Admin hai to direct approve
      approvedBy: isAdmin ? req.user.id : null // Admin ne add kiya to approvedBy bhi set karo
    });

    const savedPlant = await newPlant.save();
    console.log("✅ Success:", savedPlant.name);
    res.status(201).json(savedPlant);

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 👑 ADMIN ACTIONS (Login Required)
// ==========================================

// Approve Plant
// ✅ 'verifyToken' use kiya taaki admin ki ID save kar sakein
router.put('/approve/:id', verifyToken, async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if(!plant) return res.status(404).json({ message: "Plant not found" });

    // ✅ Approve Logic
    plant.isApproved = true;
    plant.approvedBy = req.user.id; // Jis Admin ne click kiya, uski ID save karo

    await plant.save();
    res.json({ message: "Approved successfully!", plant });
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
});

// Delete Plant
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Plant.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted!" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
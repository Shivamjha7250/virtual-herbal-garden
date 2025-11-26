const express = require('express');
const router = express.Router();
const Plant = require('../models/Plant');
const multer = require('multer');
const path = require('path');

// --- 1. SIMPLE IMAGE UPLOAD SETUP ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Hum maante hain ki folder aapne bana liya hai
    // '../public/images' ka matlab: routes folder se bahar niklo, fir public/images mein jao
    cb(null, path.join(__dirname, '../public/images')); 
  },
  filename: (req, file, cb) => {
    // Unique naam
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- 2. POST ROUTE (ADD PLANT) ---
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    console.log("📥 Request Received...");

    if (!req.files || req.files.length === 0) {
       // Agar photo nahi aayi, toh bhi plant save hone do (Error mat do)
       console.log("⚠️ No images uploaded.");
    }

    const imagePaths = req.files.map(file => `/images/${file.filename}`);
    const isAdmin = req.body.role === 'admin'; 

    const newPlant = new Plant({
      name: req.body.name,
      botanicalName: req.body.botanicalName,
      description: req.body.description,
      region: req.body.region,
      uses: req.body.uses ? req.body.uses.split(',') : [],
      advantages: req.body.advantages ? req.body.advantages.split(',') : [],
      disadvantages: req.body.disadvantages ? req.body.disadvantages.split(',') : [],
      sideEffects: req.body.sideEffects,
      images: imagePaths,
      selected3DImageIndex: req.body.selected3DIndex || 0,
      category: req.body.category || "General",
      isApproved: isAdmin
    });

    const savedPlant = await newPlant.save();
    console.log("✅ Plant Saved:", savedPlant.name);
    res.status(201).json(savedPlant);

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// --- 3. OTHER ROUTES (GET, APPROVE, DELETE) ---
router.get('/', async (req, res) => {
  try { const plants = await Plant.find({ isApproved: true }); res.json(plants); } 
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/pending', async (req, res) => {
  try { const plants = await Plant.find({ isApproved: false }); res.json(plants); } 
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try { const plant = await Plant.findById(req.params.id); res.json(plant); } 
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/approve/:id', async (req, res) => {
  try {
    await Plant.findByIdAndUpdate(req.params.id, { isApproved: true });
    res.json({ message: "Plant Approved!" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Plant.findByIdAndDelete(req.params.id);
    res.json({ message: "Plant deleted!" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
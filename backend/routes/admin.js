const express = require('express');
const router = express.Router();
const Contribution = require('../models/Contribution');
const Plant = require('../models/Plant');

// 1. Saari Pending Requests Dekhna
router.get('/requests', async (req, res) => {
  try {
    // Sirf 'pending' requests lao aur User/Plant ka naam bhi dikhao
    const requests = await Contribution.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('plant', 'name');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Request Approve karna (Merge Logic)
router.post('/approve/:id', async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) return res.status(404).json({ message: "Request not found" });

    const plant = await Plant.findById(contribution.plant);
    
    // ✅ AUTOMATIC MERGE LOGIC
    // Agar user ne naya Advantage bataya hai, toh Plant ke advantages array mein jod do
    if (contribution.suggestionType === 'advantage') {
      plant.advantages.push(contribution.content);
    } else if (contribution.suggestionType === 'disadvantage') {
      plant.disadvantages.push(contribution.content);
    } else if (contribution.suggestionType === 'use') {
      plant.uses.push(contribution.content);
    }

    await plant.save(); // Main Plant update ho gaya!
    
    // Contribution ka status update karo
    contribution.status = 'approved';
    await contribution.save();

    res.json({ message: "Approved & Merged Successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
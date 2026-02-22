const express = require('express');
const router = express.Router();
const Contribution = require('../models/Contribution');
const Plant = require('../models/Plant');

router.get('/requests', async (req, res) => {
  try {
    const requests = await Contribution.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('plant', 'name');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/approve/:id', async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) return res.status(404).json({ message: "Request not found" });

    const plant = await Plant.findById(contribution.plant);
    
    if (contribution.suggestionType === 'advantage') {
      plant.advantages.push(contribution.content);
    } else if (contribution.suggestionType === 'disadvantage') {
      plant.disadvantages.push(contribution.content);
    } else if (contribution.suggestionType === 'use') {
      plant.uses.push(contribution.content);
    }

    await plant.save();
    
    contribution.status = 'approved';
    await contribution.save();

    res.json({ message: "Approved & Merged Successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
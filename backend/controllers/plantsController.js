const Plant = require('../models/Plant');

exports.getPlants = async (req, res) => {
  try {
    const plants = await Plant.find();
    res.json(plants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPlantById = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ message: "Not found" });
    res.json(plant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addPlant = async (req, res) => {
  try {
    const plant = new Plant(req.body);
    const savedPlant = await plant.save();
    res.status(201).json(savedPlant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

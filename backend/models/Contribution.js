const mongoose = require('mongoose');

const ContributionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  
  suggestionType: { type: String, enum: ['advantage', 'disadvantage', 'use', 'description'], required: true },
  content: { type: String, required: true },

  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contribution', ContributionSchema);
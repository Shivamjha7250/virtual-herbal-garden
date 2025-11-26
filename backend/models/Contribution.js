const mongoose = require('mongoose');

const ContributionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Kisne bheja
  plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true }, // Kis plant ke liye
  
  // Kya data add karna chahta hai
  suggestionType: { type: String, enum: ['advantage', 'disadvantage', 'use', 'description'], required: true },
  content: { type: String, required: true }, // User ka likha hua text

  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contribution', ContributionSchema);
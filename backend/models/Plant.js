const mongoose = require('mongoose');

const PlantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  botanicalName: String,
  description: String,
  region: String,
  uses: [String],
  advantages: [String],
  disadvantages: [String],
  sideEffects: String,
  
  // ✅ NEW FIELD ADDED:
  partsUsed: { type: String }, // e.g., "Leaves, Roots"

  images: [String],
  selected3DImageIndex: { type: Number, default: 0 },
  
  // ... baaki fields waise hi rahenge
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isApproved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plant', PlantSchema);
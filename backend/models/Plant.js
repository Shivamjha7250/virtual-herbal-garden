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
  
  // ✅ Field: Jo aapne add kiya tha
  partsUsed: { type: String }, // e.g., "Leaves, Roots"

  images: [String],
  selected3DImageIndex: { type: Number, default: 0 },
  
  // ✅ Field: Kis User ne request bheji hai
  addedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },

  // ✅ Field: Approval Status
  // Default 'false' rakha hai taaki pehle admin check kare
  isApproved: { type: Boolean, default: false }, 

  // ✅ NEW FIELD: Kis Admin ne Approve kiya (Jo aapko chahiye tha)
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plant', PlantSchema);
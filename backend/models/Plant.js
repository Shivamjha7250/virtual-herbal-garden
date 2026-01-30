const mongoose = require("mongoose");

const PlantSchema = new mongoose.Schema({
  // ✅ EXACT DATASET NAMES
  "Common Name": { type: String, required: true },
  "Scientific Name": String,

  "Description": String,

  "Uses": String,
  "Advantages": String,
  "Disadvantages": String,
  "Side Effects": String,
  "Related Plants": String,

  // Google image URLs
  "Image 1": String,
  "Image 2": String,
  "Image 3": String,
  "Image 4": String,

  "3D Model Link": String,

  // Meta
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  isApproved: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Plant", PlantSchema);

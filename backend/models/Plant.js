const mongoose = require("mongoose");

const PlantSchema = new mongoose.Schema({
  "Common Name": { type: String, required: true },
  "Scientific Name": { type: String, default: "" },

  "Description": { type: String, default: "" },

  "Uses": { type: String, default: "" },
  "Advantages": { type: String, default: "" },
  "Disadvantages": { type: String, default: "" },
  "Side Effects": { type: String, default: "" },
  "Related Plants": { type: String, default: "" },

  "Category": { type: String, default: "General" },
  "Region": { type: String, default: "" },

  "Image 1": { type: String, default: "" },
  "Image 2": { type: String, default: "" },
  "Image 3": { type: String, default: "" },
  "Image 4": { type: String, default: "" },

  "3D Model Link": { type: String, default: "" },

  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  isApproved: { type: Boolean, default: false },

  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Plant", PlantSchema);
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }, 
  profilePhoto: { type: String, default: '' },
  
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plant' }], 
  
  history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plant' }],

  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
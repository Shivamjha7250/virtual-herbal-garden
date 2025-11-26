// backend/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/herbal_garden';

    // Optional: avoid strictQuery warnings
    mongoose.set('strictQuery', false);

    // Connect without deprecated options
    await mongoose.connect(uri);

    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message || err);
    process.exit(1); // Stop app if DB fails
  }
};

module.exports = connectDB;

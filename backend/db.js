const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/herbal_garden';

    mongoose.set('strictQuery', false);

    await mongoose.connect(uri);

    console.log(" MongoDB Connected Successfully");
  } catch (err) {
    console.error(" MongoDB Connection Error:", err.message || err);
    process.exit(1); 
  }
};

module.exports = connectDB;

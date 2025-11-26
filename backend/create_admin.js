const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

const createAdmin = async () => {
  try {
    const adminData = {
      name: "Super Admin",
      email: "admin@7250",      // 🔒 Fixed Email
      password: "8102903267",   // 🔒 Fixed Password
      role: "admin",
      isVerified: true          // OTP ki zaroorat nahi
    };

    // 1. Check karein agar admin pehle se hai
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log("⚠️ Admin Account already exists!");
      console.log("👉 ID: " + adminData.email);
      console.log("👉 Pass: " + adminData.password);
      process.exit();
    }

    // 2. Password ko Encrypt karein (Security ke liye zaroori hai)
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // 3. Admin Save karein
    const newAdmin = new User({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      role: adminData.role,
      isVerified: true,
      profilePhoto: ""
    });

    await newAdmin.save();
    console.log("🎉 Permanent Admin Created Successfully!");
    console.log("📧 Login ID: " + adminData.email);
    console.log("🔑 Password: " + adminData.password);

    process.exit();
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
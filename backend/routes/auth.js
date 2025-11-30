const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Plant = require('../models/Plant');
const JWT_SECRET = process.env.JWT_SECRET || 'herbal_garden_secret_key_123';

// Email Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

// Helper: Send OTP
const sendOtp = async (email, otp) => {
  console.log(`🔐 OTP for ${email}: ${otp}`);
  const mailOptions = {
    from: `"Virtual Herbal Garden" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Herbal Garden - Verification OTP',
    text: `Your OTP is: ${otp}. Valid for 10 minutes.`
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent.");
  } catch (error) {
    console.log("⚠️ Email failed. Check console for OTP.");
  }
};

// ==========================================
// 1. SIGNUP FLOW
// ==========================================

router.post('/register-step1', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "User already registered!" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; 

    let user = existingUser;
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({ name, email, password: hashedPassword, isVerified: false });
    } else {
      user.name = name;
      user.password = await bcrypt.hash(password, 10);
    }
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();
    await sendOtp(email, otp);
    res.status(200).json({ message: "OTP sent to email!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP!" });
    if (user.otpExpires < Date.now()) return res.status(400).json({ message: "OTP Expired!" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.status(200).json({ message: "Verified! Login now." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// 2. LOGIN FLOW (REAL ADMIN CREATION)
// ==========================================

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ ADMIN LOGIC: Create Real DB User if not exists
    if (email === 'admin@herbal.com') {
      let adminUser = await User.findOne({ email: 'admin@herbal.com' });

      if (!adminUser) {
        console.log("⚠️ Creating Admin in Database...");
        const hashedPassword = await bcrypt.hash('123456', 10); 
        adminUser = await User.create({
          name: 'Super Admin',
          email: 'admin@herbal.com',
          password: hashedPassword,
          role: 'admin',
          isVerified: true,
          favorites: [],
          history: []
        });
      }

      const isMatch = await bcrypt.compare(password, adminUser.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid Admin Password" });

      const token = jwt.sign({ id: adminUser._id, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });

      return res.json({
        token,
        user: { 
          id: adminUser._id, 
          name: adminUser.name, 
          email: adminUser.email, 
          role: 'admin' 
        }
      });
    }

    // --- NORMAL USER LOGIC ---
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (!user.isVerified) return res.status(400).json({ message: "Verify OTP first." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    await sendOtp(email, otp);

    res.json({ message: "Credentials valid. OTP sent.", requiresOtp: true, email: email });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/login-verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpires < Date.now()) return res.status(400).json({ message: "OTP Expired" });

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// 3. FORGOT PASSWORD & OTHERS
// ==========================================

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    await sendOtp(email, otp);
    res.json({ message: "OTP sent to email." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpires < Date.now()) return res.status(400).json({ message: "OTP Expired" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.json({ message: "Password updated successfully!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/favorite', async (req, res) => {
  try {
    const { userId, plantId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid ID" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.favorites.indexOf(plantId);
    if (index === -1) user.favorites.push(plantId);
    else user.favorites.splice(index, 1);
    await user.save();
    res.json({ favorites: user.favorites });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid User ID" });

    const user = await User.findById(userId)
      .populate('favorites')
      .populate('history');
    
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ✅✅✅ THE ULTIMATE HISTORY FIX ✅✅✅
router.put('/history', async (req, res) => {
  const { userId, plantId } = req.body;
  
  if (!userId || !plantId) return res.status(400).json({ message: "Missing Data" });

  // Safety Check
  if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid User ID" });

  try {
    // 1. User ko fetch karo
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Current History ko Strings mein convert karo (Comparison ke liye)
    let historyIds = user.history.map(id => id.toString());

    // 3. Agar plant pehle se hai, to usse REMOVE karo (Taaki duplicate na bane)
    historyIds = historyIds.filter(id => id !== plantId);

    // 4. Ab naye plant ko TOP par add karo
    historyIds.unshift(plantId);

    // 5. [Double Safety] 'Set' ka use karke ensure karo ki sab Unique hain
    const uniqueHistory = [...new Set(historyIds)];

    // 6. Size Limit (Max 50)
    const finalHistory = uniqueHistory.slice(0, 50);

    // 7. Update User (Direct DB update to avoid version errors)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { history: finalHistory },
      { new: true }
    ).populate('history'); // Populate karke return karo

    res.json(updatedUser.history);

  } catch (err) {
    console.error("History Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅✅✅ GET ADMIN APPROVED PLANTS ROUTE ✅✅✅
router.get('/admin/approved-plants', async (req, res) => {
  try {
    // Yahan hum Database se saare Plants mangwa rahe hain
    // Agar aapke paas 'isApproved: true' wala field hai to: Plant.find({ isApproved: true }) likhein
    const plants = await Plant.find({}); 
    
    // Naye plants pehle dikhane ke liye reverse karein
    res.json(plants.reverse()); 
  } catch (err) {
    console.error("Admin Plants Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Config
const JWT_SECRET = process.env.JWT_SECRET || 'herbal_garden_secret_key_123';

// Email Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  }
});

// 1. REGISTER (Send OTP)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; 

    const newUser = new User({ name, email, password: hashedPassword, otp, otpExpires, isVerified: false });
    await newUser.save();

    // Email Bhejo
    const mailOptions = {
      from: `"Virtual Herbal Garden" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your Account',
      text: `Your OTP is: ${otp}`
    };
    transporter.sendMail(mailOptions, (err) => {
        if(err) console.log(err);
    });

    res.status(201).json({ message: "OTP sent via Email" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. VERIFY OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.otp !== otp || user.otpExpires < Date.now()) return res.status(400).json({ message: "Invalid/Expired OTP" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Verified! Login now." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (!user.isVerified) return res.status(400).json({ message: "Verify OTP first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. TOGGLE FAVORITE
router.put('/favorite', async (req, res) => {
  try {
    const { userId, plantId } = req.body;
    const user = await User.findById(userId);
    const index = user.favorites.indexOf(plantId);
    if (index === -1) user.favorites.push(plantId);
    else user.favorites.splice(index, 1);
    await user.save();
    res.json({ favorites: user.favorites });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. ADD TO HISTORY (New Logic)
router.put('/history', async (req, res) => {
  try {
    const { userId, plantId } = req.body;
    const user = await User.findById(userId);
    
    // Duplicate hatao aur top pe lao
    const index = user.history.indexOf(plantId);
    if (index !== -1) user.history.splice(index, 1);
    user.history.unshift(plantId);
    if (user.history.length > 20) user.history.pop(); // Limit 20 items

    await user.save();
    res.json({ history: user.history });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: `"Virtual Herbal Garden" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Password OTP',
      text: `Your OTP to reset password is: ${otp}`
    };
    transporter.sendMail(mailOptions, (err) => {
      if(err) return res.status(500).json({ message: "Email failed" });
      res.json({ message: "OTP sent!" });
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 7. RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or Expired OTP" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined; user.otpExpires = undefined;
    await user.save();
    res.json({ message: "Password Changed!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 8. GET USER DATA (Favorites & History populate)
router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('favorites').populate('history');
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); 
const connectDB = require('./db');

// Import Routes
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const plantRoutes = require('./routes/Plant');   // ✔ CORRECT

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Make Images Public
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Connect to MongoDB
connectDB();

// Basic Health Route
app.get('/', (req, res) => {
  res.send('Virtual Herbal Garden - Backend is running 🚀');
});

// Use API Routes
app.use('/api/plants', plantRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Fallback 404 Route
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(500).json({ error: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://bookshellbookstoree.netlify.app'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/books', require('../routes/bookRoutes'));
app.use('/api/cart', require('../routes/cartRoutes'));
app.use('/api/wishlist', require('../routes/wishlistRoutes'));
app.use('/api/orders', require('../routes/orderRoutes'));
app.use('/api/payments', require('../routes/paymentRoutes'));
app.use('/api/admin', require('../routes/adminRoutes'));
app.use('/api/contact', require('../routes/contactRoutes'));
app.use('/api/contacts', require('../routes/contactRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'BookShell API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  if (mongoose.connection.readyState === 0) {
    mongoose.connect(MONGO_URI)
      .then(() => console.log('✅ MongoDB Connected'))
      .catch((err) => console.error('❌ MongoDB Connection Error:', err.message));
  }
} else {
  console.error('❌ MONGO_URI is not defined in environment variables');
}

// Export the app for Vercel
module.exports = app;
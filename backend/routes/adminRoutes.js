// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  createBook, 
  updateBook, 
  deleteBook, 
  updateOrderStatus, 
  getAllUsers 
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Protect all admin routes
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getAllUsers);

// Orders
router.put('/orders/:id', updateOrderStatus);

// Books
router.post('/books', createBook);
router.put('/books/:id', updateBook);
router.delete('/books/:id', deleteBook);

module.exports = router;
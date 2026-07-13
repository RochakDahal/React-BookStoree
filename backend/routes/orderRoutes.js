// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus
} = require('../controllers/orderController');

// Create order (protected)
router.post('/', protect, createOrder);

// Get user orders (protected)
router.get('/my-orders', protect, getUserOrders);

// Get single order (protected)
router.get('/:id', protect, getOrderById);

// Update order status (protected)
router.put('/:id/status', protect, updateOrderStatus);

// Update payment status (protected)
router.put('/:id/payment', protect, updatePaymentStatus);

module.exports = router;
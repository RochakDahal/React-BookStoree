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
const { generateInvoice } = require('../controllers/invoiceController');

// ✅ IMPORTANT: /my-orders MUST come before /:id
router.get('/my-orders', protect, getUserOrders);

// Create order
router.post('/', protect, createOrder);

// Get single order
router.get('/:id', protect, getOrderById);

// ✅ Generate Invoice (PDF download)
router.get('/:id/invoice', protect, generateInvoice);

// Update order status (with email notification)
router.put('/:id/status', protect, updateOrderStatus);

// Update payment status
router.put('/:id/payment', protect, updatePaymentStatus);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create new order (Handles stock reduction & cart clearing)
// @access  Private
router.post('/', protect, createOrder);

// @route   GET /api/orders/my-orders
// @desc    Get current user orders
// @access  Private
router.get('/my-orders', protect, getMyOrders);

// @route   GET /api/orders
// @desc    Get all orders (Admin only)
// @access  Private/Admin
// NOTE: This MUST be placed before /:id to avoid route matching conflicts
router.get('/', protect, authorize('admin'), getAllOrders);

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, getOrderById);

module.exports = router;
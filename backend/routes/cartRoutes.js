// backend/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, getCart);

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', protect, addToCart);

// @route   PUT /api/cart
// @desc    Update cart item quantity
// @access  Private
router.put('/', protect, updateCart);

// @route   DELETE /api/cart/:bookId
// @desc    Remove item from cart
// @access  Private
router.delete('/:bookId', protect, removeFromCart);

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Private
router.delete('/', protect, clearCart);

module.exports = router;
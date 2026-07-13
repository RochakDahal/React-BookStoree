// backend/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Cart = require('../models/Cart');

// ✅ @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.bookId');
    
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }
    
    res.json({ 
      success: true, 
      items: cart.items 
    });
  } catch (error) {
    console.error('❌ Error fetching cart:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;
    
    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required'
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.bookId.toString() === bookId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ bookId, quantity });
    }

    await cart.save();
    await cart.populate('items.bookId');

    res.json({ 
      success: true, 
      items: cart.items 
    });
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ @route   PUT /api/cart
// @desc    Update item quantity
// @access  Private
router.put('/', protect, async (req, res) => {
  try {
    const { bookId, quantity } = req.body;
    
    if (!bookId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Book ID and quantity are required'
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart not found' 
      });
    }

    const item = cart.items.find(
      (item) => item.bookId.toString() === bookId
    );

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found in cart' 
      });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (item) => item.bookId.toString() !== bookId
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.bookId');

    res.json({ 
      success: true, 
      items: cart.items 
    });
  } catch (error) {
    console.error('❌ Error updating cart:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ @route   DELETE /api/cart/:bookId
// @desc    Remove item from cart
// @access  Private
router.delete('/:bookId', protect, async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart not found' 
      });
    }

    cart.items = cart.items.filter(
      (item) => item.bookId.toString() !== bookId
    );
    
    await cart.save();
    await cart.populate('items.bookId');

    res.json({ 
      success: true, 
      items: cart.items 
    });
  } catch (error) {
    console.error('❌ Error removing from cart:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart not found' 
      });
    }

    cart.items = [];
    await cart.save();

    res.json({ 
      success: true, 
      items: [] 
    });
  } catch (error) {
    console.error('❌ Error clearing cart:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
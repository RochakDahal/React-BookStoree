// backend/routes/wishlistRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Wishlist = require('../models/Wishlist');

// ✅ @route   GET /api/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('books');
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, books: [] });
    }
    
    res.json({ 
      success: true, 
      books: wishlist.books 
    });
  } catch (error) {
    console.error('❌ Error fetching wishlist:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ @route   POST /api/wishlist/:bookId
// @desc    Add book to wishlist
// @access  Private
router.post('/:bookId', protect, async (req, res) => {
  try {
    const { bookId } = req.params;
    
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, books: [] });
    }
    
    if (!wishlist.books.includes(bookId)) {
      wishlist.books.push(bookId);
      await wishlist.save();
    }
    
    await wishlist.populate('books');
    
    res.json({ 
      success: true, 
      books: wishlist.books 
    });
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ @route   DELETE /api/wishlist/:bookId
// @desc    Remove book from wishlist
// @access  Private
router.delete('/:bookId', protect, async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({ 
        success: false, 
        message: 'Wishlist not found' 
      });
    }
    
    wishlist.books = wishlist.books.filter(id => id.toString() !== bookId);
    await wishlist.save();
    await wishlist.populate('books');
    
    res.json({ 
      success: true, 
      books: wishlist.books 
    });
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
const Wishlist = require('../models/Wishlist');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('books');

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, books: [] });
    }

    res.json({
      success: true,
      wishlist
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add book to wishlist
// @route   POST /api/wishlist
// @access  Private
exports.addToWishlist = async (req, res) => {
  try {
    const { bookId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, books: [] });
    }

    // Check if already in wishlist
    if (wishlist.books.includes(bookId)) {
      return res.status(400).json({ message: 'Book already in wishlist' });
    }

    wishlist.books.push(bookId);
    await wishlist.save();
    await wishlist.populate('books');

    res.json({
      success: true,
      message: 'Book added to wishlist',
      wishlist
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove book from wishlist
// @route   DELETE /api/wishlist/:bookId
// @access  Private
exports.removeFromWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.books = wishlist.books.filter(id => id.toString() !== bookId);
    await wishlist.save();
    await wishlist.populate('books');

    res.json({
      success: true,
      message: 'Book removed from wishlist',
      wishlist
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
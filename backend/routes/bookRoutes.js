// backend/routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { protect, authorize } = require('../middleware/auth');
const { 
  addReview, 
  updateReview, 
  deleteReview, 
  getReviews 
} = require('../controllers/reviewController');

// ============================================
// PUBLIC ROUTES
// ============================================

// @route   GET /api/books
// @desc    Get all books with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { genre, search, sort, minPrice, maxPrice, onSale } = req.query;
    
    let query = {};
    
    if (genre) query.genre = genre;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    if (onSale === 'true') {
      query.discount = { $gt: 0 };
    }
    
    let booksQuery = Book.find(query);
    
    if (sort) {
      const sortOptions = {
        'price-low': { price: 1 },
        'price-high': { price: -1 },
        'rating': { rating: -1 },
        'discount': { discount: -1 },
        'title': { title: 1 },
        'newest': { createdAt: -1 }
      };
      booksQuery.sort(sortOptions[sort] || { createdAt: -1 });
    } else {
      booksQuery.sort({ createdAt: -1 });
    }
    
    const books = await booksQuery;
    
    res.json({
      success: true,
      count: books.length,
      books
    });
  } catch (error) {
    console.error('❌ Get Books Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @route   GET /api/books/featured
// @desc    Get featured books
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const books = await Book.find({
      $or: [
        { discount: { $gt: 0 } },
        { rating: { $gte: 4.5 } }
      ]
    })
    .sort({ discount: -1, rating: -1 })
    .limit(8);
    
    res.json({
      success: true,
      count: books.length,
      books
    });
  } catch (error) {
    console.error('❌ Get Featured Books Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @route   GET /api/books/genre/:genre
// @desc    Get books by genre
// @access  Public
router.get('/genre/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const books = await Book.find({ genre: { $regex: genre, $options: 'i' } });
    
    res.json({
      success: true,
      count: books.length,
      books
    });
  } catch (error) {
    console.error('❌ Get Books By Genre Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @route   GET /api/books/:id
// @desc    Get single book
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }
    
    res.json({
      success: true,
      book
    });
  } catch (error) {
    console.error('❌ Get Book Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @route   GET /api/books/:id/reviews
// @desc    Get reviews for a book
// @access  Public
router.get('/:id/reviews', getReviews);

// ============================================
// PROTECTED ROUTES
// ============================================

// @route   POST /api/books/:id/reviews
// @desc    Add a review
// @access  Private
router.post('/:id/reviews', protect, addReview);

// @route   PUT /api/books/:id/reviews
// @desc    Update a review
// @access  Private
router.put('/:id/reviews', protect, updateReview);

// @route   DELETE /api/books/:id/reviews
// @desc    Delete a review
// @access  Private
router.delete('/:id/reviews', protect, deleteReview);

// ============================================
// ADMIN ROUTES
// ============================================

// @route   POST /api/books
// @desc    Create new book (Admin only)
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const bookData = {
      ...req.body,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      discount: parseFloat(req.body.discount) || 0,
      rating: parseFloat(req.body.rating) || 0,
      publishedYear: parseInt(req.body.publishedYear) || null,
      pages: parseInt(req.body.pages) || null
    };
    const book = await Book.create(bookData);
    res.status(201).json({ success: true, book });
  } catch (error) {
    console.error('❌ Create Book Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @route   PUT /api/books/:id
// @desc    Update book (Admin only)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const bookData = {
      ...req.body,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      discount: parseFloat(req.body.discount) || 0,
      rating: parseFloat(req.body.rating) || 0,
      publishedYear: parseInt(req.body.publishedYear) || null,
      pages: parseInt(req.body.pages) || null
    };
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      bookData,
      { new: true, runValidators: true }
    );
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ success: true, book });
  } catch (error) {
    console.error('❌ Update Book Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete book (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Book deleted' });
  } catch (error) {
    console.error('❌ Delete Book Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;
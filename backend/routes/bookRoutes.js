// backend/routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { protect, authorize } = require('../middleware/auth');
const { addReview, updateReview, deleteReview } = require('../controllers/reviewController');

// @route   GET /api/books
// @desc    Get all books
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { genre, search, sort } = req.query;
    
    let query = {};
    
    if (genre) query.genre = genre;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }
    
    let booksQuery = Book.find(query);
    
    if (sort) {
      if (sort === 'price-low') booksQuery.sort({ price: 1 });
      else if (sort === 'price-high') booksQuery.sort({ price: -1 });
      else if (sort === 'rating') booksQuery.sort({ rating: -1 });
      else if (sort === 'title') booksQuery.sort({ title: 1 });
    }
    
    const books = await booksQuery;
    
    res.json({
      success: true,
      count: books.length,
      books
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/books/:id
// @desc    Get single book
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json({
      success: true,
      book
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/books
// @desc    Create new book (Admin only)
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      book
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/books/:id
// @desc    Update book (Admin only)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({
      success: true,
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete book (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// ✅ REVIEW ROUTES
// ============================================

// @route   POST /api/books/:id/reviews
// @desc    Add a review to a book
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

module.exports = router;
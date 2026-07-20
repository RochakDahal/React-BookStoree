// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  createBook, 
  updateBook, 
  deleteBook, 
  updateOrderStatus, 
  getAllUsers,
  updateUserRole
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const Book = require('../models/Book');

// Protect all admin routes
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

// Orders
router.put('/orders/:id', updateOrderStatus);

// Books
router.post('/books', createBook);
router.put('/books/:id', updateBook);
router.delete('/books/:id', deleteBook);

// ✅ Get all reviews (admin)
router.get('/reviews', async (req, res) => {
  try {
    const books = await Book.find().populate('reviews.user', 'firstName lastName email');
    const allReviews = [];
    books.forEach(book => {
      book.reviews.forEach(review => {
        allReviews.push({
          ...review._doc,
          bookTitle: book.title,
          bookId: book._id
        });
      });
    });
    // Sort by createdAt descending
    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({
      success: true,
      count: allReviews.length,
      reviews: allReviews
    });
  } catch (error) {
    console.error('❌ Get All Reviews Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
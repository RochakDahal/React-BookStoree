// backend/controllers/reviewController.js
const Book = require('../models/Book');

// ✅ Add a review
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const bookId = req.params.id;
    const userId = req.user.id;
    const userName = req.user.firstName + ' ' + req.user.lastName;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rating between 1 and 5'
      });
    }

    if (!comment || comment.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a comment'
      });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if user already reviewed
    const existingReview = book.reviews?.find(
      review => review.user.toString() === userId
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this book'
      });
    }

    const review = {
      user: userId,
      userName: userName,
      rating,
      comment: comment.trim()
    };

    if (!book.reviews) {
      book.reviews = [];
    }
    book.reviews.push(review);

    // Update average rating
    const totalRating = book.reviews.reduce((sum, r) => sum + r.rating, 0);
    book.rating = totalRating / book.reviews.length;

    await book.save();
    await book.populate('reviews.user', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      reviews: book.reviews,
      rating: book.rating
    });

  } catch (error) {
    console.error('❌ Add Review Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ Update a review
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const bookId = req.params.id;
    const userId = req.user.id;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const reviewIndex = book.reviews?.findIndex(
      review => review.user.toString() === userId
    );

    if (reviewIndex === -1 || reviewIndex === undefined) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (rating) book.reviews[reviewIndex].rating = rating;
    if (comment !== undefined) book.reviews[reviewIndex].comment = comment.trim();

    const totalRating = book.reviews.reduce((sum, r) => sum + r.rating, 0);
    book.rating = totalRating / book.reviews.length;

    await book.save();
    await book.populate('reviews.user', 'firstName lastName');

    res.json({
      success: true,
      message: 'Review updated successfully',
      reviews: book.reviews,
      rating: book.rating
    });

  } catch (error) {
    console.error('❌ Update Review Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const reviewIndex = book.reviews?.findIndex(
      review => review.user.toString() === userId
    );

    if (reviewIndex === -1 || reviewIndex === undefined) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    book.reviews.splice(reviewIndex, 1);

    if (book.reviews.length > 0) {
      const totalRating = book.reviews.reduce((sum, r) => sum + r.rating, 0);
      book.rating = totalRating / book.reviews.length;
    } else {
      book.rating = 0;
    }

    await book.save();

    res.json({
      success: true,
      message: 'Review deleted successfully',
      reviews: book.reviews,
      rating: book.rating
    });

  } catch (error) {
    console.error('❌ Delete Review Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ Get all reviews for a book
exports.getReviews = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId).populate('reviews.user', 'firstName lastName');

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      reviews: book.reviews || [],
      rating: book.rating || 0,
      totalReviews: book.reviews?.length || 0
    });

  } catch (error) {
    console.error('❌ Get Reviews Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
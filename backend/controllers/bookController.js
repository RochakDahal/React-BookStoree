// backend/controllers/bookController.js
const Book = require('../models/Book');

// @desc    Get all books with filtering, sorting, and discount
// @route   GET /api/books
// @access  Public
exports.getBooks = async (req, res) => {
  try {
    const { genre, search, sort, minPrice, maxPrice, onSale } = req.query;
    
    let query = {};
    
    // Filter by genre
    if (genre) query.genre = genre;
    
    // Search by title or author
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // ✅ Filter books on sale (discount > 0)
    if (onSale === 'true') {
      query.discount = { $gt: 0 };
    }
    
    let booksQuery = Book.find(query);
    
    // Sorting
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
};

// @desc    Get single book with discount
// @route   GET /api/books/:id
// @access  Public
exports.getBookById = async (req, res) => {
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
};

// @desc    Create new book (Admin only)
// @route   POST /api/admin/books
// @access  Private/Admin
exports.createBook = async (req, res) => {
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
    
    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      book
    });
  } catch (error) {
    console.error('❌ Create Book Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Update book (Admin only)
// @route   PUT /api/admin/books/:id
// @access  Private/Admin
exports.updateBook = async (req, res) => {
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

    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }

    res.json({
      success: true,
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    console.error('❌ Update Book Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Delete book (Admin only)
// @route   DELETE /api/admin/books/:id
// @access  Private/Admin
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete Book Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get books by genre
// @route   GET /api/books/genre/:genre
// @access  Public
exports.getBooksByGenre = async (req, res) => {
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
};

// @desc    Get featured books (with discount or high rating)
// @route   GET /api/books/featured
// @access  Public
exports.getFeaturedBooks = async (req, res) => {
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
};
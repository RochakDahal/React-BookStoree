// backend/controllers/adminController.js
const Order = require('../models/Order');
const Book = require('../models/Book');
const User = require('../models/User');
const Contact = require('../models/Contact');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalContacts = await Contact.countDocuments();
    
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    // ✅ Get recent reviews
    const recentReviews = await Book.aggregate([
      { $unwind: '$reviews' },
      { $sort: { 'reviews.createdAt': -1 } },
      { $limit: 5 },
      {
        $project: {
          userName: '$reviews.userName',
          rating: '$reviews.rating',
          comment: '$reviews.comment',
          bookTitle: '$title',
          createdAt: '$reviews.createdAt'
        }
      }
    ]);

    // ✅ Get recent contacts
    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalBooks,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders,
        recentReviews,
        recentContacts,
        totalContacts
      }
    });
  } catch (error) {
    console.error('❌ Dashboard Stats Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ 
      success: true, 
      count: users.length, 
      users 
    });
  } catch (error) {
    console.error('❌ Get Users Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ✅ @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "user" or "admin"'
      });
    }

    if (req.user.id === id && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove your own admin status'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user
    });
  } catch (error) {
    console.error('❌ Update User Role Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create a new book
// @route   POST /api/admin/books
// @access  Private/Admin
exports.createBook = async (req, res) => {
  try {
    const bookData = {
      ...req.body,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      discount: parseFloat(req.body.discount) || 0,
      previousDiscount: parseFloat(req.body.previousDiscount) || 0,
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
};

// @desc    Update a book
// @route   PUT /api/admin/books/:id
// @access  Private/Admin
exports.updateBook = async (req, res) => {
  try {
    const bookData = {
      ...req.body,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      discount: parseFloat(req.body.discount) || 0,
      previousDiscount: parseFloat(req.body.previousDiscount) || 0,
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
};

// @desc    Delete a book
// @route   DELETE /api/admin/books/:id
// @access  Private/Admin
exports.deleteBook = async (req, res) => {
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
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus, paymentStatus },
      { new: true }
    ).populate('user', 'firstName lastName email');
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ success: true, order });
  } catch (error) {
    console.error('❌ Update Order Status Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
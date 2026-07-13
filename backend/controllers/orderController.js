// backend/controllers/orderController.js
const Order = require('../models/Order');
const Book = require('../models/Book');
const Cart = require('../models/Cart');

// ✅ Create Order
exports.createOrder = async (req, res) => {
  try {
    const { items, totalPrice, deliveryFee, paymentMethod, shippingAddress } = req.body;

    // ✅ Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order must contain at least one item' 
      });
    }

    // ✅ Validate stock and prepare items
    const validatedItems = [];
    for (const item of items) {
      const book = await Book.findById(item.bookId);
      if (!book) {
        return res.status(404).json({ 
          success: false, 
          message: `Book not found: ${item.title || 'Unknown'}` 
        });
      }
      
      if (book.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for "${book.title}". Available: ${book.stock}` 
        });
      }

      // ✅ Reduce stock
      book.stock -= item.quantity;
      await book.save();

      validatedItems.push({
        bookId: book._id,
        title: book.title,
        price: book.price,
        quantity: item.quantity,
        coverImage: book.coverImage || ''
      });
    }

    // ✅ Create order
    const order = await Order.create({
      user: req.user.id,
      items: validatedItems,
      totalPrice,
      deliveryFee: deliveryFee || 0,
      paymentMethod,
      shippingAddress,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus: 'pending'
    });

    // ✅ Clear user's cart
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [] }
    );

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order'
    });
  }
};

// ✅ Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.bookId', 'title price coverImage');

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ Get single order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('items.bookId', 'title price coverImage');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this order'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get Order Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus: status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update Order Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;
    const { id } = req.params;

    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { 
        paymentStatus: paymentStatus,
        transactionId: transactionId || order.transactionId
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update Payment Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
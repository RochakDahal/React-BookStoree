// backend/controllers/orderController.js
const Order = require('../models/Order');
const Book = require('../models/Book');
const Cart = require('../models/Cart');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { getOrderStatusUpdateEmail } = require('../utils/emailTemplates');

// ✅ Create Order - paymentStatus is set based on payment method
exports.createOrder = async (req, res) => {
  try {
    const { items, deliveryFee, paymentMethod, shippingAddress } = req.body;

    console.log('📝 Creating order for user:', req.user.id);

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    let subtotal = 0;
    let totalDiscount = 0;
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

      const hasDiscount = book.discount && book.discount > 0;
      const originalPrice = book.price;
      const discountPercent = hasDiscount ? book.discount : 0;
      const discountedPrice = hasDiscount 
        ? book.price - (book.price * book.discount / 100) 
        : book.price;

      const itemSubtotal = originalPrice * item.quantity;
      const itemDiscount = hasDiscount 
        ? (originalPrice - discountedPrice) * item.quantity 
        : 0;

      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;

      book.stock -= item.quantity;
      await book.save();

      validatedItems.push({
        bookId: book._id,
        title: book.title,
        price: originalPrice,
        discount: discountPercent,
        discountedPrice: discountedPrice,
        quantity: item.quantity,
        coverImage: book.coverImage || ''
      });
    }

    const totalPrice = subtotal - totalDiscount + (deliveryFee || 0);

    // ✅ For COD, paymentStatus is 'confirmed' immediately
    const paymentStatus = paymentMethod === 'cod' ? 'confirmed' : 'failed';

    const order = await Order.create({
      user: req.user.id,
      items: validatedItems,
      subtotal,
      totalDiscount,
      totalPrice,
      deliveryFee: deliveryFee || 0,
      paymentMethod,
      shippingAddress,
      paymentStatus: paymentStatus,
      orderStatus: 'pending'
    });

    console.log('✅ Order created:', order._id);

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
    console.error('❌ Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order'
    });
  }
};

// ✅ Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    console.log('📝 Fetching orders for user:', req.user.id);
    
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.bookId', 'title price coverImage');

    console.log(`✅ Found ${orders.length} orders`);

    res.json({
      success: true,
      orders: orders || []
    });
  } catch (error) {
    console.error('❌ Get Orders Error:', error);
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
    console.error('❌ Get Order Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ Update order status - Sends email notification to user
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status. Allowed: pending, shipped, delivered, cancelled'
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    const isAdmin = req.user.role === 'admin';
    const isOwner = order.user.toString() === req.user.id;
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this order'
      });
    }

    if (order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot update order that is already ${order.orderStatus}`
      });
    }

    const oldStatus = order.orderStatus;
    order.orderStatus = status;
    await order.save();

    console.log(`✅ Order status updated from ${oldStatus} to ${status} for order:`, order._id);
    console.log(`👤 Updated by: ${isAdmin ? 'Admin' : 'User'}`);

    // ✅ Send status update email to user
    try {
      const user = await User.findById(order.user);
      if (user && user.email) {
        console.log(`📧 Sending status update email to: ${user.email}`);
        const emailHtml = getOrderStatusUpdateEmail(order, user, oldStatus, status);
        await sendEmail({
          to: user.email,
          subject: `📦 Order Status Update - #${order.orderNumber || order._id.slice(-8).toUpperCase()}`,
          html: emailHtml
        });
        console.log('✅ Status update email sent to:', user.email);
      } else {
        console.log('⚠️ User or email not found, skipping email');
      }
    } catch (emailError) {
      console.error('❌ Failed to send status update email:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('❌ Update Order Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ Update payment status - Admin only
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const { id } = req.params;

    const validStatuses = ['confirmed', 'failed'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status. Allowed: confirmed, failed'
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { paymentStatus: paymentStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log(`✅ Payment status updated to ${paymentStatus} for order:`, order._id);

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      order
    });
  } catch (error) {
    console.error('❌ Update Payment Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// backend/controllers/invoiceController.js
const PDFDocument = require('pdfkit');
const Order = require('../models/Order');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { getOrderConfirmationEmail } = require('../utils/emailTemplates');

// @desc    Generate and download PDF Invoice
// @route   GET /api/orders/:id/invoice
// @access  Private
exports.generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.bookId', 'title price coverImage')
      .populate('user', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check authorization
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view this invoice' 
      });
    }

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${order.orderNumber || order._id.slice(-8)}.pdf`);

    // Create PDF document
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4'
    });
    doc.pipe(res);

    // ============================================
    // HEADER
    // ============================================
    doc.fontSize(28)
       .fillColor('#14b8a6')
       .text('📚 BookShell', { align: 'center' });
    
    doc.fontSize(12)
       .fillColor('#6b7280')
       .text('Your trusted online bookstore', { align: 'center' });
    
    doc.moveDown(2);

    // ============================================
    // INVOICE TITLE
    // ============================================
    doc.fontSize(22)
       .fillColor('#111827')
       .text('INVOICE', { align: 'center' });
    
    doc.moveDown(1);

    // ============================================
    // ORDER DETAILS
    // ============================================
    doc.fontSize(10)
       .fillColor('#4b5563');
    
    doc.text(`Order Number: ${order.orderNumber || order._id.slice(-8).toUpperCase()}`, 50, doc.y);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 50, doc.y);
    doc.text(`Payment Method: ${order.paymentMethod.toUpperCase()}`, 50, doc.y);
    doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, 50, doc.y);
    doc.text(`Order Status: ${order.orderStatus.toUpperCase()}`, 50, doc.y);
    
    doc.moveDown(1.5);

    // ============================================
    // BILLING ADDRESS
    // ============================================
    doc.fontSize(12)
       .fillColor('#111827')
       .text('Billing Address', { underline: true });
    
    doc.fontSize(10)
       .fillColor('#4b5563');
    
    doc.text(`Name: ${order.shippingAddress?.fullName || 'N/A'}`, 50, doc.y);
    doc.text(`Address: ${order.shippingAddress?.address || 'N/A'}`, 50, doc.y);
    doc.text(`City: ${order.shippingAddress?.city || 'N/A'}`, 50, doc.y);
    doc.text(`Phone: ${order.shippingAddress?.phone || 'N/A'}`, 50, doc.y);
    doc.text(`Email: ${order.shippingAddress?.email || 'N/A'}`, 50, doc.y);
    
    doc.moveDown(1.5);

    // ============================================
    // ITEMS TABLE
    // ============================================
    const tableTop = doc.y;
    
    // Table Header
    doc.fontSize(10)
       .fillColor('#111827');
    
    const col1 = 50;
    const col2 = 250;
    const col3 = 380;
    const col4 = 480;
    
    doc.text('Item', col1, tableTop);
    doc.text('Qty', col2, tableTop);
    doc.text('Price', col3, tableTop);
    doc.text('Total', col4, tableTop);
    
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    doc.moveDown(0.5);

    // Table Items
    let totalAmount = 0;
    const startY = doc.y;
    
    order.items.forEach((item, index) => {
      const yPosition = startY + (index * 25);
      const itemTotal = item.quantity * (item.discountedPrice || item.price);
      totalAmount += itemTotal;
      
      doc.fontSize(9)
         .fillColor('#4b5563');
      
      // Item name (with discount badge if applicable)
      let itemName = item.title || 'Book';
      if (item.discount > 0) {
        itemName += ` (${item.discount}% off)`;
      }
      doc.text(itemName, col1, yPosition, { width: 190 });
      doc.text(item.quantity.toString(), col2, yPosition);
      doc.text(`Rs. ${(item.discountedPrice || item.price).toFixed(2)}`, col3, yPosition);
      doc.text(`Rs. ${itemTotal.toFixed(2)}`, col4, yPosition);
    });

    // Move to end of items
    const itemsEndY = startY + (order.items.length * 25);
    doc.y = itemsEndY + 10;

    // Table Footer Line
    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    doc.moveDown(1);

    // ============================================
    // ORDER SUMMARY
    // ============================================
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    doc.fontSize(10)
       .fillColor('#4b5563');
    
    // Subtotal
    doc.text('Subtotal:', { align: 'right' });
    doc.text(`Rs. ${subtotal.toFixed(2)}`, { align: 'right' });
    
    // Discount
    if (order.totalDiscount > 0) {
      doc.text('Discount:', { align: 'right' });
      doc.text(`- Rs. ${order.totalDiscount.toFixed(2)}`, { align: 'right' });
    }
    
    // Delivery Fee
    doc.text('Delivery Fee:', { align: 'right' });
    doc.text(`Rs. ${order.deliveryFee.toFixed(2)}`, { align: 'right' });
    
    doc.moveDown(0.5);
    
    // Total
    doc.fontSize(14)
       .fillColor('#14b8a6');
    doc.text('Total:', { align: 'right' });
    doc.text(`Rs. ${order.totalPrice.toFixed(2)}`, { align: 'right' });

    doc.moveDown(1.5);

    // ============================================
    // TRANSACTION DETAILS
    // ============================================
    if (order.transactionId) {
      doc.fontSize(9)
         .fillColor('#6b7280');
      doc.text(`Transaction ID: ${order.transactionId}`, { align: 'center' });
      doc.moveDown(0.5);
    }

    // ============================================
    // FOOTER
    // ============================================
    doc.moveDown(2);
    doc.fontSize(10)
       .fillColor('#6b7280')
       .text('Thank you for shopping with BookShell!', { align: 'center' });
    
    doc.fontSize(8)
       .fillColor('#9ca3af')
       .text('© 2024 BookShell. All rights reserved.', { align: 'center' });
    
    doc.text('📧 support@bookshell.com | 📞 +977-9800000000 | 📍 Kathmandu, Nepal', { align: 'center' });

    // ============================================
    // END PDF
    // ============================================
    doc.end();

    console.log('✅ Invoice generated for order:', order._id);

  } catch (error) {
    console.error('❌ Invoice generation error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Send invoice via email
// @route   POST /api/orders/:id/send-invoice
// @access  Private
exports.sendInvoiceEmail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.bookId', 'title price coverImage')
      .populate('user', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check authorization
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }

    // Generate email HTML
    const user = order.user;
    const emailHtml = getOrderConfirmationEmail(order, user);

    // Send email
    await sendEmail({
      to: user.email,
      subject: `Your Invoice - Order #${order.orderNumber || order._id.slice(-8).toUpperCase()}`,
      html: emailHtml
    });

    console.log('✅ Invoice email sent to:', user.email);

    res.json({
      success: true,
      message: 'Invoice email sent successfully'
    });

  } catch (error) {
    console.error('❌ Send invoice email error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
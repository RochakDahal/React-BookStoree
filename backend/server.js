// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));

// ============================================
// ✅ TEST ENDPOINTS (for debugging)
// ============================================

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BookShell API is running',
    timestamp: new Date().toISOString()
  });
});

// ✅ Test Email Configuration
app.get('/api/test-email-config', (req, res) => {
  res.json({
    emailHost: process.env.EMAIL_HOST || '❌ Not set',
    emailPort: process.env.EMAIL_PORT || '❌ Not set',
    emailUsername: process.env.EMAIL_USERNAME || '❌ Not set',
    emailPassword: process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set',
    emailFromName: process.env.EMAIL_FROM_NAME || '❌ Not set',
    emailFromAddress: process.env.EMAIL_FROM_ADDRESS || '❌ Not set',
    stripeSecret: process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Not set',
    frontendUrl: process.env.FRONTEND_URL || '❌ Not set'
  });
});

// ✅ Test Email Send
app.get('/api/test-email', async (req, res) => {
  try {
    const sendEmail = require('./utils/sendEmail');
    
    console.log('📧 Testing email configuration...');
    
    const result = await sendEmail({
      to: process.env.EMAIL_USERNAME,
      subject: '✅ Test Email from BookShell',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f9fafb; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            h1 { color: #14b8a6; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📚 BookShell</h1>
            <h2>✅ Test Email</h2>
            <p>If you're reading this, your email configuration is working perfectly!</p>
            <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>From:</strong> ${process.env.EMAIL_FROM_NAME} (${process.env.EMAIL_FROM_ADDRESS})</p>
            <div class="footer">
              <p>© 2024 BookShell. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    
    res.json({ 
      success: true, 
      message: '✅ Test email sent successfully!',
      info: {
        messageId: result.messageId,
        to: result.envelope?.to || process.env.EMAIL_USERNAME
      }
    });
  } catch (error) {
    console.error('❌ Test email error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ✅ Test Invoice Generation (if pdfkit is installed)
app.get('/api/test-invoice', (req, res) => {
  try {
    const PDFDocument = require('pdfkit');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=test-invoice.pdf');
    
    const doc = new PDFDocument();
    doc.pipe(res);
    
    doc.fontSize(28)
       .fillColor('#14b8a6')
       .text('📚 BookShell', { align: 'center' });
    doc.fontSize(14)
       .fillColor('#6b7280')
       .text('Test Invoice', { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(12)
       .fillColor('#111827')
       .text('This is a test invoice to verify PDF generation is working.');
    doc.moveDown(1);
    doc.text('If you see this PDF, the invoice generation is working!');
    doc.moveDown(2);
    doc.fontSize(10)
       .fillColor('#6b7280')
       .text('© 2024 BookShell. All rights reserved.', { align: 'center' });
    
    doc.end();
    
    console.log('✅ Test invoice generated');
  } catch (error) {
    console.error('❌ Test invoice error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ✅ ERROR HANDLER
// ============================================

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: err.message || 'Something went wrong!' 
  });
});

// ============================================
// ✅ 404 Handler
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ============================================
// ✅ START SERVER
// ============================================

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/book';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📦 Database: ${MONGO_URI}`);
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📡 Health: http://localhost:${PORT}/api/health`);
      console.log(`📡 Test Email: http://localhost:${PORT}/api/test-email`);
      console.log(`📡 Email Config: http://localhost:${PORT}/api/test-email-config`);
      console.log(`📡 Test Invoice: http://localhost:${PORT}/api/test-invoice`);
      console.log(`📡 Admin Orders: http://localhost:${PORT}/api/admin/orders`);
      
      // Log email configuration status
      console.log('\n📧 Email Configuration:');
      console.log(`   Host: ${process.env.EMAIL_HOST || '❌ Not set'}`);
      console.log(`   Port: ${process.env.EMAIL_PORT || '❌ Not set'}`);
      console.log(`   Username: ${process.env.EMAIL_USERNAME || '❌ Not set'}`);
      console.log(`   Password: ${process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set'}`);
      console.log(`   From Name: ${process.env.EMAIL_FROM_NAME || '❌ Not set'}`);
      console.log(`   From Address: ${process.env.EMAIL_FROM_ADDRESS || '❌ Not set'}`);
      
      // Log Stripe configuration status
      console.log('\n💳 Stripe Configuration:');
      console.log(`   Secret Key: ${process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Not set'}`);
      console.log(`   Webhook Secret: ${process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Not set'}`);
      
      console.log('\n🚀 Server ready!');
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });
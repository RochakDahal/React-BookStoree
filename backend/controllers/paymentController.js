// backend/controllers/paymentController.js
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const { generateUniqueId } = require('../utils/helper');
const { getEsewaPaymentData } = require('../utils/esewaHelper');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

// ✅ @desc    Initiate payment (eSewa/Stripe)
// @route   POST /api/payments/initiate
// @access  Private
exports.initiatePayment = async (req, res) => {
  try {
    const { orderId, paymentGateway } = req.body;
    
    console.log('📝 Initiating payment:', { orderId, paymentGateway });

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }

    const transactionUuid = generateUniqueId();

    // ✅ eSewa Payment (Working - DO NOT CHANGE)
    if (paymentGateway === 'esewa') {
      console.log('🔄 Processing eSewa payment...');
      
      await Transaction.create({
        orderId: order._id,
        user: req.user.id,
        amount: order.totalPrice,
        paymentGateway: 'esewa',
        productId: transactionUuid,
        status: 'PENDING'
      });

      const formData = getEsewaPaymentData({
        amount: order.totalPrice,
        transaction_uuid: transactionUuid,
        successUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success`,
        failureUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-failure`
      });

      return res.json({
        success: true,
        paymentMethod: 'esewa',
        transactionUuid: transactionUuid,
        formData: formData
      });
    }

    // ✅ Stripe Checkout Session (Redirect like eSewa)
    if (paymentGateway === 'stripe') {
      console.log('🔄 Processing Stripe Checkout payment...');
      
      // ✅ Create Stripe Checkout Session (redirects to Stripe hosted page)
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'npr',
              product_data: {
                name: `BookShell Order #${order.orderNumber || order._id}`,
                description: `Order containing ${order.items?.length || 0} items`,
              },
              unit_amount: Math.round(order.totalPrice * 100), // Convert to paisa
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        customer_email: req.user.email,
        client_reference_id: order._id.toString(),
        metadata: {
          orderId: order._id.toString(),
          transactionId: transactionUuid
        },
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}&orderId=${order._id}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-failure`,
      });

      // Save transaction record
      await Transaction.create({
        orderId: order._id,
        user: req.user.id,
        amount: order.totalPrice,
        paymentGateway: 'stripe',
        productId: transactionUuid,
        transactionId: session.id,
        status: 'PENDING'
      });

      return res.json({
        success: true,
        paymentMethod: 'stripe',
        sessionUrl: session.url,  // ✅ This is the redirect URL
        sessionId: session.id,
        transactionId: transactionUuid
      });
    }

    return res.status(400).json({ 
      success: false,
      message: 'Invalid payment gateway' 
    });

  } catch (error) {
    console.error('❌ Payment initiation error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Payment initiation failed',
      error: error.message
    });
  }
};

// ✅ @desc    Complete eSewa payment (callback) - DO NOT CHANGE
// @route   GET /api/payments/complete
// @access  Public
exports.completePayment = async (req, res) => {
  try {
    const { data, orderId } = req.query;

    console.log('📥 Complete payment called');
    console.log('📦 Data received:', data ? 'Yes' : 'No');
    console.log('📦 Order ID from query:', orderId);

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'No payment data received'
      });
    }

    // Decode the base64 data from eSewa
    let decodedData;
    try {
      const decodedString = Buffer.from(data, 'base64').toString('utf-8');
      decodedData = JSON.parse(decodedString);
      console.log('✅ Decoded data:', decodedData);
    } catch (error) {
      console.error('❌ Failed to decode data:', error);
      return res.status(400).json({
        success: false,
        message: 'Invalid payment data format'
      });
    }

    const transactionUuid = decodedData.transaction_uuid;
    console.log('📦 Transaction UUID from decoded data:', transactionUuid);

    // Find the order
    let order = null;
    
    if (orderId && orderId !== 'null' && orderId !== 'undefined') {
      try {
        order = await Order.findById(orderId);
        if (order) {
          console.log('✅ Found order by orderId:', order._id);
        }
      } catch (err) {
        console.log('⚠️ Could not find by orderId:', err.message);
      }
    }

    if (!order) {
      try {
        const transaction = await Transaction.findOne({ productId: transactionUuid });
        if (transaction) {
          order = await Order.findById(transaction.orderId);
          if (order) {
            console.log('✅ Found order by transaction productId:', order._id);
          }
        }
      } catch (err) {
        console.log('⚠️ Could not find by transaction:', err.message);
      }
    }

    if (!order) {
      try {
        order = await Order.findOne({ orderNumber: transactionUuid });
        if (order) {
          console.log('✅ Found order by orderNumber:', order._id);
        }
      } catch (err) {
        console.log('⚠️ Could not find by orderNumber:', err.message);
      }
    }

    if (!order) {
      console.error('❌ Order not found for UUID:', transactionUuid);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('✅ Order found:', order._id);

    let transaction = await Transaction.findOne({ 
      productId: transactionUuid 
    });

    if (!transaction) {
      transaction = await Transaction.findOne({ 
        orderId: order._id,
        paymentGateway: 'esewa'
      });
    }

    if (decodedData.status === 'COMPLETE') {
      console.log('✅ Payment status is COMPLETE from decoded data');
      
      if (transaction) {
        transaction.status = 'COMPLETED';
        transaction.transactionId = decodedData.transaction_code || 'ESEWA-' + Date.now();
        await transaction.save();
        console.log('✅ Transaction updated:', transaction);
      } else {
        await Transaction.create({
          orderId: order._id,
          user: order.user,
          amount: order.totalPrice,
          paymentGateway: 'esewa',
          productId: transactionUuid,
          transactionId: decodedData.transaction_code || 'ESEWA-' + Date.now(),
          status: 'COMPLETED'
        });
        console.log('✅ Transaction created');
      }

      order.paymentStatus = 'completed';
      order.orderStatus = 'confirmed';
      order.transactionId = decodedData.transaction_code || 'ESEWA-' + Date.now();
      await order.save();

      console.log('✅ Order confirmed:', order._id);

      return res.json({
        success: true,
        message: 'Payment completed successfully',
        order: order
      });
    }

    // Try external verification
    try {
      console.log('🔄 Attempting external verification with eSewa API...');
      
      const verifyResponse = await axios.get(
        `https://rc-esewa.com.np/api/epay/transaction/status/`,
        {
          params: {
            product_code: process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST',
            total_amount: decodedData.total_amount,
            transaction_uuid: transactionUuid
          },
          timeout: 10000
        }
      );

      console.log('✅ eSewa verification response:', verifyResponse.data);

      if (verifyResponse.data.status === 'COMPLETE') {
        if (transaction) {
          transaction.status = 'COMPLETED';
          transaction.transactionId = verifyResponse.data.ref_id || decodedData.transaction_code;
          await transaction.save();
        }

        order.paymentStatus = 'completed';
        order.orderStatus = 'confirmed';
        order.transactionId = verifyResponse.data.ref_id || decodedData.transaction_code;
        await order.save();

        console.log('✅ Order confirmed via external verification:', order._id);

        return res.json({
          success: true,
          message: 'Payment verified successfully',
          order: order
        });
      }
    } catch (verifyError) {
      console.warn('⚠️ External verification failed:', verifyError.message);
      
      if (decodedData.status === 'COMPLETE') {
        console.log('✅ Using decoded data to confirm order (fallback)');
        
        if (transaction) {
          transaction.status = 'COMPLETED';
          transaction.transactionId = decodedData.transaction_code;
          await transaction.save();
        }

        order.paymentStatus = 'completed';
        order.orderStatus = 'confirmed';
        order.transactionId = decodedData.transaction_code;
        await order.save();

        return res.json({
          success: true,
          message: 'Payment completed successfully (fallback)',
          order: order
        });
      }
    }

    console.log('❌ Payment verification failed - marking order as failed');
    
    if (transaction) {
      transaction.status = 'FAILED';
      await transaction.save();
    }

    order.paymentStatus = 'failed';
    order.orderStatus = 'cancelled';
    await order.save();

    return res.status(400).json({
      success: false,
      message: 'Payment verification failed',
      order: order
    });

  } catch (error) {
    console.error('❌ Complete payment error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Payment completion failed: ' + error.message
    });
  }
};

// ✅ @desc    Verify Stripe Checkout Session
// @route   GET /api/payments/stripe/verify-session
// @access  Public
exports.verifyStripeSession = async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    console.log('📝 Verifying Stripe session:', sessionId);

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log('✅ Stripe session:', session);

    if (session.payment_status === 'paid') {
      const orderId = session.client_reference_id;
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const transaction = await Transaction.findOne({
        orderId: orderId,
        paymentGateway: 'stripe'
      });

      if (transaction && transaction.status !== 'COMPLETED') {
        transaction.status = 'COMPLETED';
        transaction.transactionId = sessionId;
        await transaction.save();
      }

      if (order.paymentStatus !== 'completed') {
        order.paymentStatus = 'completed';
        order.orderStatus = 'confirmed';
        order.transactionId = sessionId;
        await order.save();
      }

      return res.json({
        success: true,
        message: 'Payment verified successfully',
        orderId: orderId
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed. Status: ' + session.payment_status
      });
    }
  } catch (error) {
    console.error('❌ Stripe session verification error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Stripe verification failed',
      error: error.message
    });
  }
};

// ✅ @desc    Confirm COD order
// @route   POST /api/payments/cod-confirm
// @access  Private
exports.confirmCOD = async (req, res) => {
  try {
    const { orderId } = req.body;

    console.log('📝 Confirming COD order:', orderId);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }

    const productId = generateUniqueId();

    await Transaction.create({
      orderId: order._id,
      user: req.user.id,
      amount: order.totalPrice,
      paymentGateway: 'cod',
      productId,
      transactionId: `COD-${order.orderNumber || order._id}`,
      status: 'COMPLETED'
    });

    order.paymentStatus = 'completed';
    order.orderStatus = 'confirmed';
    order.transactionId = `COD-${order.orderNumber || order._id}`;
    await order.save();

    console.log('✅ COD order confirmed:', order._id);

    res.json({
      success: true,
      message: 'COD order confirmed',
      order: order
    });

  } catch (error) {
    console.error('❌ COD confirmation error:', error.message);
    res.status(500).json({
      success: false,
      message: 'COD confirmation failed',
      error: error.message
    });
  }
};

// ✅ @desc    Handle Stripe Webhook
// @route   POST /api/payments/stripe/webhook
// @access  Public
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.client_reference_id;
      const transactionId = session.id;

      console.log('✅ Stripe Checkout Session Completed:', session.id);
      console.log('📦 Order ID:', orderId);

      const order = await Order.findById(orderId);
      if (!order) {
        console.error('❌ Order not found:', orderId);
        return res.status(404).json({ error: 'Order not found' });
      }

      const transaction = await Transaction.findOne({
        orderId: orderId,
        paymentGateway: 'stripe'
      });

      if (transaction) {
        transaction.status = 'COMPLETED';
        transaction.transactionId = transactionId;
        await transaction.save();
        console.log('✅ Transaction updated:', transaction);
      }

      order.paymentStatus = 'completed';
      order.orderStatus = 'confirmed';
      order.transactionId = transactionId;
      await order.save();

      console.log('✅ Order confirmed via webhook:', order._id);
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const orderId = session.client_reference_id;

      console.log('⚠️ Stripe Checkout Session Expired:', session.id);

      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'failed';
        order.orderStatus = 'cancelled';
        await order.save();
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    res.status(500).json({ error: error.message });
  }
};
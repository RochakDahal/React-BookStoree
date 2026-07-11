const Order = require('../models/Order');
const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Verify eSewa Payment
// @route   GET /api/payments/esewa/verify
// @access  Private
exports.verifyEsewa = async (req, res) => {
  try {
    const { oid, amt, refId } = req.query; // eSewa returns these parameters
    
    // In production, you would call the eSewa verification API here.
    // For this implementation, we simulate a successful verification.
    // const response = await axios.get('https://uat.esewa.com.np/ep/transaction/download', { ... });
    
    const order = await Order.findOne({ orderNumber: oid });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Update order status
    order.paymentStatus = 'completed';
    order.transactionId = refId;
    order.paymentGateway = 'esewa';
    await order.save();

    res.json({ success: true, message: 'Payment verified successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

// @desc    Create Stripe Payment Intent
// @route   POST /api/payments/stripe/create-intent
// @access  Private
exports.createStripeIntent = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Stripe expects amount in the smallest currency unit (paisa for NPR)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100), 
      currency: 'npr',
      metadata: { orderId: order._id.toString() }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Handle Stripe Webhooks
// @route   POST /api/payments/stripe/webhook
// @access  Public (Secured by Stripe Signature)
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const session = event.data.object;
    const orderId = session.metadata.orderId;
    
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'completed',
      transactionId: session.id,
      paymentGateway: 'stripe'
    });
  }

  res.json({ received: true });
};
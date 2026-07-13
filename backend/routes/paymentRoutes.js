// backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  initiatePayment,
  completePayment,
  confirmCOD,
  verifyStripeSession,
  stripeWebhook
} = require('../controllers/paymentController');

// ✅ Initiate payment (eSewa/Stripe)
router.post('/initiate', protect, initiatePayment);

// ✅ Complete eSewa payment (callback)
router.get('/complete', completePayment);

// ✅ Verify Stripe session
router.get('/stripe/verify-session', verifyStripeSession);

// ✅ Stripe Webhook (raw body required)
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// ✅ Confirm COD
router.post('/cod-confirm', protect, confirmCOD);

module.exports = router;
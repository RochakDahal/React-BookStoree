const express = require('express');
const router = express.Router();
const { verifyEsewa, createStripeIntent, stripeWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');


router.get('/esewa/verify', protect, verifyEsewa);

router.post('/stripe/create-intent', protect, createStripeIntent);


router.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;
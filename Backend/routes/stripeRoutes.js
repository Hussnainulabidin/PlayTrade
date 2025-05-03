const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const authController = require('../controllers/authController');

// Webhook endpoint doesn't require authentication and should be defined BEFORE the auth middleware
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

// Protect all routes after this middleware - user must be logged in
router.use(authController.protect);

// Create a payment intent
router.post('/create-payment-intent', stripeController.createPaymentIntent);

// Get payment status
router.get('/status/:paymentIntentId', stripeController.getPaymentStatus);

module.exports = router; 
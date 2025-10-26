const express = require('express');
const router = express.Router();

const PaymentController = require('../../controllers/ClientControllers/PaymentController');
const verifyToken = require('../../middlewares/AuthMiddlewares');

// Webhook route - MUST use raw body (express.raw)
// This should be registered in main app BEFORE express.json()
router.post('/webhook', express.raw({ type: 'application/json' }), PaymentController.webhook);

// Create payment intent for native card input (NEW - simpler than checkout)
router.post('/create-intent', verifyToken, PaymentController.createPaymentIntent);

// Confirm payment after successful Stripe payment
router.post('/confirm', verifyToken, PaymentController.confirmPayment);

// Checkout route - requires authentication (for web-based checkout)
router.post('/checkout', verifyToken, PaymentController.checkout);

// Success callback
router.get('/success', PaymentController.success);

// Get payment history for current user
router.get('/history', verifyToken, PaymentController.getPaymentHistory);

// Get payment details by ID
router.get('/:paymentId', verifyToken, PaymentController.getPaymentById);

// Cancel payment
router.post('/:paymentId/cancel', verifyToken, PaymentController.cancelPayment);

// Get subscription status
router.get('/subscription/status', verifyToken, PaymentController.getSubscriptionStatus);

module.exports = router;

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PaymentService = require('../../services/ClientServices/Payment.service');
const { asyncHandler } = require('../../utils/errorHandler');
const { sendData } = require('../../utils/response');

class PaymentController {
    /**
     * Create Payment Intent for native card input
     */
    createPaymentIntent = asyncHandler(async (req, res) => {
        const { amount, currency = 'usd' } = req.body;
        
        console.log('💳 [PaymentController] createPaymentIntent called:', {
            userId: req.user?.id,
            hasUser: !!req.user,
            amount,
            currency,
            body: req.body
        });
        
        if (!req.user || !req.user.id) {
            console.error('❌ [PaymentController] No user found in request');
            return sendData(res, { error: 'User not authenticated' }, 401);
        }
        
        const result = await PaymentService.createPaymentIntent(req.user.id, amount, currency);
        sendData(res, { success: true, ...result }, 200);
    });

    /**
     * Create Checkout Session
     */
    checkout = asyncHandler(async (req, res) => {
        const { amount, currency = 'usd', payment_method_types = ['card'] } = req.body;
        const isDevelopment = process.env.NODE_ENV !== 'production';
        const mobileScheme = 'jobbridge://';
        const origin = req.headers['x-app-origin'] || (isDevelopment ? 'exp://192.168.84.8:8081' : mobileScheme);
        
        const result = await PaymentService.createCheckout(req.user.id, amount, currency, payment_method_types, origin);
        sendData(res, { success: true, ...result }, 200);
    });

    /**
     * Webhook handler - Stripe sends events after payment
     */
    async webhook(req, res) {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error(' Missing STRIPE_WEBHOOK_SECRET');
            return res.status(500).send('Webhook secret not configured');
        }

        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        console.log('Webhook received:', event.type);

        try {
            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object;
                    await PaymentService.handleCheckoutCompleted(session);
                    break;
                }
                case 'payment_intent.succeeded': {
                    const paymentIntent = event.data.object;
                    await PaymentService.handlePaymentSucceeded(paymentIntent);
                    break;
                }
                case 'payment_intent.payment_failed': {
                    const paymentIntent = event.data.object;
                    await PaymentService.handlePaymentFailed(paymentIntent);
                    break;
                }
                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }

            return res.status(200).json({ received: true });

        } catch (err) {
            console.error(' Webhook processing error:', err);
            return res.status(500).json({ error: 'Webhook processing failed' });
        }
    }

    /**
     * Confirm payment after successful Stripe payment
     */
    confirmPayment = asyncHandler(async (req, res) => {
        const { payment_intent_id } = req.body;
        
        console.log(' Confirming payment:', payment_intent_id);
        
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
        console.log(' Stripe PaymentIntent status:', paymentIntent.status);
        
        if (paymentIntent.status !== 'succeeded') {
            return sendData(res, { error: 'Payment not completed', status: paymentIntent.status }, 400);
        }
        
        await PaymentService.handlePaymentSucceeded(paymentIntent);
        
        sendData(res, { 
            success: true, 
            message: 'Payment confirmed and account upgraded',
            user_level: 'premium'
        }, 200);
    });

    /**
     * Success callback
     */
    success = asyncHandler(async (req, res) => {
        const { session_id } = req.query;
        const session = await stripe.checkout.sessions.retrieve(session_id);
        await PaymentService.handleCheckoutCompleted(session);
        
        sendData(res, {
            success: true,
            message: 'Payment successful',
            payment_status: session.payment_status
        }, 200);
    });

    /**
     * Get payment history
     */
    getPaymentHistory = asyncHandler(async (req, res) => {
        const payments = await PaymentService.getPaymentHistory(req.user.id);
        sendData(res, { success: true, payments }, 200);
    });

    /**
     * Get payment by ID
     */
    getPaymentById = asyncHandler(async (req, res) => {
        const payment = await PaymentService.getPaymentById(req.params.paymentId, req.user.id);
        sendData(res, { success: true, payment }, 200);
    });

    /**
     * Cancel payment
     */
    cancelPayment = asyncHandler(async (req, res) => {
        const payment = await PaymentService.cancelPayment(req.params.paymentId, req.user.id);
        sendData(res, { success: true, message: 'Payment cancelled successfully', payment }, 200);
    });

    /**
     * Get subscription status
     */
    getSubscriptionStatus = asyncHandler(async (req, res) => {
        const subscription = await PaymentService.getUserSubscription(req.user.id);
        sendData(res, { success: true, subscription }, 200);
    });
}

module.exports = new PaymentController();
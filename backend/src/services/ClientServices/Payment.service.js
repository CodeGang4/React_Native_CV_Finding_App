const PaymentRepository = require('../../repositories/ClientRepositories/Payment.repository');
const PaymentCache = require('../../Cache/ClientCache/Payment.cache');
const CandidateCache = require('../../Cache/ClientCache/Candidate.cache');
const UserCache = require('../../Cache/ClientCache/User.cache');
const { AppError } = require('../../utils/errorHandler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
    /**
     * Create Payment Intent for native card input
     */
    static async createPaymentIntent(userId, amount, currency = 'usd') {
        if (!amount || Number(amount) <= 0) {
            throw new AppError('Invalid amount', 400);
        }

        console.log('💳 [PaymentService] Creating payment intent:', { amount, currency, userId });
        
        // Validate Stripe key
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('❌ [PaymentService] STRIPE_SECRET_KEY is missing in .env');
            throw new AppError('Payment service not configured', 500);
        }

        let paymentIntent;
        try {
            // Create Stripe PaymentIntent
            console.log('🔄 [PaymentService] Calling Stripe API...');
            paymentIntent = await stripe.paymentIntents.create({
                amount: Number(amount),
                currency,
                metadata: { user_id: userId },
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            
            console.log('✅ [PaymentService] Stripe PaymentIntent created:', paymentIntent.id);
        } catch (stripeError) {
            console.error('❌ [PaymentService] Stripe API error:', {
                message: stripeError.message,
                type: stripeError.type,
                code: stripeError.code,
                statusCode: stripeError.statusCode
            });
            throw new AppError(`Stripe error: ${stripeError.message}`, 500);
        }

        // Save payment record
        console.log('💾 [PaymentService] Saving payment record to database...');
        let payment;
        try {
            payment = await PaymentRepository.createPaymentRecord(
                userId,
                Number(amount),
                currency,
                'stripe',
                paymentIntent.id,
                { 
                    payment_intent_id: paymentIntent.id,
                    type: 'native_card'
                }
            );
            console.log('✅ [PaymentService] Payment record saved:', payment.id);
        } catch (dbError) {
            console.error('❌ [PaymentService] Database error:', dbError.message);
            throw new AppError(`Database error: ${dbError.message}`, 500);
        }

        // Cache payment
        try {
            console.log('📦 [PaymentService] Caching payment...');
            await PaymentCache.cachePayment(payment.id, payment);
            console.log('✅ [PaymentService] Payment cached');
        } catch (cacheError) {
            console.warn('⚠️ [PaymentService] Cache error (non-critical):', cacheError.message);
            // Don't throw - cache errors shouldn't break the flow
        }

        console.log('✅ [PaymentService] Payment intent created:', paymentIntent.id, '| Payment:', payment.id);

        return {
            clientSecret: paymentIntent.client_secret,
            payment_id: payment.id,
        };
    }

    /**
     * Create Checkout Session
     */
    static async createCheckout(userId, amount, currency = 'usd', paymentMethodTypes = ['card'], origin) {
        if (!amount || Number(amount) <= 0) {
            throw new AppError('Invalid amount', 400);
        }

        console.log('Creating checkout with origin:', origin);

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: paymentMethodTypes,
            line_items: [{
                price_data: {
                    currency,
                    product_data: { name: 'Premium Membership' },
                    unit_amount: Number(amount),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/payment/failed?reason=cancelled`,
            metadata: { user_id: userId },
        });

        // Save payment record
        const payment = await PaymentRepository.createPaymentRecord({
            user_id: userId,
            amount_cents: Number(amount),
            currency,
            provider: 'stripe',
            provider_transaction_id: session.id,
            status: 'pending',
            metadata: { session_id: session.id }
        });

        // Cache payment
        await PaymentCache.cachePayment(payment.id, payment);

        console.log('Payment created:', payment.id, '| Session:', session.id);

        return {
            payment_id: payment.id,
            session_id: session.id,
            checkout_url: session.url
        };
    }

    /**
     * Handle Checkout Completed Webhook
     */
    static async handleCheckoutCompleted(session) {
        console.log('Checkout completed:', session.id);

        const payment = await PaymentRepository.updatePaymentStatus(
            session.id,
            'succeeded'
        );

        if (payment) {
            // Invalidate cache
            await PaymentCache.invalidatePaymentCache(payment.user_id);
            console.log(' Payment updated to succeeded:', payment);
        }
    }

    /**
     * Handle Payment Succeeded Webhook
     */
    static async handlePaymentSucceeded(paymentIntent) {
        console.log('Payment succeeded:', paymentIntent.id);

        // Update payment status
        const payment = await PaymentRepository.updatePaymentStatus(
            paymentIntent.id,
            'succeeded'
        );

        if (!payment) {
            console.error(' Payment not found for:', paymentIntent.id);
            return;
        }

        console.log(' Payment updated to succeeded');

        // Update user to premium
        if (payment.user_id) {
            console.log(` Updating user ${payment.user_id} to premium level`);

            const updatedUser = await PaymentRepository.updateUserToPremium(payment.user_id);

            if (updatedUser) {
                console.log(' User upgraded to premium:', updatedUser.id);
                
                // Invalidate ALL user-related caches so next fetch gets fresh data
                console.log('🔄 Invalidating all caches for user:', payment.user_id);
                await Promise.all([
                    PaymentCache.invalidatePaymentCache(payment.user_id),
                    CandidateCache.invalidateCandidateCache(payment.user_id),
                    UserCache.invalidateUserCache(payment.user_id),
                ]);
                console.log('✅ All caches invalidated');
                
                // Cache fresh subscription status
                await PaymentCache.cacheSubscriptionStatus(payment.user_id, {
                    level: 'premium',
                    updated_at: updatedUser.updated_at
                });

                // Also proactively update candidate and user caches with the fresh user
                try {
                    console.log('📌 Writing fresh user into CandidateCache and UserCache');
                    // Candidate cache expects user data keyed by user_id
                    await CandidateCache.updateCandidateCache(payment.user_id, updatedUser);
                    await UserCache.cacheUserProfile(payment.user_id, updatedUser);
                    console.log('✅ Candidate and User caches updated with fresh user');
                } catch (cacheWriteError) {
                    console.warn('⚠️ Failed to write fresh user into caches:', cacheWriteError.message || cacheWriteError);
                }
            }
        }
    }

    /**
     * Handle Payment Failed Webhook
     */
    static async handlePaymentFailed(paymentIntent) {
        console.log(' Payment failed:', paymentIntent.id);

        const payment = await PaymentRepository.updatePaymentStatus(
            paymentIntent.id,
            'failed'
        );

        if (payment) {
            // Invalidate cache
            await PaymentCache.invalidatePaymentCache(payment.user_id);
            console.log('Payment marked as failed:', payment.id);
        }
    }

    /**
     * Get Payment History
     */
    static async getPaymentHistory(userId) {
        // Try cache first
        const cached = await PaymentCache.getCachedPaymentHistory(userId);
        if (cached) {
            console.log('Payment history from cache for user:', userId);
            return cached;
        }

        // Get from database
        const payments = await PaymentRepository.getPaymentHistory(userId);

        // Cache result
        await PaymentCache.cachePaymentHistory(userId, payments);

        return payments;
    }

    /**
     * Get Payment by ID
     */
    static async getPaymentById(paymentId, userId) {
        // Try cache first
        const cached = await PaymentCache.getCachedPayment(paymentId);
        if (cached) {
            console.log('Payment from cache:', paymentId);
            return cached;
        }

        // Get from database
        const payment = await PaymentRepository.getPaymentById(paymentId);

        if (!payment) {
            throw new AppError('Payment not found', 404);
        }

        // Verify ownership
        if (payment.user_id !== userId) {
            throw new AppError('Unauthorized', 403);
        }

        // Cache result
        await PaymentCache.cachePayment(paymentId, payment);

        return payment;
    }

    /**
     * Cancel Payment
     */
    static async cancelPayment(paymentId, userId) {
        const payment = await PaymentRepository.getPaymentById(paymentId);

        if (!payment) {
            throw new AppError('Payment not found', 404);
        }

        if (payment.user_id !== userId) {
            throw new AppError('Unauthorized', 403);
        }

        if (payment.status !== 'pending') {
            throw new AppError('Only pending payments can be cancelled', 400);
        }

        // Cancel in Stripe if PaymentIntent
        if (payment.provider === 'stripe' && payment.metadata?.payment_intent_id) {
            try {
                await stripe.paymentIntents.cancel(payment.metadata.payment_intent_id);
                console.log('Stripe PaymentIntent cancelled:', payment.metadata.payment_intent_id);
            } catch (error) {
                console.error('Failed to cancel Stripe PaymentIntent:', error.message);
            }
        }

        // Update database
        const cancelledPayment = await PaymentRepository.cancelPayment(paymentId);

        // Invalidate cache
        await PaymentCache.invalidatePaymentCache(userId);

        return cancelledPayment;
    }

    /**
     * Get Payment Stats (Admin)
     */
    static async getPaymentStats() {
        return await PaymentRepository.getPaymentStats();
    }

    /**
     * Get User Subscription Status
     */
    static async getUserSubscription(userId) {
        // Try cache first
        const cached = await PaymentCache.getCachedSubscriptionStatus(userId);
        if (cached) {
            return cached;
        }

        // Get user data
        const user = await PaymentRepository.getUserById(userId);
        
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Get latest successful payment
        const latestPayment = await PaymentRepository.getLatestSuccessfulPayment(userId);

        const subscriptionData = {
            level: user.level,
            is_premium: user.level === 'premium',
            latest_payment: latestPayment,
            updated_at: user.updated_at
        };

        // Cache result
        await PaymentCache.cacheSubscriptionStatus(userId, subscriptionData);

        return subscriptionData;
    }
}

module.exports = PaymentService;

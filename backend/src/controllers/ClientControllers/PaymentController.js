require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const supabase = require('../../supabase/config');

class PaymentController {
    /**
     * Create Payment Intent for native card input
     * Used with @stripe/stripe-react-native CardField
     */
    async createPaymentIntent(req, res) {
        try {
            const { amount, currency = 'usd' } = req.body;
            const user_id = req.user?.id;

            if (!user_id) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            if (!amount || Number(amount) <= 0) {
                return res.status(400).json({ error: 'Invalid amount' });
            }

            console.log('💳 Creating payment intent:', {
                amount,
                currency,
                user_id
            });

            // Create PaymentIntent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Number(amount),
                currency,
                metadata: { user_id },
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            // Save payment record with status 'pending'
            const { data: payment, error: insertError } = await supabase
                .from('payments')
                .insert({
                    user_id,
                    amount_cents: Number(amount),
                    currency,
                    provider: 'stripe',
                    provider_transaction_id: paymentIntent.id,
                    status: 'pending',
                    metadata: { 
                        payment_intent_id: paymentIntent.id,
                        type: 'native_card'
                    }
                })
                .select()
                .single();

            if (insertError) {
                console.error('Payment insert error:', insertError);
                return res.status(500).json({ error: 'Failed to create payment record' });
            }

            console.log('✅ Payment intent created:', paymentIntent.id, '| Payment:', payment.id);

            return res.status(200).json({
                success: true,
                clientSecret: paymentIntent.client_secret,
                payment_id: payment.id,
            });

        } catch (err) {
            console.error('❌ Payment intent creation error:', err);
            return res.status(500).json({ error: 'Payment intent creation failed' });
        }
    }

    async checkout(req, res) {
        try {
            const { amount, currency = 'usd', payment_method_types = ['card'] } = req.body;
            const user_id = req.user?.id;

            if (!user_id) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            if (!amount || Number(amount) <= 0) {
                return res.status(400).json({ error: 'Invalid amount' });
            }

            // Determine environment and set appropriate deep link URLs
            const isDevelopment = process.env.NODE_ENV !== 'production';
            const mobileScheme = 'jobbridge://';
            
            // For development, use Expo dev URL if provided
            const origin = req.headers['x-app-origin'] || 
                          (isDevelopment ? 'exp://192.168.84.8:8081' : mobileScheme);

            console.log('💳 Creating checkout with origin:', origin);

            // 1. Tạo Stripe checkout session
            const session = await stripe.checkout.sessions.create({
                payment_method_types,
                line_items: [{
                    price_data: {
                        currency,
                        product_data: { name: 'Premium Membership' },
                        unit_amount: Number(amount), // cents
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${origin}/payment/failed?reason=cancelled`,
                metadata: { user_id }, // để webhook biết user
            });

            // 2. Lưu payment record với status 'pending'
            const { data: payment, error: insertError } = await supabase
                .from('payments')
                .insert({
                    user_id,
                    amount_cents: Number(amount),
                    currency,
                    provider: 'stripe',
                    provider_transaction_id: session.id,
                    status: 'pending',
                    metadata: { session_id: session.id }
                })
                .select()
                .single();

            if (insertError) {
                console.error('Payment insert error:', insertError);
                return res.status(500).json({ error: 'Failed to create payment record' });
            }

            console.log('Payment created:', payment.id, '| Session:', session.id);

            return res.status(200).json({
                success: true,
                payment_id: payment.id,
                session_id: session.id,
                checkout_url: session.url
            });

        } catch (err) {
            console.error('❌ Checkout error:', err);
            return res.status(500).json({ error: 'Checkout creation failed' });
        }
    }

    // Webhook handler - Stripe gửi event sau khi user thanh toán
    async webhook(req, res) {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error('⚠️ Missing STRIPE_WEBHOOK_SECRET');
            return res.status(500).send('Webhook secret not configured');
        }

        let event;

        try {
            // Verify webhook signature
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
                    await this.handleCheckoutCompleted(session);
                    break;
                }
                case 'payment_intent.succeeded': {
                    const paymentIntent = event.data.object;
                    await this.handlePaymentSucceeded(paymentIntent);
                    break;
                }
                case 'payment_intent.payment_failed': {
                    const paymentIntent = event.data.object;
                    await this.handlePaymentFailed(paymentIntent);
                    break;
                }
                default:
                    console.log(`ℹ️ Unhandled event type: ${event.type}`);
            }

            return res.status(200).json({ received: true });

        } catch (err) {
            console.error('❌ Webhook processing error:', err);
            return res.status(500).json({ error: 'Webhook processing failed' });
        }
    }

    async handleCheckoutCompleted(session) {
        console.log('Checkout completed:', session.id);

        const { data, error } = await supabase
            .from('payments')
            .update({
                status: 'succeeded',
                updated_at: new Date().toISOString()
            })
            .eq('provider_transaction_id', session.id)
            .select();

        if (error) {
            console.error('❌ Failed to update payment:', error);
            return;
        }

        console.log('✅ Payment updated to succeeded:', data);
    }

    async handlePaymentSucceeded(paymentIntent) {
        console.log('💰 Payment succeeded:', paymentIntent.id);

        // Update payment status
        const { data: payment, error } = await supabase
            .from('payments')
            .update({
                status: 'succeeded',
                updated_at: new Date().toISOString()
            })
            .eq('provider_transaction_id', paymentIntent.id)
            .select()
            .single();

        if (error) {
            console.error('❌ Failed to update payment status:', error);
            return;
        }

        console.log('✅ Payment updated to succeeded');

        // Update user level to premium (chung cho tất cả)
        if (payment?.user_id) {
            console.log(`🎯 Updating user ${payment.user_id} to premium level`);

            const { error: userError } = await supabase
                .from('users')
                .update({ 
                    level: 'premium',
                    updated_at: new Date().toISOString()
                })
                .eq('id', payment.user_id);

            if (userError) {
                console.error('❌ Failed to update user level:', userError);
            } else {
                console.log('✅ User upgraded to premium:', payment.user_id);
            }
        }
    }

    /**
     * Confirm payment after successful Stripe payment
     * Called by frontend after confirmPayment succeeds
     */
    async confirmPayment(req, res) {
        try {
            const { payment_intent_id } = req.body;
            const user_id = req.user?.id;

            if (!user_id) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            if (!payment_intent_id) {
                return res.status(400).json({ error: 'Payment intent ID is required' });
            }

            console.log('🔍 Confirming payment:', payment_intent_id);

            // Verify payment intent with Stripe
            const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

            console.log('📊 Stripe PaymentIntent status:', paymentIntent.status);

            if (paymentIntent.status !== 'succeeded') {
                return res.status(400).json({ 
                    error: 'Payment not completed',
                    status: paymentIntent.status 
                });
            }

            // Debug: Check existing payment records first
            console.log('🔍 Searching for payment with:', {
                provider_transaction_id: payment_intent_id,
                user_id: user_id
            });

            const { data: existingPayments, error: searchError } = await supabase
                .from('payments')
                .select('*')
                .eq('provider_transaction_id', payment_intent_id);

            console.log('🔍 Found payments:', existingPayments);
            console.log('🔍 Search error:', searchError);

            // Update payment in database
            const { data: payment, error: updateError } = await supabase
                .from('payments')
                .update({
                    status: 'succeeded',
                    updated_at: new Date().toISOString()
                })
                .eq('provider_transaction_id', payment_intent_id)
                .eq('user_id', user_id)
                .select()
                .single();

            if (updateError) {
                console.error('❌ Failed to update payment:', updateError);
                return res.status(500).json({ error: 'Failed to update payment status' });
            }

            console.log('✅ Payment confirmed:', payment.id);

            // Update user level to premium (chung cho tất cả)
            console.log(`🎯 Updating user ${user_id} to premium level`);

            // Update user level
            const { error: userError } = await supabase
                .from('users')
                .update({ 
                    level: 'premium',
                    updated_at: new Date().toISOString()
                })
                .eq('id', user_id);

            if (userError) {
                console.error('❌ Failed to update user level:', userError);
                return res.status(500).json({ error: 'Failed to upgrade account' });
            }

            console.log(`✅ User upgraded to premium:`, user_id);

            return res.status(200).json({
                success: true,
                message: 'Payment confirmed and account upgraded',
                payment,
                user_level: 'premium'
            });

        } catch (err) {
            console.error('❌ Confirm payment error:', err);
            return res.status(500).json({ 
                error: 'Failed to confirm payment',
                details: err.message 
            });
        }
    }

    async handlePaymentFailed(paymentIntent) {
        console.log('Payment failed:', paymentIntent.id);

        const { error } = await supabase
            .from('payments')
            .update({
                status: 'failed',
                updated_at: new Date().toISOString()
            })
            .eq('provider_transaction_id', paymentIntent.id);

        if (error) {
            console.error('Failed to update payment status:', error);
        }
    }

    // Success page endpoint
    async success(req, res) {
        const { session_id } = req.query;

        if (!session_id) {
            return res.status(400).json({ error: 'Missing session_id' });
        }

        try {
            const session = await stripe.checkout.sessions.retrieve(session_id);

            const { data: payment } = await supabase
                .from('payments')
                .select('*')
                .eq('provider_transaction_id', session_id)
                .single();

            if (!payment) {
                return res.status(404).json({ error: 'Payment not found' });
            }

            // Update user level to premium
            const { error: userError } = await supabase
                .from('users')
                .update({ level: 'premium' })
                .eq('id', payment.user_id);

            if (userError) {
                console.error('Failed to update user level:', userError);
            }

            return res.status(200).json({
                success: true,
                message: 'Payment successful',
                payment_status: session.payment_status,
                payment
            });
        } catch (err) {
            console.error('Error retrieving session:', err);
            return res.status(500).json({ error: 'Failed to verify payment' });
        }
    }

    // Get payment history for current user
    async getPaymentHistory(req, res) {
        try {
            const user_id = req.user?.id;

            if (!user_id) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const { data: payments, error } = await supabase
                .from('payments')
                .select('*')
                .eq('user_id', user_id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching payment history:', error);
                return res.status(500).json({ error: 'Failed to fetch payment history' });
            }

            return res.status(200).json({
                success: true,
                payments: payments || []
            });

        } catch (err) {
            console.error('❌ Get payment history error:', err);
            return res.status(500).json({ error: 'Failed to retrieve payment history' });
        }
    }

    // Get payment details by ID
    async getPaymentById(req, res) {
        try {
            const { paymentId } = req.params;
            const user_id = req.user?.id;

            if (!user_id) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            if (!paymentId) {
                return res.status(400).json({ error: 'Payment ID is required' });
            }

            const { data: payment, error } = await supabase
                .from('payments')
                .select('*')
                .eq('id', paymentId)
                .eq('user_id', user_id) // Ensure user can only see their own payments
                .single();

            if (error) {
                console.error('Error fetching payment:', error);
                return res.status(404).json({ error: 'Payment not found' });
            }

            return res.status(200).json({
                success: true,
                payment
            });

        } catch (err) {
            console.error('❌ Get payment error:', err);
            return res.status(500).json({ error: 'Failed to retrieve payment' });
        }
    }

    // Cancel pending payment
    async cancelPayment(req, res) {
        try {
            const { paymentId } = req.params;
            const user_id = req.user?.id;

            if (!user_id) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            if (!paymentId) {
                return res.status(400).json({ error: 'Payment ID is required' });
            }

            // Get payment first to check if it belongs to user and is pending
            const { data: payment, error: fetchError } = await supabase
                .from('payments')
                .select('*')
                .eq('id', paymentId)
                .eq('user_id', user_id)
                .single();

            if (fetchError || !payment) {
                return res.status(404).json({ error: 'Payment not found' });
            }

            if (payment.status !== 'pending') {
                return res.status(400).json({ 
                    error: 'Only pending payments can be cancelled',
                    current_status: payment.status
                });
            }

            // Update payment status to cancelled
            const { data: updatedPayment, error: updateError } = await supabase
                .from('payments')
                .update({
                    status: 'cancelled',
                    updated_at: new Date().toISOString()
                })
                .eq('id', paymentId)
                .select()
                .single();

            if (updateError) {
                console.error('Error cancelling payment:', updateError);
                return res.status(500).json({ error: 'Failed to cancel payment' });
            }

            // Try to expire the Stripe session if it exists
            try {
                if (payment.provider_transaction_id) {
                    await stripe.checkout.sessions.expire(payment.provider_transaction_id);
                    console.log('Stripe session expired:', payment.provider_transaction_id);
                }
            } catch (stripeError) {
                console.error('Failed to expire Stripe session:', stripeError.message);
                // Don't fail the request if Stripe session expiry fails
            }

            return res.status(200).json({
                success: true,
                message: 'Payment cancelled successfully',
                payment: updatedPayment
            });

        } catch (err) {
            console.error('❌ Cancel payment error:', err);
            return res.status(500).json({ error: 'Failed to cancel payment' });
        }
    }

    // Get subscription status for current user
    async getSubscriptionStatus(req, res) {
        try {
            const user_id = req.user?.id;

            if (!user_id) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            // Get user data
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('level, created_at')
                .eq('id', user_id)
                .single();

            if (userError) {
                console.error('Error fetching user:', userError);
                return res.status(500).json({ error: 'Failed to fetch user data' });
            }

            // Get latest successful payment
            const { data: latestPayment, error: paymentError } = await supabase
                .from('payments')
                .select('*')
                .eq('user_id', user_id)
                .eq('status', 'succeeded')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            // Get payment statistics
            const { data: paymentStats, error: statsError } = await supabase
                .from('payments')
                .select('status')
                .eq('user_id', user_id);

            const stats = {
                total: paymentStats?.length || 0,
                succeeded: paymentStats?.filter(p => p.status === 'succeeded').length || 0,
                pending: paymentStats?.filter(p => p.status === 'pending').length || 0,
                failed: paymentStats?.filter(p => p.status === 'failed').length || 0,
                cancelled: paymentStats?.filter(p => p.status === 'cancelled').length || 0,
            };

            // Calculate subscription expiry (assuming 1 year from payment date)
            let subscriptionExpiry = null;
            let daysRemaining = null;
            let isActive = false;

            if (latestPayment && user.level === 'premium') {
                const paymentDate = new Date(latestPayment.created_at);
                subscriptionExpiry = new Date(paymentDate);
                subscriptionExpiry.setFullYear(subscriptionExpiry.getFullYear() + 1); // Add 1 year

                const now = new Date();
                const diffTime = subscriptionExpiry - now;
                daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                isActive = daysRemaining > 0;
            }

            return res.status(200).json({
                success: true,
                subscription: {
                    level: user.level || 'free',
                    isActive: isActive,
                    isPremium: user.level === 'premium',
                    subscriptionExpiry: subscriptionExpiry,
                    daysRemaining: daysRemaining,
                    latestPayment: latestPayment || null,
                    stats: stats
                }
            });

        } catch (err) {
            console.error('❌ Get subscription status error:', err);
            return res.status(500).json({ error: 'Failed to retrieve subscription status' });
        }
    }
}

module.exports = new PaymentController();
const supabase = require('../../supabase/config');

class PaymentRepository {
    /**
     * Create payment intent record
     */
    async createPaymentRecord(userId, amountCents, currency, provider, transactionId, metadata) {
        const { data, error } = await supabase
            .from('payments')
            .insert({
                user_id: userId,
                amount_cents: amountCents,
                currency,
                provider,
                provider_transaction_id: transactionId,
                status: 'pending',
                metadata
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Update payment status
     */
    async updatePaymentStatus(transactionId, status) {
        const { data, error } = await supabase
            .from('payments')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('provider_transaction_id', transactionId)
            .select();

        if (error) {
            throw error;
        }

        return data[0];
    }

    /**
     * Get payment by transaction ID
     */
    async getPaymentByTransactionId(transactionId) {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('provider_transaction_id', transactionId)
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Get payment by ID
     */
    async getPaymentById(paymentId, userId) {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('id', paymentId)
            .eq('user_id', userId)
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Get payment history by user
     */
    async getPaymentHistory(userId) {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return data || [];
    }

    /**
     * Update payment to cancelled
     */
    async cancelPayment(paymentId, userId) {
        const { data, error } = await supabase
            .from('payments')
            .update({
                status: 'cancelled',
                updated_at: new Date().toISOString()
            })
            .eq('id', paymentId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Update user level to premium
     */
    async updateUserToPremium(userId) {
        const { data, error } = await supabase
            .from('users')
            .update({ 
                level: 'premium',
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('❌ Failed to update user to premium:', error);
            throw error;
        }

        console.log('✅ User updated to premium:', data);
        return data;
    }

    /**
     * Get user data
     */
    async getUserById(userId) {
        const { data, error } = await supabase
            .from('users')
            .select('level, created_at')
            .eq('id', userId)
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Get payment statistics by user
     */
    async getPaymentStats(userId) {
        const { data, error } = await supabase
            .from('payments')
            .select('status')
            .eq('user_id', userId);

        if (error) {
            throw error;
        }

        return data || [];
    }

    /**
     * Get latest successful payment
     */
    async getLatestSuccessfulPayment(userId) {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'succeeded')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data;
    }
}

module.exports = new PaymentRepository();

const redis = require('../../redis/config');

class PaymentCache {
    /**
     * Cache payment data
     */
    async cachePayment(paymentId, paymentData) {
        try {
            await redis.setEx(
                `payment:${paymentId}`,
                3600, // 1 hour
                JSON.stringify(paymentData)
            );
        } catch (error) {
            console.error('Cache payment error:', error);
        }
    }

    /**
     * Get cached payment
     */
    async getCachedPayment(paymentId) {
        try {
            const cached = await redis.get(`payment:${paymentId}`);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Get cached payment error:', error);
            return null;
        }
    }

    /**
     * Cache payment history
     */
    async cachePaymentHistory(userId, payments) {
        try {
            await redis.setEx(
                `payment_history:${userId}`,
                1800, // 30 minutes
                JSON.stringify(payments)
            );
        } catch (error) {
            console.error('Cache payment history error:', error);
        }
    }

    /**
     * Get cached payment history
     */
    async getCachedPaymentHistory(userId) {
        try {
            const cached = await redis.get(`payment_history:${userId}`);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Get cached payment history error:', error);
            return null;
        }
    }

    /**
     * Invalidate payment cache
     */
    async invalidatePaymentCache(userId, paymentId) {
        try {
            await redis.del(`payment:${paymentId}`);
            await redis.del(`payment_history:${userId}`);
            await redis.del(`subscription:${userId}`);
        } catch (error) {
            console.error('Invalidate payment cache error:', error);
        }
    }

    /**
     * Cache subscription status
     */
    async cacheSubscriptionStatus(userId, subscriptionData) {
        try {
            await redis.setEx(
                `subscription:${userId}`,
                1800, // 30 minutes
                JSON.stringify(subscriptionData)
            );
        } catch (error) {
            console.error('Cache subscription error:', error);
        }
    }

    /**
     * Get cached subscription status
     */
    async getCachedSubscriptionStatus(userId) {
        try {
            const cached = await redis.get(`subscription:${userId}`);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Get cached subscription error:', error);
            return null;
        }
    }
}

module.exports = new PaymentCache();

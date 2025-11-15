const redis = require('../../redis/config');

class EmailCache {
    /**
     * Cache company info for email sending
     */
    static async cacheCompanyInfo(companyId, companyData) {
        try {
            const key = `email:company:${companyId}`;
            await redis.setEx(key, 3600, JSON.stringify(companyData)); // 1 hour TTL
        } catch (error) {
            console.error('Error caching company info:', error);
        }
    }

    static async getCachedCompanyInfo(companyId) {
        try {
            const key = `email:company:${companyId}`;
            const cached = await redis.get(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Error getting cached company info:', error);
            return null;
        }
    }

    /**
     * Cache email statistics
     */
    static async cacheEmailStats(employerId, stats) {
        try {
            const key = `email:stats:${employerId}`;
            await redis.setEx(key, 1800, JSON.stringify(stats)); // 30 minutes TTL
        } catch (error) {
            console.error('Error caching email stats:', error);
        }
    }

    static async getCachedEmailStats(employerId) {
        try {
            const key = `email:stats:${employerId}`;
            const cached = await redis.get(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Error getting cached email stats:', error);
            return null;
        }
    }

    /**
     * Invalidate email cache for a company
     */
    static async invalidateEmailCache(employerId) {
        try {
            const keys = [
                `email:company:${employerId}`,
                `email:stats:${employerId}`
            ];
            
            for (const key of keys) {
                await redis.del(key);
            }
        } catch (error) {
            console.error('Error invalidating email cache:', error);
        }
    }

    /**
     * Rate limiting for email sending
     */
    static async checkEmailRateLimit(employerId, limit = 100, window = 3600) {
        try {
            const key = `email:ratelimit:${employerId}`;
            const count = await redis.incr(key);
            
            if (count === 1) {
                await redis.expire(key, window);
            }
            
            return count <= limit;
        } catch (error) {
            console.error('Error checking email rate limit:', error);
            return true; // Allow on error to not block legitimate sends
        }
    }

    static async getEmailRateLimitCount(employerId) {
        try {
            const key = `email:ratelimit:${employerId}`;
            const count = await redis.get(key);
            return count ? parseInt(count) : 0;
        } catch (error) {
            console.error('Error getting email rate limit count:', error);
            return 0;
        }
    }
}

module.exports = EmailCache;

const redis = require('../../redis/config');

class UserCache {
    /**
     * Cache user profile
     */
    async cacheUserProfile(userId, userData) {
        try {
            await redis.setEx(
                `user_profile:${userId}`,
                3600, // 1 hour
                JSON.stringify(userData)
            );
        } catch (error) {
            console.error('Cache user profile error:', error);
        }
    }

    /**
     * Get cached user profile
     */
    async getCachedUserProfile(userId) {
        try {
            const cached = await redis.get(`user_profile:${userId}`);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Get cached user profile error:', error);
            return null;
        }
    }

    /**
     * Invalidate user cache
     */
    async invalidateUserCache(userId) {
        try {
            await redis.del(`user_profile:${userId}`);
            await redis.del(`user:${userId}`);
        } catch (error) {
            console.error('Invalidate user cache error:', error);
        }
    }
}

module.exports = new UserCache();

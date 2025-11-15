const redis = require('../../redis/config');

class NotificationCache {
    /**
     * Cache user notifications
     */
    static async cacheUserNotifications(userId, notifications, filters = {}) {
        try {
            const key = this._generateCacheKey(userId, filters);
            await redis.setEx(key, 300, JSON.stringify(notifications)); // 5 minutes TTL
        } catch (error) {
            console.error('Error caching user notifications:', error);
        }
    }

    static async getCachedUserNotifications(userId, filters = {}) {
        try {
            const key = this._generateCacheKey(userId, filters);
            const cached = await redis.get(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Error getting cached user notifications:', error);
            return null;
        }
    }

    /**
     * Cache unread count
     */
    static async cacheUnreadCount(userId, count) {
        try {
            const key = `notifications:unread_count:${userId}`;
            await redis.setEx(key, 300, count.toString()); // 5 minutes TTL
        } catch (error) {
            console.error('Error caching unread count:', error);
        }
    }

    static async getCachedUnreadCount(userId) {
        try {
            const key = `notifications:unread_count:${userId}`;
            const cached = await redis.get(key);
            return cached ? parseInt(cached) : null;
        } catch (error) {
            console.error('Error getting cached unread count:', error);
            return null;
        }
    }

    /**
     * Invalidate user notification cache
     */
    static async invalidateUserCache(userId) {
        try {
            // Get all notification keys for this user
            const keys = await redis.keys(`notifications:user:${userId}:*`);
            keys.push(`notifications:unread_count:${userId}`);
            
            for (const key of keys) {
                await redis.del(key);
            }
        } catch (error) {
            console.error('Error invalidating user notification cache:', error);
        }
    }

    /**
     * Generate cache key based on filters
     */
    static _generateCacheKey(userId, filters) {
        const { page = 1, limit = 20, unread_only = false, type = '' } = filters;
        return `notifications:user:${userId}:page:${page}:limit:${limit}:unread:${unread_only}:type:${type}`;
    }

    /**
     * Increment unread count (real-time)
     */
    static async incrementUnreadCount(userId) {
        try {
            const key = `notifications:unread_count:${userId}`;
            await redis.incr(key);
            await redis.expire(key, 300); // Reset TTL
        } catch (error) {
            console.error('Error incrementing unread count:', error);
        }
    }

    /**
     * Decrement unread count
     */
    static async decrementUnreadCount(userId, count = 1) {
        try {
            const key = `notifications:unread_count:${userId}`;
            const current = await redis.get(key);
            
            if (current) {
                const newCount = Math.max(0, parseInt(current) - count);
                await redis.setEx(key, 300, newCount.toString());
            }
        } catch (error) {
            console.error('Error decrementing unread count:', error);
        }
    }
}

module.exports = NotificationCache;

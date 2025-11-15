const redis = require('../../redis/config');

const PREFIX = 'auth'

class AuthCache {
    async getAccessToken(userId) {
        const key = `${PREFIX}:accessToken:${userId}`;
        try {
            const token = await redis.get(key);
            return token;
        } catch (err) {
            console.error(`[AuthCache] Error getting access token for user ${userId}:`, err);
            return null;
        }
    }

    async setAccessToken(userId, token, ttlSeconds) {
        const key = `${PREFIX}:accessToken:${userId}`;
        try {
            await redis.setEx(key, ttlSeconds, token);
        } catch (err) {
            console.error(`[AuthCache] Error setting access token for user ${userId}:`, err);
        }
    }

    async deleteAccessToken(userId) {
        const key = `${PREFIX}:accessToken:${userId}`;
        try {
            await redis.del(key);
        } catch (err) {
            console.error(`[AuthCache] Error deleting access token for user ${userId}:`, err);
        }
    }
}

module.exports = new AuthCache();
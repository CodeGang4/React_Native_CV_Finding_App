const redis = require('../../redis/config');

class SavePodcastCache {
    /**
     * Get saved podcasts from cache
     */
    async getSavedPodcasts(candidate_id) {
        try {
            const cached = await redis.get(`saved_podcasts:${candidate_id}`);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    /**
     * Cache saved podcasts
     */
    async cacheSavedPodcasts(candidate_id, podcasts) {
        try {
            await redis.setEx(
                `saved_podcasts:${candidate_id}`,
                3600, // 1 hour
                JSON.stringify(podcasts)
            );
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    /**
     * Invalidate saved podcasts cache
     */
    async invalidateSavedPodcasts(candidate_id) {
        try {
            await redis.del(`saved_podcasts:${candidate_id}`);
        } catch (error) {
            console.error('Cache invalidate error:', error);
        }
    }
}

module.exports = new SavePodcastCache();

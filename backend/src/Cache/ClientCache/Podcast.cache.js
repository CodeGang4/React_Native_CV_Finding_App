const redis = require("../../redis/config");
const supabase = require("../../supabase/config");

const REDIS_KEYS = {
    PODCAST_PREFIX: "podcast",
    ALL_PODCASTS: "AllPodcasts",
};

class PodcastCache {
    constructor() {
        this.DEFAULT_TTL = 3600; // 1 hour
        this.APPLICATION_TTL = 7200; // 2 hours for applications
    }

    /**
     * Check if podcast exists in cache
     * @param {string} podcastId
     * @returns {Promise<boolean>}
     */
    async podcastExistsInCache(podcastId) {
        try {
            const cacheKey = `${REDIS_KEYS.PODCAST_PREFIX}:${podcastId}`;
            return await redis.exists(cacheKey) === 1;
        } catch (error) {
            console.error("Error checking podcast existence in cache:", error);
            return false;
        }
    }

    /**
     * Cache a single podcast
     * @param {string} podcastId
     * @param {Object} podcastData
     * @param {number} ttl Time to live in seconds
     * @returns {Promise<void>}
     */
    async setPodcastCache(podcastId, podcastData, ttl = this.DEFAULT_TTL) {
        try {
            const cacheKey = `${REDIS_KEYS.PODCAST_PREFIX}:${podcastId}`;
            await redis.setEx(cacheKey, ttl, JSON.stringify(podcastData));
        } catch (error) {
            console.error("Error setting podcast cache:", error);
        }
    }

    /**
     * Retrieve a single podcast from cache or database
     * @param {string} podcastId
     * @returns {Promise<Object|null>}
     */
    async getPodcastCache(podcastId) {
        try {
            const cacheKey = `${REDIS_KEYS.PODCAST_PREFIX}:${podcastId}`;
            const cachedPodcast = await redis.get(cacheKey);
            if (cachedPodcast) {
                return JSON.parse(cachedPodcast);
            }

            return null;
        } catch (error) {
            console.error("Error retrieving podcast from cache or database:", error);
            return null;
        }
    }

    /**
     * Retrieve all podcasts from cache
     * @returns {Promise<Array|null>}
     */
    async getAllPodcastsCache() {
        try {
            const cachedPodcasts = await redis.hGetAll(REDIS_KEYS.ALL_PODCASTS);
            if (Object.keys(cachedPodcasts).length === 0) {
                return null;
            }
            return Object.values(cachedPodcasts).map((podcast) => JSON.parse(podcast));
        } catch (error) {
            console.error("Error getting all podcasts from cache:", error);
            return null;
        }
    }

    /**
     * Cache all podcasts
     * @param {Array} podcasts - List of podcasts to cache
     * @returns {Promise<void>}
     */
    async setAllPodcastsCache(podcasts) {
        try {
            const pipeline = redis.multi();
            podcasts.forEach((podcast) => {
                const podcastId = podcast.id;
                pipeline.hSet(REDIS_KEYS.ALL_PODCASTS, podcastId, JSON.stringify(podcast));
            });
            await pipeline.exec();
            console.log("Cached all podcasts in Redis Hash");
        } catch (error) {
            console.error("Error caching all podcasts:", error);
        }
    }
}

module.exports = new PodcastCache();
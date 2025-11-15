const redis = require("../../redis/config");

const REDIS_KEYS = {
    INTERVIEW_RESULT_PREFIX: "interview_result",
    USER_RESULTS: "user_results",
    QUESTION_PREFIX: "question",
};

class InterviewPracticeCache {
    constructor() {
        this.DEFAULT_TTL = 3600; // 1 hour
        this.RESULT_TTL = 7200; // 2 hours for results
        this.QUESTION_TTL = 86400; // 24 hours for questions
    }

    /**
     * Check if interview result exists in cache
     * @param {string} resultId
     * @returns {Promise<boolean>}
     */
    async resultExistsInCache(resultId) {
        try {
            const cacheKey = `${REDIS_KEYS.INTERVIEW_RESULT_PREFIX}:${resultId}`;
            return (await redis.exists(cacheKey)) === 1;
        } catch (error) {
            console.error("Error checking result existence in cache:", error);
            return false;
        }
    }

    /**
     * Get interview result from cache
     * @param {string} resultId
     * @returns {Promise<Object|null>}
     */
    async getResultCache(resultId) {
        try {
            const cacheKey = `${REDIS_KEYS.INTERVIEW_RESULT_PREFIX}:${resultId}`;
            const cached = await redis.get(cacheKey);

            if (cached) {
                console.log(`Cache hit for result: ${resultId}`);
                return JSON.parse(cached);
            }

            console.log(`Cache miss for result: ${resultId}`);
            return null;
        } catch (error) {
            console.error("Error getting result from cache:", error);
            return null;
        }
    }

    /**
     * Cache interview result
     * @param {string} resultId
     * @param {Object} resultData
     * @param {number} ttl - Time to live in seconds
     * @returns {Promise<boolean>}
     */
    async setResultCache(resultId, resultData, ttl = this.RESULT_TTL) {
        try {
            const cacheKey = `${REDIS_KEYS.INTERVIEW_RESULT_PREFIX}:${resultId}`;
            await redis.setEx(cacheKey, ttl, JSON.stringify(resultData));
            console.log(`Cached result: ${resultId}`);
            return true;
        } catch (error) {
            console.error("Error setting result cache:", error);
            return false;
        }
    }

    /**
     * Get latest result for user and question from cache
     * @param {string} userId
     * @param {string} questionId
     * @returns {Promise<Object|null>}
     */
    async getLatestResultCache(userId, questionId) {
        try {
            const cacheKey = `${REDIS_KEYS.INTERVIEW_RESULT_PREFIX}:${userId}:${questionId}:latest`;
            const cached = await redis.get(cacheKey);

            if (cached) {
                console.log(`Cache hit for latest result: ${userId}:${questionId}`);
                return JSON.parse(cached);
            }

            console.log(`Cache miss for latest result: ${userId}:${questionId}`);
            return null;
        } catch (error) {
            console.error("Error getting latest result from cache:", error);
            return null;
        }
    }

    /**
     * Cache latest result for user and question
     * @param {string} userId
     * @param {string} questionId
     * @param {Object} resultData
     * @param {number} ttl - Time to live in seconds
     * @returns {Promise<boolean>}
     */
    async setLatestResultCache(userId, questionId, resultData, ttl = this.RESULT_TTL) {
        try {
            const cacheKey = `${REDIS_KEYS.INTERVIEW_RESULT_PREFIX}:${userId}:${questionId}:latest`;
            await redis.setEx(cacheKey, ttl, JSON.stringify(resultData));
            console.log(`Cached latest result: ${userId}:${questionId}`);
            return true;
        } catch (error) {
            console.error("Error setting latest result cache:", error);
            return false;
        }
    }

    /**
     * Get question from cache
     * @param {string} questionId
     * @returns {Promise<Object|null>}
     */
    async getQuestionCache(questionId) {
        try {
            const cacheKey = `${REDIS_KEYS.QUESTION_PREFIX}:${questionId}`;
            const cached = await redis.get(cacheKey);

            if (cached) {
                console.log(`Cache hit for question: ${questionId}`);
                return JSON.parse(cached);
            }

            console.log(`Cache miss for question: ${questionId}`);
            return null;
        } catch (error) {
            console.error("Error getting question from cache:", error);
            return null;
        }
    }

    /**
     * Cache question
     * @param {string} questionId
     * @param {Object} questionData
     * @param {number} ttl - Time to live in seconds
     * @returns {Promise<boolean>}
     */
    async setQuestionCache(questionId, questionData, ttl = this.QUESTION_TTL) {
        try {
            const cacheKey = `${REDIS_KEYS.QUESTION_PREFIX}:${questionId}`;
            await redis.setEx(cacheKey, ttl, JSON.stringify(questionData));
            console.log(`Cached question: ${questionId}`);
            return true;
        } catch (error) {
            console.error("Error setting question cache:", error);
            return false;
        }
    }

    /**
     * Get all user results from cache
     * @param {string} userId
     * @returns {Promise<Array|null>}
     */
    async getUserResultsCache(userId) {
        try {
            const cacheKey = `${REDIS_KEYS.USER_RESULTS}:${userId}`;
            const cached = await redis.get(cacheKey);

            if (cached) {
                console.log(`Cache hit for user results: ${userId}`);
                return JSON.parse(cached);
            }

            console.log(`Cache miss for user results: ${userId}`);
            return null;
        } catch (error) {
            console.error("Error getting user results from cache:", error);
            return null;
        }
    }

    /**
     * Cache all user results
     * @param {string} userId
     * @param {Array} results
     * @param {number} ttl - Time to live in seconds
     * @returns {Promise<boolean>}
     */
    async setUserResultsCache(userId, results, ttl = this.DEFAULT_TTL) {
        try {
            const cacheKey = `${REDIS_KEYS.USER_RESULTS}:${userId}`;
            await redis.setEx(cacheKey, ttl, JSON.stringify(results));
            console.log(`Cached user results: ${userId}`);
            return true;
        } catch (error) {
            console.error("Error setting user results cache:", error);
            return false;
        }
    }

    /**
     * Invalidate result cache
     * @param {string} resultId
     * @returns {Promise<boolean>}
     */
    async invalidateResultCache(resultId) {
        try {
            const cacheKey = `${REDIS_KEYS.INTERVIEW_RESULT_PREFIX}:${resultId}`;
            await redis.del(cacheKey);
            console.log(`Invalidated cache for result: ${resultId}`);
            return true;
        } catch (error) {
            console.error("Error invalidating result cache:", error);
            return false;
        }
    }

    /**
     * Invalidate latest result cache for user and question
     * @param {string} userId
     * @param {string} questionId
     * @returns {Promise<boolean>}
     */
    async invalidateLatestResultCache(userId, questionId) {
        try {
            const cacheKey = `${REDIS_KEYS.INTERVIEW_RESULT_PREFIX}:${userId}:${questionId}:latest`;
            await redis.del(cacheKey);
            console.log(`Invalidated latest result cache: ${userId}:${questionId}`);
            return true;
        } catch (error) {
            console.error("Error invalidating latest result cache:", error);
            return false;
        }
    }

    /**
     * Invalidate user results cache
     * @param {string} userId
     * @returns {Promise<boolean>}
     */
    async invalidateUserResultsCache(userId) {
        try {
            const cacheKey = `${REDIS_KEYS.USER_RESULTS}:${userId}`;
            await redis.del(cacheKey);
            console.log(`Invalidated user results cache: ${userId}`);
            return true;
        } catch (error) {
            console.error("Error invalidating user results cache:", error);
            return false;
        }
    }

    /**
     * Log action to Redis (for tracking)
     * @param {string} action
     * @param {string} userId
     * @param {Object} data
     * @returns {Promise<boolean>}
     */
    async logAction(action, userId, data) {
        try {
            const logKey = `log:${action}:${userId}:${Date.now()}`;
            await redis.setEx(
                logKey,
                60 * 60 * 24, // 24 hours
                JSON.stringify({
                    action,
                    userId,
                    ...data,
                    time: new Date().toISOString(),
                })
            );
            return true;
        } catch (error) {
            console.error(`Redis log error (${action}):`, error);
            return false;
        }
    }
}

module.exports = new InterviewPracticeCache();
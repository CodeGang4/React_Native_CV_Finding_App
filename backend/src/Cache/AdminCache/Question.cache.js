const redis = require("../../redis/config");

const REDIS_KEYS = {
    ALL_QUESTIONS: "admin:questions:all", 
    CONTENT_TO_ID: "admin:question:content", 
};

class QuestionCache {
    constructor() {
        this.DEFAULT_TTL = 3600; // 1 hour
    }

    /**
     * Check if question exists in cache by ID
     * @param {string} questionId
     * @returns {Promise<boolean>}
     */
    async questionExistsInCache(questionId) {
        try {
            return (await redis.hExists(REDIS_KEYS.ALL_QUESTIONS, questionId)) === 1;
        } catch (error) {
            console.error("Error checking question existence in cache:", error);
            return false;
        }
    }

    /**
     * Check if question content already exists (to prevent duplicates)
     * @param {string} questionContent
     * @returns {Promise<string|null>} Returns questionId if exists, null otherwise
     */
    async questionContentExists(questionContent) {
        try {
            const questionId = await redis.hGet(REDIS_KEYS.CONTENT_TO_ID, questionContent);
            return questionId || null;
        } catch (error) {
            console.error("Error checking question content existence:", error);
            return null;
        }
    }

    /**
     * Cache question by ID (store in hash)
     * @param {string} questionId
     * @param {Object} questionData
     * @returns {Promise<boolean>}
     */
    async setQuestionCache(questionId, questionData) {
        try {
            // Check if content already cached with different ID (optional, can skip for now)
            if (questionData.question) {
                const existingId = await this.questionContentExists(questionData.question);
                if (existingId && existingId !== questionId) {
                    console.log(`Question content already cached with ID: ${existingId}, but will update with new ID: ${questionId}`);
                    // Continue anyway to update with new ID
                }
            }

            // Use pipeline for atomic operations
            const pipeline = redis.multi();
            pipeline.hSet(REDIS_KEYS.ALL_QUESTIONS, questionId, JSON.stringify(questionData));
            
            if (questionData.question) {
                pipeline.hSet(REDIS_KEYS.CONTENT_TO_ID, questionData.question, questionId);
            }
            
            const results = await pipeline.exec();
            
            // Check if pipeline executed successfully
            if (!results) {
                console.error("Pipeline execution returned null");
                return false;
            }
            
            console.log(`Successfully cached question with ID: ${questionId}`);
            return true;
        } catch (error) {
            console.error("Error setting question cache:", error);
            console.error("Stack trace:", error.stack);
            return false;
        }
    }

    /**
     * Get question from cache by ID
     * @param {string} questionId
     * @returns {Promise<Object|null>}
     */
    async getQuestionCache(questionId) {
        try {
            const cachedQuestion = await redis.hGet(REDIS_KEYS.ALL_QUESTIONS, questionId);
            if (cachedQuestion) {
                console.log(`Cache hit for question: ${questionId}`);
                return JSON.parse(cachedQuestion);
            }
            console.log(`Cache miss for question: ${questionId}`);
            return null;
        } catch (error) {
            console.error("Error getting question from cache:", error);
            return null;
        }
    }

    /**
     * Invalidate question cache
     * @param {string} questionId
     * @param {string} questionContent - Optional question content to also remove
     * @returns {Promise<boolean>}
     */
    async invalidateQuestionCache(questionId, questionContent = null) {
        try {
            const pipeline = redis.multi();
            
            // Remove from main hash
            pipeline.hDel(REDIS_KEYS.ALL_QUESTIONS, questionId);
            
            // Remove content mapping if provided
            if (questionContent) {
                pipeline.hDel(REDIS_KEYS.CONTENT_TO_ID, questionContent);
            }
            
            await pipeline.exec();
            console.log(`Invalidated cache for question: ${questionId}`);
            return true;
        } catch (error) {
            console.error("Error invalidating question cache:", error);
            return false;
        }
    }

    /**
     * Get all questions from cache
     * @returns {Promise<Array|null>}
     */
    async getAllQuestionsCache() {
        try {
            const cachedQuestions = await redis.hGetAll(REDIS_KEYS.ALL_QUESTIONS);
            if (Object.keys(cachedQuestions).length === 0) {
                console.log("Cache miss for all questions");
                return null;
            }
            console.log("Cache hit for all questions");
            return Object.values(cachedQuestions).map((question) => JSON.parse(question));
        } catch (error) {
            console.error("Error getting all questions from cache:", error);
            return null;
        }
    }

    /**
     * Cache all questions (with duplicate content detection)
     * @param {Array} questions
     * @returns {Promise<boolean>}
     */
    async setAllQuestionsCache(questions) {
        try {
            if (!questions || questions.length === 0) {
                console.log("No questions to cache");
                return false;
            }

            console.log(`Starting to cache ${questions.length} questions...`);

            // Track unique content to avoid duplicate caching
            const contentMap = new Map(); // content -> first question with that content
            const uniqueQuestions = [];

            for (const question of questions) {
                const content = question.question;
                if (content && contentMap.has(content)) {
                    console.log(`Skipping duplicate content: "${content.substring(0, 50)}..."`);
                    continue;
                }
                if (content) {
                    contentMap.set(content, question.id);
                }
                uniqueQuestions.push(question);
            }

            console.log(`Caching ${uniqueQuestions.length} unique questions...`);

            const pipeline = redis.multi();
            
            // Cache only unique questions
            uniqueQuestions.forEach((question) => {
                const questionId = question.id;
                
                // Store in main hash
                pipeline.hSet(REDIS_KEYS.ALL_QUESTIONS, questionId, JSON.stringify(question));
                
                // Map content to ID for duplicate detection
                if (question.question) {
                    pipeline.hSet(REDIS_KEYS.CONTENT_TO_ID, question.question, questionId);
                }
            });
            
            const results = await pipeline.exec();
            
            if (!results) {
                console.error("Pipeline execution returned null");
                return false;
            }
            
            const skipped = questions.length - uniqueQuestions.length;
            console.log(`Cached ${uniqueQuestions.length} unique questions in Redis${skipped > 0 ? ` (skipped ${skipped} duplicates)` : ''}`);
            return true;
        } catch (error) {
            console.error("Error caching all questions:", error);
            console.error("Stack trace:", error.stack);
            return false;
        }
    }

    /**
     * Invalidate all questions cache
     * @returns {Promise<boolean>}
     */
    async invalidateAllQuestionsCache() {
        try {
            const pipeline = redis.multi();
            pipeline.del(REDIS_KEYS.ALL_QUESTIONS);
            pipeline.del(REDIS_KEYS.CONTENT_TO_ID);
            await pipeline.exec();
            console.log("Invalidated all questions cache");
            return true;
        } catch (error) {
            console.error("Error invalidating all questions cache:", error);
            return false;
        }
    }

    /**
     * Clear all old question keys (cleanup utility)
     * @returns {Promise<number>} Number of keys deleted
     */
    async cleanupOldKeys() {
        try {
            const pattern = "admin:question:*";
            const keys = await redis.keys(pattern);
            
            if (keys.length === 0) {
                console.log("No old keys to clean up");
                return 0;
            }

            // Filter out the hash keys we want to keep
            const keysToDelete = keys.filter(key => 
                key !== REDIS_KEYS.ALL_QUESTIONS && 
                key !== REDIS_KEYS.CONTENT_TO_ID
            );

            if (keysToDelete.length > 0) {
                await redis.del(...keysToDelete);
                console.log(`Cleaned up ${keysToDelete.length} old question keys`);
            }

            return keysToDelete.length;
        } catch (error) {
            console.error("Error cleaning up old keys:", error);
            return 0;
        }
    }
}

module.exports = new QuestionCache();
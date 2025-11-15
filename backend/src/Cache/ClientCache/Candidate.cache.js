const redis = require('../../redis/config');

const REDIS_KEYS = {
    CANDIDATE_PREFIX: 'candidate',
    CANDIDATE_PROFILE: 'candidate:profile',
    ALL_CANDIDATES: 'candidates:all',
};


class CandidateCache {
    constructor() {
        this.DEFAULT_TTL = 3600; // 1 hour
        this.PROFILE_TTL = 7200; // 2 hours for profiles
        this.LIST_TTL = 1800; // 30 minutes for list
    }

    /**
     * Check if candidate exists in cache
     * @param {string} candidateId
     * @returns {Promise<boolean>}
     */
    async candidateExistsInCache(candidateId) {
        try {
            const cacheKey = `${REDIS_KEYS.CANDIDATE_PREFIX}:${candidateId}`;
            return await redis.exists(cacheKey) === 1;
        } catch (error) {
            console.error('Error checking candidate existence in cache:', error);
            return false;
        }
    }

    /**
     * Get candidate from cache
     * @param {string} candidateId
     * @returns {Promise<Object|null>}
     */
    async getCandidateCache(candidateId) {
        try {
            const cacheKey = `${REDIS_KEYS.CANDIDATE_PREFIX}:${candidateId}`;
            const cachedCandidate = await redis.get(cacheKey);
            
            if (cachedCandidate) {
                console.log(`Cache hit for candidate: ${candidateId}`);
                return JSON.parse(cachedCandidate);
            }
            
            console.log(`Cache miss for candidate: ${candidateId}`);
            return null;
        } catch (error) {
            console.error('Error getting candidate from cache:', error);
            return null;
        }
    }

    /**
     * Cache candidate data
     * @param {string} candidateId
     * @param {Object} candidateData
     * @param {number} ttl - Time to live in seconds
     * @returns {Promise<boolean>}
     */
    async setCandidateCache(candidateId, candidateData, ttl = this.DEFAULT_TTL) {
        try {
            const cacheKey = `${REDIS_KEYS.CANDIDATE_PREFIX}:${candidateId}`;
            await redis.setEx(cacheKey, ttl, JSON.stringify(candidateData));
            console.log(`Cached candidate: ${candidateId}`);
            return true;
        } catch (error) {
            console.error('Error setting candidate cache:', error);
            return false;
        }
    }

    /**
     * Get candidate profile from cache
     * @param {string} candidateId
     * @returns {Promise<Object|null>}
     */
    async getProfileCache(candidateId) {
        try {
            const cacheKey = `${REDIS_KEYS.CANDIDATE_PROFILE}:${candidateId}`;
            const cached = await redis.get(cacheKey);
            
            if (cached) {
                console.log(`Cache hit for profile: ${candidateId}`);
                return JSON.parse(cached);
            }
            
            console.log(`Cache miss for profile: ${candidateId}`);
            return null;
        } catch (error) {
            console.error('Error getting profile from cache:', error);
            return null;
        }
    }

    /**
     * Cache candidate profile
     * @param {string} candidateId
     * @param {Object} profileData
     * @param {number} ttl - Time to live in seconds
     * @returns {Promise<boolean>}
     */
    async setProfileCache(candidateId, profileData, ttl = this.PROFILE_TTL) {
        try {
            const cacheKey = `${REDIS_KEYS.CANDIDATE_PROFILE}:${candidateId}`;
            await redis.setEx(cacheKey, ttl, JSON.stringify(profileData));
            console.log(`Cached profile: ${candidateId}`);
            return true;
        } catch (error) {
            console.error('Error setting profile cache:', error);
            return false;
        }
    }

    /**
     * Get all candidates from cache
     * @returns {Promise<Array|null>}
     */
    async getAllCandidatesCache() {
        try {
            const cachedCandidates = await redis.hGetAll(REDIS_KEYS.ALL_CANDIDATES);
            
            if (Object.keys(cachedCandidates).length === 0) {
                console.log('Cache miss for all candidates');
                return null;
            }
            
            console.log('Cache hit for all candidates');
            return Object.values(cachedCandidates).map(candidate => JSON.parse(candidate));
        } catch (error) {
            console.error('Error getting all candidates from cache:', error);
            return null;
        }
    }

    /**
     * Cache all candidates using Redis Hash
     * @param {Array} candidates - Array of candidate objects
     * @returns {Promise<boolean>}
     */
    async setAllCandidatesCache(candidates) {
        try {
            if (!candidates || candidates.length === 0) {
                console.log('No candidates to cache');
                return false;
            }

            const pipeline = redis.multi();
            
            // Cache each candidate in the hash
            candidates.forEach(candidate => {
                const candidateId = candidate.user_id;
                pipeline.hSet(
                    REDIS_KEYS.ALL_CANDIDATES, 
                    candidateId, 
                    JSON.stringify(candidate)
                );
                
                // Also cache individual candidate
                pipeline.setEx(
                    `${REDIS_KEYS.CANDIDATE_PREFIX}:${candidateId}`,
                    this.DEFAULT_TTL,
                    JSON.stringify(candidate)
                );
            });
            
            // Set expiration for the hash
            pipeline.expire(REDIS_KEYS.ALL_CANDIDATES, this.LIST_TTL);
            
            await pipeline.exec();
            console.log(`Cached ${candidates.length} candidates`);
            return true;
        } catch (error) {
            console.error('Error caching all candidates:', error);
            return false;
        }
    }

    /**
     * Invalidate candidate cache
     * @param {string} candidateId
     * @returns {Promise<boolean>}
     */
    async invalidateCandidateCache(candidateId) {
        try {
            const cacheKey = `${REDIS_KEYS.CANDIDATE_PREFIX}:${candidateId}`;
            const profileKey = `${REDIS_KEYS.CANDIDATE_PROFILE}:${candidateId}`;
            
            await redis.del(cacheKey);
            await redis.del(profileKey);
            
            // Also remove from all candidates hash
            await redis.hDel(REDIS_KEYS.ALL_CANDIDATES, candidateId);
            
            console.log(`Invalidated cache for candidate: ${candidateId}`);
            return true;
        } catch (error) {
            console.error('Error invalidating candidate cache:', error);
            return false;
        }
    }

    /**
     * Invalidate all candidates cache
     * @returns {Promise<boolean>}
     */
    async invalidateAllCandidatesCache() {
        try {
            await redis.del(REDIS_KEYS.ALL_CANDIDATES);
            console.log('Invalidated all candidates cache');
            return true;
        } catch (error) {
            console.error('Error invalidating all candidates cache:', error);
            return false;
        }
    }

    /**
     * Update candidate cache after profile update
     * @param {string} candidateId
     * @param {Object} updatedData
     * @returns {Promise<boolean>}
     */
    async updateCandidateCache(candidateId, updatedData) {
        try {
            // Update individual cache
            await this.setCandidateCache(candidateId, updatedData);
            await this.setProfileCache(candidateId, updatedData);
            
            // Update in all candidates hash
            await redis.hSet(
                REDIS_KEYS.ALL_CANDIDATES,
                candidateId,
                JSON.stringify(updatedData)
            );
            
            console.log(`Updated cache for candidate: ${candidateId}`);
            return true;
        } catch (error) {
            console.error('Error updating candidate cache:', error);
            return false;
        }
    }
}

module.exports = new CandidateCache();
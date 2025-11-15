const redis = require('../../redis/config');
const supabase = require('../../supabase/config');

class ApplicationCache {
    constructor() {
        this.DEFAULT_TTL = 3600; // 1 hour
        this.APPLICATION_TTL = 7200; // 2 hours for applications
    }

    /**
     * Check if application exists in cache
     * @param {string} candidateId 
     * @param {string} jobId 
     * @returns {Promise<boolean>}
     */
    async applicationExists(candidateId, jobId) {
        try {
            const cacheKey = `application:${candidateId}:${jobId}`;
            const cachedApplication = await redis.get(cacheKey);
            
            if (cachedApplication) {
                console.log(`✅ Found application in cache: ${cacheKey}`);
                return true;
            }
            
            return false;
        } catch (error) {
            console.log('⚠️ Application cache check failed (non-critical):', error.message);
            return false;
        }
    }

    /**
     * Cache application existence
     * @param {string} candidateId 
     * @param {string} jobId 
     * @param {boolean} exists 
     */
    async cacheApplicationExistence(candidateId, jobId, exists = true) {
        try {
            const cacheKey = `application:${candidateId}:${jobId}`;
            const value = exists ? 'exists' : 'not_exists';
            
            await redis.setEx(cacheKey, this.APPLICATION_TTL, value);
            console.log(`📦 Cached application existence: ${cacheKey} = ${value}`);
        } catch (error) {
            console.log('⚠️ Failed to cache application existence (non-critical):', error.message);
        }
    }

    /**
     * Get candidate data from cache or database
     * @param {string} candidateId 
     * @returns {Promise<Object|null>}
     */
    async getCandidateData(candidateId) {
        try {
            const cacheKey = `candidate:${candidateId}`;
            const cachedCandidate = await redis.get(cacheKey);
            
            if (cachedCandidate) {
                console.log(`📦 Found candidate in cache: ${candidateId}`);
                return JSON.parse(cachedCandidate);
            }

            // Cache miss - fetch from database
            console.log(`🔍 Candidate cache miss, fetching from database: ${candidateId}`);
            const { data, error } = await supabase
                .from('candidates')
                .select('*')
                .eq('user_id', candidateId)
                .single();

            if (error || !data) {
                console.log(`❌ Candidate not found: ${candidateId}`);
                return null;
            }

            // Cache the candidate data
            await this.cacheCandidateData(candidateId, data);
            return data;

        } catch (error) {
            console.log('⚠️ Error fetching candidate data (non-critical):', error.message);
            return null;
        }
    }

    /**
     * Cache candidate data
     * @param {string} candidateId 
     * @param {Object} candidateData 
     */
    async cacheCandidateData(candidateId, candidateData) {
        try {
            const cacheKey = `candidate:${candidateId}`;
            await redis.setEx(cacheKey, this.DEFAULT_TTL, JSON.stringify(candidateData));
            console.log(`📦 Cached candidate data: ${candidateId}`);
        } catch (error) {
            console.log('⚠️ Failed to cache candidate data (non-critical):', error.message);
        }
    }

    /**
     * Get job data from cache or database
     * @param {string} jobId 
     * @returns {Promise<Object|null>}
     */
    async getJobData(jobId) {
        try {
            const cacheKey = `job:${jobId}`;
            const cachedJob = await redis.get(cacheKey);
            
            if (cachedJob) {
                console.log(`📦 Found job in cache: ${jobId}`);
                return JSON.parse(cachedJob);
            }

            // Cache miss - fetch from database
            console.log(`🔍 Job cache miss, fetching from database: ${jobId}`);
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', jobId)
                .single();

            if (error || !data) {
                console.log(`❌ Job not found: ${jobId}`);
                return null;
            }

            // Cache the job data
            await this.cacheJobData(jobId, data);
            return data;

        } catch (error) {
            console.log('⚠️ Error fetching job data (non-critical):', error.message);
            return null;
        }
    }

    /**
     * Cache job data
     * @param {string} jobId 
     * @param {Object} jobData 
     */
    async cacheJobData(jobId, jobData) {
        try {
            const cacheKey = `job:${jobId}`;
            await redis.setEx(cacheKey, this.DEFAULT_TTL, JSON.stringify(jobData));
            console.log(`📦 Cached job data: ${jobId}`);
        } catch (error) {
            console.log('⚠️ Failed to cache job data (non-critical):', error.message);
        }
    }

    /**
     * Cache application data after creation
     * @param {Object} applicationData 
     */
    async cacheApplicationData(applicationData) {
        try {
            if (!applicationData || !applicationData.candidate_id || !applicationData.job_id) {
                return;
            }

            // Cache application existence
            await this.cacheApplicationExistence(
                applicationData.candidate_id, 
                applicationData.job_id, 
                true
            );

            // Cache full application data
            const appCacheKey = `application:data:${applicationData.id}`;
            await redis.setEx(appCacheKey, this.APPLICATION_TTL, JSON.stringify(applicationData));
            console.log(`📦 Cached application data: ${appCacheKey}`);

            // Cache candidate applications list (invalidate and refresh)
            await this.invalidateCandidateApplications(applicationData.candidate_id);

        } catch (error) {
            console.log('⚠️ Failed to cache application data (non-critical):', error.message);
        }
    }

    /**
     * Get applications for a candidate from cache
     * @param {string} candidateId 
     * @returns {Promise<Array|null>}
     */
    async getCandidateApplications(candidateId) {
        try {
            const cacheKey = `candidate:${candidateId}:applications`;
            const cachedApplications = await redis.get(cacheKey);
            
            if (cachedApplications) {
                console.log(`📦 Found candidate applications in cache: ${candidateId}`);
                return JSON.parse(cachedApplications);
            }

            return null;
        } catch (error) {
            console.log('⚠️ Error getting candidate applications from cache (non-critical):', error.message);
            return null;
        }
    }

    /**
     * Cache candidate applications
     * @param {string} candidateId 
     * @param {Array} applications 
     */
    async cacheCandidateApplications(candidateId, applications) {
        try {
            const cacheKey = `candidate:${candidateId}:applications`;
            await redis.setEx(cacheKey, this.DEFAULT_TTL, JSON.stringify(applications));
            console.log(`📦 Cached candidate applications: ${candidateId} (${applications.length} items)`);
        } catch (error) {
            console.log('⚠️ Failed to cache candidate applications (non-critical):', error.message);
        }
    }

    /**
     * Invalidate candidate applications cache
     * @param {string} candidateId 
     */
    async invalidateCandidateApplications(candidateId) {
        try {
            const cacheKey = `candidate:${candidateId}:applications`;
            await redis.del(cacheKey);
            console.log(`🗑️ Invalidated candidate applications cache: ${candidateId}`);
        } catch (error) {
            console.log('⚠️ Failed to invalidate candidate applications cache (non-critical):', error.message);
        }
    }

    /**
     * Get job candidates from cache
     * @param {string} jobId 
     * @returns {Promise<Array|null>}
     */
    async getJobCandidates(jobId) {
        try {
            const cacheKey = `job:${jobId}:candidates`;
            const cachedCandidates = await redis.get(cacheKey);
            
            if (cachedCandidates) {
                console.log(`📦 Found job candidates in cache: ${jobId}`);
                return JSON.parse(cachedCandidates);
            }

            return null;
        } catch (error) {
            console.log('⚠️ Error getting job candidates from cache (non-critical):', error.message);
            return null;
        }
    }

    /**
     * Cache job candidates
     * @param {string} jobId 
     * @param {Array} candidates 
     */
    async cacheJobCandidates(jobId, candidates) {
        try {
            const cacheKey = `job:${jobId}:candidates`;
            await redis.setEx(cacheKey, this.DEFAULT_TTL, JSON.stringify(candidates));
            console.log(`📦 Cached job candidates: ${jobId} (${candidates.length} items)`);
        } catch (error) {
            console.log('⚠️ Failed to cache job candidates (non-critical):', error.message);
        }
    }

    /**
     * Cache application competition rate
     * @param {string} jobId 
     * @param {Object} competitionData 
     */
    async cacheCompetitionRate(jobId, competitionData) {
        try {
            const cacheKey = `job:${jobId}:competition`;
            await redis.setEx(cacheKey, 1800, JSON.stringify(competitionData)); // 30 minutes TTL
            console.log(`📦 Cached competition rate: ${jobId}`);
        } catch (error) {
            console.log('⚠️ Failed to cache competition rate (non-critical):', error.message);
        }
    }

    /**
     * Get competition rate from cache
     * @param {string} jobId 
     * @returns {Promise<Object|null>}
     */
    async getCompetitionRate(jobId) {
        try {
            const cacheKey = `job:${jobId}:competition`;
            const cachedData = await redis.get(cacheKey);
            
            if (cachedData) {
                console.log(`📦 Found competition rate in cache: ${jobId}`);
                return JSON.parse(cachedData);
            }

            return null;
        } catch (error) {
            console.log('⚠️ Error getting competition rate from cache (non-critical):', error.message);
            return null;
        }
    }

    /**
     * Clear all application-related cache for a job (when application is updated)
     * @param {string} jobId 
     * @param {string} candidateId 
     */
    async invalidateApplicationCache(jobId, candidateId) {
        try {
            const keysToDelete = [
                `job:${jobId}:candidates`,
                `job:${jobId}:competition`,
                `candidate:${candidateId}:applications`
            ];

            await Promise.all(keysToDelete.map(key => redis.del(key)));
            console.log(`🗑️ Invalidated application cache for job: ${jobId}, candidate: ${candidateId}`);
        } catch (error) {
            console.log('⚠️ Failed to invalidate application cache (non-critical):', error.message);
        }
    }
}

module.exports = new ApplicationCache();
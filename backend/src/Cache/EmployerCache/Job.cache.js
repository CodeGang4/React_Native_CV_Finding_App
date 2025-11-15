const redis = require('../../redis/config');

const JOB_PREFIX = {
    JOB_DETAILS: 'job:job_details',
    HIDDEN_JOBS: 'job:hidden_jobs',
    ALL_JOBS: 'job:all_jobs',
    TITLE_TO_ID: 'job:content', 
    TOPVIEWS_LIST:'job:topviews',
    USER_HIDDEN_JOBS: 'job:user_hidden' // New: for user-specific hidden jobs
}


class JobCache {
    constructor() {
        this.DEFAULT_TTL = 3600; // 1 hour
        this.APPLICATION_TTL = 7200; // 2 hours for applications
    }

    async checkJobInCache(jobId) {
        try {
            const cacheData = await redis.exists(`${JOB_PREFIX.JOB_DETAILS}:${jobId}`);
            return cacheData === 1;
        } catch (error) {
            return false;
        }
    }

    async getAllJobsFromCache() {
        try {
            const cacheJobs = await redis.get(JOB_PREFIX.ALL_JOBS);
            if(Object.keys(cacheJobs).length === 0) {
                return null;
            }

            return Object.values(cacheJobs).map(job => JSON.parse(job));
        } catch (error) {
            return null;
        }
    }

    async setAllJobsToCache(jobsData, ttl = this.DEFAULT_TTL) {
        try {
            if(!jobsData || jobsData.length === 0) {
                return false;
            }
            const pipeline = redis.multi();
            jobsData.forEach(job => {
                const jobId = job.id;
                pipeline.hSet(JOB_PREFIX.ALL_JOBS, jobId, JSON.stringify(job));
            })

            pipeline.setEx(
                `${JOB_PREFIX.ALL_JOBS}:${jobId}`,
                this.DEFAULT_TTL,
                JSON.stringify(jobsData)
            );


            pipeline.expire(JOB_PREFIX.ALL_JOBS, this.DEFAULT_TTL);
            await pipeline.exec();
            return true;
        } catch (error) {
            return false;
        }
    }

    async getJobFromCache(jobId) {
        try {
            const cacheKey = `${JOB_PREFIX.JOB_DETAILS}:${jobId}`;
            const cached = await redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    async setJobToCache(jobId, jobData, ttl = this.DEFAULT_TTL) {
        try {
            const cacheKey = `${JOB_PREFIX.JOB_DETAILS}:${jobId}`;
            await redis.setEx(cacheKey, ttl, JSON.stringify(jobData));
            return true;
        } catch (error) {
            return false;
        }
    }

    async deleteJobFromCache(jobId) {
        try {
            const cacheKey = `${JOB_PREFIX.JOB_DETAILS}:${jobId}`
            await redis.del(cacheKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    
    /**
     * Check if job is globally hidden by admin
     * @param {string} jobId 
     * @returns {Promise<boolean>}
     */
    async checkGlobalHiddenJob(jobId) {
        try {
            const cacheData = await redis.exists(`${JOB_PREFIX.HIDDEN_JOBS}:${jobId}`);
            return cacheData === 1;
        } catch (error) {
            console.error('Error checking global hidden job in cache:', error);
            return false;
        }
    }

    /**
     * Hide job globally (admin action)
     * @param {string} jobId 
     * @param {number} ttl 
     * @returns {Promise<boolean>}
     */
    async setGlobalHiddenJob(jobId, ttl = this.DEFAULT_TTL) {
        try {
            const cacheKey = `${JOB_PREFIX.HIDDEN_JOBS}:${jobId}`;
            await redis.setEx(cacheKey, ttl, JSON.stringify({
                hiddenAt: new Date().toISOString(),
                reason: 'admin_hidden'
            }));
            console.log(`Job ${jobId} globally hidden`);
            return true;
        } catch (error) {
            console.error('Error setting global hidden job:', error);
            return false;
        }   
    }

    /**
     * Unhide job globally (admin action)
     * @param {string} jobId 
     * @returns {Promise<boolean>}
     */
    async removeGlobalHiddenJob(jobId) {
        try {
            const cacheKey = `${JOB_PREFIX.HIDDEN_JOBS}:${jobId}`;
            await redis.del(cacheKey);
            console.log(`Job ${jobId} globally unhidden`);
            return true;
        } catch (error) {
            console.error('Error removing global hidden job:', error);
            return false;
        }
    }

    /**
     * Get all globally hidden jobs
     * @returns {Promise<Array>}
     */
    async getAllGlobalHiddenJobs() {
        try {
            const pattern = `${JOB_PREFIX.HIDDEN_JOBS}:*`;
            const keys = await redis.keys(pattern);
            const hiddenJobIds = keys.map(key => key.split(':')[2]);
            return hiddenJobIds;
        } catch (error) {
            console.error('Error getting all global hidden jobs:', error);
            return [];
        }
    }

    
    /**
     * Check if job is hidden for specific user
     * @param {string} userId 
     * @param {string} jobId 
     * @returns {Promise<boolean>}
     */
    async checkUserHiddenJob(userId, jobId) {
        try {
            const cacheKey = `${JOB_PREFIX.USER_HIDDEN_JOBS}:${userId}`;
            const isHidden = await redis.hExists(cacheKey, jobId);
            return isHidden;
        } catch (error) {
            console.error('Error checking user hidden job:', error);
            return false;
        }
    }

    /**
     * Hide job for specific user
     * @param {string} userId 
     * @param {string} jobId 
     * @param {number} ttl 
     * @returns {Promise<boolean>}
     */
    async setUserHiddenJob(userId, jobId, ttl = this.DEFAULT_TTL) {
        try {
            const cacheKey = `${JOB_PREFIX.USER_HIDDEN_JOBS}:${userId}`;
            await redis.hSet(cacheKey, jobId, JSON.stringify({
                hiddenAt: new Date().toISOString(),
                reason: 'user_hidden'
            }));
            
            // Set expiration for the hash
            await redis.expire(cacheKey, ttl);
            
            console.log(`Job ${jobId} hidden for user ${userId}`);
            return true;
        } catch (error) {
            console.error('Error setting user hidden job:', error);
            return false;
        }
    }

    /**
     * Unhide job for specific user
     * @param {string} userId 
     * @param {string} jobId 
     * @returns {Promise<boolean>}
     */
    async removeUserHiddenJob(userId, jobId) {
        try {
            const cacheKey = `${JOB_PREFIX.USER_HIDDEN_JOBS}:${userId}`;
            await redis.hDel(cacheKey, jobId);
            console.log(`Job ${jobId} unhidden for user ${userId}`);
            return true;
        } catch (error) {
            console.error('Error removing user hidden job:', error);
            return false;
        }
    }

    /**
     * Get all hidden jobs for specific user
     * @param {string} userId 
     * @returns {Promise<Array>}
     */
    async getUserHiddenJobs(userId) {
        try {
            const cacheKey = `${JOB_PREFIX.USER_HIDDEN_JOBS}:${userId}`;
            const hiddenJobs = await redis.hGetAll(cacheKey);
            
            if (Object.keys(hiddenJobs).length === 0) {
                return [];
            }

            // Return array of job IDs with metadata
            return Object.entries(hiddenJobs).map(([jobId, metadata]) => ({
                jobId,
                ...JSON.parse(metadata)
            }));
        } catch (error) {
            console.error('Error getting user hidden jobs:', error);
            return [];
        }
    }

    /**
     * Check if job should be hidden (either globally or for specific user)
     * @param {string} jobId 
     * @param {string} userId - Optional, if provided will check user-specific hiding
     * @returns {Promise<boolean>}
     */
    async isJobHidden(jobId, userId = null) {
        try {
            // Check global hidden first
            const isGlobalHidden = await this.checkGlobalHiddenJob(jobId);
            if (isGlobalHidden) {
                return true;
            }

            // Check user-specific hidden if userId provided
            if (userId) {
                const isUserHidden = await this.checkUserHiddenJob(userId, jobId);
                return isUserHidden;
            }

            return false;
        } catch (error) {
            console.error('Error checking if job is hidden:', error);
            return false;
        }
    }

    /**
     * Filter out hidden jobs from job list
     * @param {Array} jobs 
     * @param {string} userId - Optional, if provided will filter user-specific hidden jobs
     * @returns {Promise<Array>}
     */
    async filterHiddenJobs(jobs, userId = null) {
        try {
            if (!jobs || jobs.length === 0) {
                return [];
            }

            const visibleJobs = [];
            
            for (const job of jobs) {
                const isHidden = await this.isJobHidden(job.id, userId);
                if (!isHidden) {
                    visibleJobs.push(job);
                }
            }

            return visibleJobs;
        } catch (error) {
            console.error('Error filtering hidden jobs:', error);
            return jobs; // Return original jobs if error
        }
    }

    async invalidateJobCache(jobId, jobContent = null) {
        try {
            const pipeline = redis.multi();

            // Remove from main hash
            pipeline.hDel(JOB_PREFIX.ALL_JOBS, jobId);

            // Remove content mapping if provided
            if (jobContent) {
                pipeline.hDel(JOB_PREFIX.TITLE_TO_ID, jobContent);
            }

            await pipeline.exec();
            console.log(`Invalidated cache for job: ${jobId}`);
            return true;
        } catch (error) {
            console.error("Error invalidating job cache:", error);
            return false;
        }
    }

    /**
     * Invalidate all jobs cache
     * @returns {Promise<boolean>}
     */
    async invalidateAllJobsCache() {
        try {
            await redis.del(JOB_PREFIX.ALL_JOBS);
            console.log('Invalidated all jobs cache');
            return true;
        } catch (error) {
            console.error('Error invalidating all jobs cache:', error);
            return false;
        }
    }

    async getTopViewsCache(number) {
        try {
            const cacheKey = `${JOB_PREFIX.TOPVIEWS_LIST}:${number}`;
            const cached = await redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (error) {
            return null;
        }
    }

    async setTopViewsCache(number, jobsData, ttl = this.DEFAULT_TTL) {
        try {
            const cacheKey = `${JOB_PREFIX.TOPVIEWS_LIST}:${number}`;
            await redis.setEx(cacheKey, ttl, JSON.stringify(jobsData));
            return true;
        } catch (error) {
            return false;
        }
    }
}

module.exports = new JobCache();
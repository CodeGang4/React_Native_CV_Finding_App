const JobCache = require("../../Cache/EmployerCache/Job.cache");
const JobRepository = require("../../repositories/EmployerRepositories/Job.repository");
const { AppError } = require("../../utils/errorHandler");

/**
 * Service Layer - Business logic for Jobs
 * Responsibility: Orchestrate Repository + Cache, handle business rules
 */
class JobService {
    /**
     * Get all jobs with caching and optional filtering for user
     * @param {string} userId - Optional, to filter hidden jobs for specific user
     * @returns {Promise<Array>}
     */
    async getAllJobs(userId = null) {
        try {
            // Try cache first
            let jobs = await JobCache.getAllJobsFromCache();
            
            if (jobs && jobs.length > 0) {
                console.log("Jobs retrieved from cache");
                
                // Filter hidden jobs if userId provided
                if (userId) {
                    jobs = await JobCache.filterHiddenJobs(jobs, userId);
                }
                
                return jobs;
            }

            // Cache miss: Get from database
            const { data, error } = await JobRepository.getJob();
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to fetch jobs", 500);
            }

            if (!data || data.length === 0) {
                return [];
            }

            // Cache all jobs
            await JobCache.setAllJobsToCache(data);
            console.log(`Cached ${data.length} jobs`);

            // Filter hidden jobs if userId provided
            let filteredJobs = data;
            if (userId) {
                filteredJobs = await JobCache.filterHiddenJobs(data, userId);
            }

            return filteredJobs;
        } catch (error) {
            console.error("JobService.getAllJobs error:", error);
            throw error;
        }
    }

    /**
     * Get jobs by company ID with caching
     * @param {string} companyId
     * @param {string} userId - Optional, to filter hidden jobs
     * @returns {Promise<Array>}
     */
    async getJobsByCompanyId(companyId, userId = null) {
        try {
            if (!companyId) {
                throw new AppError("Company ID is required", 400);
            }

            // Get job IDs from repository
            const { data: jobIds, error } = await JobRepository.getJobByCompanyId(companyId);
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to fetch company jobs", 500);
            }

            if (!jobIds || jobIds.length === 0) {
                return [];
            }

            const jobs = [];
            const jobIdList = jobIds.map(job => job.id);

            // Get each job (from cache or database)
            for (const jobId of jobIdList) {
                try {
                    let jobData = await JobCache.getJobFromCache(jobId);
                    
                    if (!jobData) {
                        // Cache miss: Get from database
                        const { data, error: jobError } = await JobRepository.getJobDetails(jobId);
                        if (!jobError && data) {
                            jobData = data;
                            await JobCache.setJobToCache(jobId, data);
                        }
                    }

                    if (jobData) {
                        jobs.push(jobData);
                    }
                } catch (error) {
                    console.error(`Error getting job ${jobId}:`, error);
                }
            }

            // Filter hidden jobs if userId provided
            let filteredJobs = jobs;
            if (userId) {
                filteredJobs = await JobCache.filterHiddenJobs(jobs, userId);
            }

            // Sort by created_at
            filteredJobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            return filteredJobs;
        } catch (error) {
            console.error("JobService.getJobsByCompanyId error:", error);
            throw error;
        }
    }

    /**
     * Get job details by ID with caching
     * @param {string} jobId
     * @param {string} userId - Optional, to check if job is hidden for user
     * @returns {Promise<Object>}
     */
    async getJobDetails(jobId, userId = null) {
        try {
            if (!jobId) {
                throw new AppError("Job ID is required", 400);
            }

            // Check if job is hidden before serving
            if (userId) {
                const isHidden = await JobCache.isJobHidden(jobId, userId);
                if (isHidden) {
                    throw new AppError("Job not found", 404);
                }
            } else {
                // Check only global hidden for anonymous users
                const isGlobalHidden = await JobCache.checkGlobalHiddenJob(jobId);
                if (isGlobalHidden) {
                    throw new AppError("Job not found", 404);
                }
            }

            // Try cache first
            let jobData = await JobCache.getJobFromCache(jobId);
            if (jobData) {
                console.log(`Job ${jobId} served from cache`);
                return jobData;
            }

            // Cache miss: Get from database
            const { data, error } = await JobRepository.getJobDetails(jobId);
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to fetch job details", 500);
            }

            if (!data) {
                throw new AppError("Job not found", 404);
            }

            // Cache the job
            await JobCache.setJobToCache(jobId, data);
            console.log(`Job ${jobId} cached successfully`);

            return data;
        } catch (error) {
            console.error("JobService.getJobDetails error:", error);
            throw error;
        }
    }

    /**
     * Add new job(s) with duplicate checking
     * @param {Object|Array} jobData - Single job or array of jobs
     * @returns {Promise<Object>}
     */
    async addJob(employer_id,jobData) {
        try {
            if(!employer_id) {
                throw new AppError("Employer ID is required", 400);
            }
            const jobArray = Array.isArray(jobData) ? jobData : [jobData];

            if (jobArray.length === 0) {
                throw new AppError("No job data provided", 400);
            }

            // Validate required fields
            const requiredFields = ["title", "description", "requirements", "location", "job_type", "salary", "quantity", "position", "education", "expired_date"];
            for (const job of jobArray) {
                const missingFields = requiredFields.filter(field => !job[field]);
                if (missingFields.length > 0) {
                    throw new AppError(`Missing required fields: ${missingFields.join(", ")}`, 400);
                }
            }

            // Check for duplicate titles
            const jobTitles = jobArray.map(job => job.title);
            const { data: existingJobs, error: checkError } = await JobRepository.checkMultipleJobTitles(jobTitles);
            
            if (checkError) {
                console.error("Error checking duplicates:", checkError);
            }

            // Filter out jobs that already exist
            const existingTitles = new Set((existingJobs || []).map(job => job.title));
            const newJobs = jobArray.filter(job => !existingTitles.has(job.title));
            const newJobsWithEmployerId = newJobs.map(job => ({ ...job, employer_id }));

            if (newJobs.length === 0) {
                throw new AppError("All job titles already exist", 409);
            }

            if (existingTitles.size > 0) {
                console.log(`Skipped ${existingTitles.size} duplicate job(s)`);
            }

            // Add new jobs to database
            const { data, error } = await JobRepository.addJob(employer_id,newJobsWithEmployerId);
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to create jobs in database", 500);
            }

            if (!data) {
                throw new AppError("No jobs were created", 500);
            }

            // Ensure data is always an array
            const jobsArray = Array.isArray(data) ? data : [data];

            if (jobsArray.length === 0) {
                throw new AppError("No jobs were created", 500);
            }

            // Cache each created job
            for (const job of jobsArray) {
                try {
                    await JobCache.setJobToCache(job.id, job);
                    console.log(`Cached job with ID: ${job.id}`);
                } catch (cacheError) {
                    console.error(`Failed to cache job with ID ${job.id}:`, cacheError);
                }
            }

            // Invalidate all jobs cache to refresh list
            await JobCache.invalidateAllJobsCache();

            console.log(`Created ${jobsArray.length} new job(s) successfully`);

            const response = {
                created: jobsArray,
                skipped: existingTitles.size,
                message: existingTitles.size > 0 
                    ? `Created ${jobsArray.length} jobs, skipped ${existingTitles.size} duplicates`
                    : `Created ${jobsArray.length} jobs`
            };

            return Array.isArray(jobData) ? response : response.created[0];
        } catch (error) {
            console.error("JobService.addJob error:", error);
            throw error;
        }
    }

    /**
     * Update job by ID
     * @param {string} jobId
     * @param {Object} updateData
     * @returns {Promise<Object>}
     */
    async updateJob(jobId, updateData) {
        try {
            if (!jobId) {
                throw new AppError("Job ID is required", 400);
            }

            if (!updateData || Object.keys(updateData).length === 0) {
                throw new AppError("No update data provided", 400);
            }

            // Add updated_at timestamp
            updateData.updated_at = new Date().toISOString();

            const { data, error } = await JobRepository.updateJob(jobId, updateData);
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to update job", 500);
            }

            if (!data) {
                throw new AppError("Job not found", 404);
            }

            // Update cache
            await JobCache.setJobToCache(jobId, data);
            
            // Invalidate all jobs cache
            await JobCache.invalidateAllJobsCache();

            console.log(`Job updated successfully: ${jobId}`);
            return data;
        } catch (error) {
            console.error("JobService.updateJob error:", error);
            throw error;
        }
    }

    /**
     * Delete job by ID
     * @param {string} jobId
     * @returns {Promise<Object>}
     */
    async deleteJob(jobId) {
        try {
            if (!jobId) {
                throw new AppError("Job ID is required", 400);
            }

            // Get job data before deletion (for cache cleanup)
            const cachedJob = await JobCache.getJobFromCache(jobId);
            const jobTitle = cachedJob?.title;

            const { data, error } = await JobRepository.deleteJob(jobId);
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to delete job", 500);
            }

            if (!data) {
                throw new AppError("Job not found", 404);
            }

            // Remove from cache
            await JobCache.deleteJobFromCache(jobId);
            await JobCache.invalidateJobCache(jobId, jobTitle);
            
            // Invalidate all jobs cache
            await JobCache.invalidateAllJobsCache();

            console.log(`Job deleted successfully: ${jobId}`);
            return data;
        } catch (error) {
            console.error("JobService.deleteJob error:", error);
            throw error;
        }
    }

    /**
     * Increment job view count
     * @param {string} jobId
     * @returns {Promise<Object>}
     */
    async incrementJobViewCount(jobId) {
        try {
            if (!jobId) {
                throw new AppError("Job ID is required", 400);
            }

            const { data, error } = await JobRepository.incrementJobViews(jobId);
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to increment view count", 500);
            }

            if (!data) {
                throw new AppError("Job not found", 404);
            }

            // Get updated job data and update cache
            const { data: updatedJob, error: fetchError } = await JobRepository.getJobDetails(jobId);
            if (!fetchError && updatedJob) {
                await JobCache.setJobToCache(jobId, updatedJob);
            }

            console.log(`View count incremented for job: ${jobId}`);
            return { jobId, views: data };
        } catch (error) {
            console.error("JobService.incrementJobViewCount error:", error);
            throw error;
        }
    }

    /**
     * Get top viewed jobs
     * @param {number} number - Number of jobs to retrieve
     * @returns {Promise<Array>}
     */
    async getTopViewedJobs(number = 10) {
        try {
            if (!number || number <= 0) {
                throw new AppError("Invalid number parameter", 400);
            }

            // Try cache first
            let topJobs = await JobCache.getTopViewsCache(number);
            if (topJobs) {
                console.log(`Top ${number} jobs retrieved from cache`);
                return topJobs;
            }

            // Cache miss: Get from database
            const { data, error } = await JobRepository.getTopViewedJobs(number);
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to fetch top viewed jobs", 500);
            }

            if (!data || data.length === 0) {
                return [];
            }

            // Cache the result
            await JobCache.setTopViewsCache(number, data);
            console.log(`Cached top ${number} viewed jobs`);

            return data;
        } catch (error) {
            console.error("JobService.getTopViewedJobs error:", error);
            throw error;
        }
    }

    /**
     * Hide job for specific user
     * @param {string} userId
     * @param {string} jobId
     * @returns {Promise<Object>}
     */
    async hideJobForUser(userId, jobId) {
        try {
            if (!userId || !jobId) {
                throw new AppError("User ID and Job ID are required", 400);
            }

            // Check if job exists
            const jobExists = await JobCache.checkJobInCache(jobId);
            if (!jobExists) {
                const { data, error } = await JobRepository.getJobDetails(jobId);
                if (error || !data) {
                    throw new AppError("Job not found", 404);
                }
            }

            // Hide job in database
            const { data, error } = await JobRepository.hideJob(jobId, userId);
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to hide job", 500);
            }

            // Cache the hidden job
            await JobCache.setUserHiddenJob(userId, jobId);

            console.log(`Job ${jobId} hidden for user ${userId}`);
            return { success: true, hidden_at: data[0]?.hidden_at };
        } catch (error) {
            console.error("JobService.hideJobForUser error:", error);
            throw error;
        }
    }

    /**
     * Get hidden jobs for user
     * @param {string} userId
     * @returns {Promise<Array>}
     */
    async getHiddenJobsForUser(userId) {
        try {
            if (!userId) {
                throw new AppError("User ID is required", 400);
            }

            // Try cache first
            let hiddenJobs = await JobCache.getUserHiddenJobs(userId);
            if (hiddenJobs.length > 0) {
                console.log(`Hidden jobs for user ${userId} retrieved from cache`);
                return hiddenJobs;
            }

            // Cache miss: Get from database
            const { data, error } = await JobRepository.getHiddenJob(userId);
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to fetch hidden jobs", 500);
            }

            if (!data || data.length === 0) {
                return [];
            }

            // Cache each hidden job
            for (const hiddenJob of data) {
                await JobCache.setUserHiddenJob(userId, hiddenJob.job_id);
            }

            console.log(`Cached ${data.length} hidden jobs for user ${userId}`);
            return data;
        } catch (error) {
            console.error("JobService.getHiddenJobsForUser error:", error);
            throw error;
        }
    }

    /**
     * Admin: Hide job globally
     * @param {string} jobId
     * @returns {Promise<boolean>}
     */
    async hideJobGlobally(jobId) {
        try {
            if (!jobId) {
                throw new AppError("Job ID is required", 400);
            }

            // Check if job exists
            const { data, error } = await JobRepository.getJobDetails(jobId);
            if (error || !data) {
                throw new AppError("Job not found", 404);
            }

            // Hide job globally in cache
            await JobCache.setGlobalHiddenJob(jobId);
            
            console.log(`Job ${jobId} hidden globally`);
            return true;
        } catch (error) {
            console.error("JobService.hideJobGlobally error:", error);
            throw error;
        }
    }

    /**
     * Admin: Unhide job globally
     * @param {string} jobId
     * @returns {Promise<boolean>}
     */
    async unhideJobGlobally(jobId) {
        try {
            if (!jobId) {
                throw new AppError("Job ID is required", 400);
            }

            await JobCache.removeGlobalHiddenJob(jobId);
            
            console.log(`Job ${jobId} unhidden globally`);
            return true;
        } catch (error) {
            console.error("JobService.unhideJobGlobally error:", error);
            throw error;
        }
    }
}

module.exports = new JobService();
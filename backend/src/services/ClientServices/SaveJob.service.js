const SaveJobRepository = require('../../repositories/ClientRepositories/SaveJob.repository');
const redis = require('../../redis/config');
const { AppError } = require('../../utils/errorHandler');

class SaveJobService {
    /**
     * Get saved jobs by candidate
     */
    async getSavedJobsByCandidate(candidate_id) {
        const savedJobs = await SaveJobRepository.getSavedJobsByCandidate(candidate_id);
        return savedJobs;
    }

    /**
     * Get saved job details
     */
    async getSavedJobDetails(candidate_id, job_id) {
        const jobDetails = await SaveJobRepository.getSavedJobDetails(candidate_id, job_id);
        return jobDetails;
    }

    /**
     * Save job
     */
    async saveJob(candidate_id, job_id) {
        // Check if already saved
        const alreadySaved = await SaveJobRepository.checkJobSaved(candidate_id, job_id);
        
        if (alreadySaved) {
            throw new AppError('Job already saved', 400);
        }

        // Save job
        const savedJob = await SaveJobRepository.saveJob(candidate_id, job_id);

        // Redis log
        try {
            await redis.setEx(
                `log:saveJob:${candidate_id}:${job_id}:${Date.now()}`,
                60 * 60 * 24,
                JSON.stringify({
                    action: 'saveJob',
                    candidate_id,
                    job_id,
                    time: new Date().toISOString(),
                })
            );
        } catch (err) {
            console.error('Redis log error (saveJob):', err);
        }

        return savedJob;
    }

    /**
     * Unsave job
     */
    async unsaveJob(candidate_id, job_id) {
        // Check if job exists
        const existingSave = await SaveJobRepository.checkJobSaved(candidate_id, job_id);

        if (!existingSave) {
            throw new AppError('Job is not saved by this candidate', 404);
        }

        // Delete saved job
        const deletedJob = await SaveJobRepository.unsaveJob(candidate_id, job_id);

        return {
            message: 'Job unsaved successfully',
            deleted_record: deletedJob[0]
        };
    }
}

module.exports = new SaveJobService();

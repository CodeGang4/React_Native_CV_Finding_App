const ApplicationRepository = require('../../repositories/ClientRepositories/Application.repository');
const ApplicationCache = require('../../Cache/ClientCache/Application.cache');
const { AppError } = require('../../utils/errorHandler');

class ApplicationService {
    /**
     * Create new application
     */
    async createApplication(candidate_id, job_id) {
        // Check cache first
        const cachedExists = await ApplicationCache.applicationExists(candidate_id, job_id);
        if (cachedExists) {
            throw new AppError('Application already exists for this candidate and job', 400);
        }

        // Check database
        const existingApplication = await ApplicationRepository.checkApplicationExists(candidate_id, job_id);
        if (existingApplication) {
            await ApplicationCache.cacheApplicationExistence(candidate_id, job_id, true);
            throw new AppError('Application already exists for this candidate and job', 400);
        }

        // Get candidate data
        const candidateData = await ApplicationCache.getCandidateData(candidate_id);
        if (!candidateData) {
            throw new AppError('Candidate does not exist', 400);
        }

        // Get job data
        const jobData = await ApplicationCache.getJobData(job_id);
        if (!jobData) {
            throw new AppError('Job does not exist', 400);
        }

        // Create application
        const applicationData = {
            candidate_id: candidate_id,
            cv_url: candidateData.cv_url,
            job_id,
            employer_id: jobData.employer_id,
            status: 'pending',
            applied_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
        };

        const application = await ApplicationRepository.createApplication(applicationData);

        // Cache the new application
        await ApplicationCache.cacheApplicationData(application);

        return application;
    }

    /**
     * Get applications by candidate
     */
    async getApplicationsByCandidate(candidate_id) {
        // Try cache first
        let applications = await ApplicationCache.getCandidateApplications(candidate_id);
        
        if (!applications) {
            // Fetch from database
            applications = await ApplicationRepository.getApplicationsByCandidate(candidate_id);
            
            // Cache the result
            await ApplicationCache.cacheCandidateApplications(candidate_id, applications);
        }

        if (applications.length === 0) {
            throw new AppError('No applications found for this candidate', 404);
        }

        return applications;
    }

    /**
     * Get all candidates for a job
     */
    async getCandidatesByJob(job_id) {
        // Try cache first
        let candidates = await ApplicationCache.getJobCandidates(job_id);
        
        if (!candidates) {
            // Fetch from database
            candidates = await ApplicationRepository.getCandidatesByJob(job_id);
            
            // Cache the result
            await ApplicationCache.cacheJobCandidates(job_id, candidates);
        }

        return candidates;
    }

    /**
     * Calculate competition rate for a job
     */
    async calculateCompetitionRate(job_id) {
        // Try cache first
        let competitionData = await ApplicationCache.getCompetitionRate(job_id);
        
        if (!competitionData) {
            // Get application count
            const applicationCount = await ApplicationRepository.getApplicationCountByJob(job_id);

            // Get job data
            const jobData = await ApplicationCache.getJobData(job_id);
            if (!jobData) {
                throw new AppError('Job not found', 404);
            }
            
            const numberOfPositions = jobData.quantity || 1;
            const competitionRate = numberOfPositions > 0 
                ? (applicationCount / numberOfPositions) * 100 
                : 0;

            competitionData = {
                job_id: job_id,
                application_count: applicationCount,
                number_of_positions: numberOfPositions,
                competition_rate: `${competitionRate.toFixed(2)}%`,
            };

            // Cache the result
            await ApplicationCache.cacheCompetitionRate(job_id, competitionData);
        }

        return competitionData;
    }

    /**
     * Update application status
     */
    async updateApplicationStatus(application_id, status) {
        const validStatuses = ['pending', 'reviewed', 'interviewed', 'hired', 'rejected'];
        
        if (!validStatuses.includes(status)) {
            throw new AppError('Invalid status', 400);
        }

        const updatedApplication = await ApplicationRepository.updateApplicationStatus(application_id, status);

        if (!updatedApplication) {
            throw new AppError('Application not found or not updated', 404);
        }

        // Invalidate cache
        await ApplicationCache.invalidateApplicationCache(
            updatedApplication.job_id,
            updatedApplication.candidate_id
        );

        return updatedApplication;
    }

    /**
     * Get applications by status for a job
     */
    async getApplicationsByStatusAndJob(job_id, status) {
        const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
        
        if (!validStatuses.includes(status)) {
            throw new AppError('Invalid status', 400);
        }

        const applications = await ApplicationRepository.getApplicationsByStatusAndJob(job_id, status);
        return applications;
    }
}

module.exports = new ApplicationService();

const ApplicationService = require('../../services/ClientServices/Application.service');
const { asyncHandler } = require('../../utils/errorHandler');
const { sendData } = require('../../utils/response');

class ApplicationController {
    /**
     * Create new application
     * POST /application
     */
    createApplication = asyncHandler(async (req, res) => {
        const { candidate_id, job_id } = req.body;
        const application = await ApplicationService.createApplication(candidate_id, job_id);
        return sendData(res, application, 201);
    });

    /**
     * Get applications by candidate
     * GET /application/candidate/:candidate_id
     */
    getApplicationByCandidate = asyncHandler(async (req, res) => {
        const { candidate_id } = req.params;
        const applications = await ApplicationService.getApplicationsByCandidate(candidate_id);
        return sendData(res, applications);
    });

    /**
     * Get all candidates for a job
     * GET /application/job/:jobId/candidates
     */
    getAllCandidates = asyncHandler(async (req, res) => {
        const { jobId } = req.params;
        const candidates = await ApplicationService.getCandidatesByJob(jobId);
        return sendData(res, candidates);
    });

    /**
     * Calculate competition rate for a job
     * GET /application/job/:jobId/competition-rate
     */
    calculateCompetitionRate = asyncHandler(async (req, res) => {
        const { jobId } = req.params;
        const competitionData = await ApplicationService.calculateCompetitionRate(jobId);
        return sendData(res, competitionData);
    });

    /**
     * Update application status
     * PUT /application/:applicationId/status
     */
    updateStatus = asyncHandler(async (req, res) => {
        const { applicationId } = req.params;
        const { status } = req.body;
        const updatedApplication = await ApplicationService.updateApplicationStatus(applicationId, status);
        return sendData(res, updatedApplication);
    });

    /**
     * Get applications by status for a job
     * GET /application/job/:job_id/status/:status
     */
    getAllApplicationsByStatus = asyncHandler(async (req, res) => {
        const { job_id } = req.params;
        const { status } = req.query;
        const applications = await ApplicationService.getApplicationsByStatusAndJob(job_id, status);
        return sendData(res, applications);
    });
}

module.exports = new ApplicationController();

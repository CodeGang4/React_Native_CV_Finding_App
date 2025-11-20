const JobService = require("../../services/EmployerServices/Job.service");
const { asyncHandler } = require("../../utils/errorHandler");
const { sendSuccess,sendData, sendError } = require("../../utils/response");

/**
 * Controller Layer - HTTP request/response handling for Jobs
 * Responsibility: Handle HTTP requests, delegate to Service layer
 */
class JobController {
    /**
     * Get all jobs
     * GET /api/jobs
     */
    getJobs = asyncHandler(async (req, res) => {
        const { userId } = req.query; // Optional: filter hidden jobs for user
        
        const jobs = await JobService.getAllJobs(userId);
        
        sendData(res, jobs);
    });

    /**
     * Get jobs by company ID
     * GET /api/jobs/company/:companyId
     */
    getJobByCompanyId = asyncHandler(async (req, res) => {
        const { companyId } = req.params;
        const { userId } = req.query; // Optional: filter hidden jobs for user
        
        const jobs = await JobService.getJobsByCompanyId(companyId, userId);
        
        sendData(res, jobs);
    });

    /**
     * Get job details by ID
     * GET /api/jobs/:jobId
     */
    getJobDetails = asyncHandler(async (req, res) => {
        const { jobId } = req.params;
        const { userId } = req.query; // Optional: check if job is hidden for user
        
        const job = await JobService.getJobDetails(jobId, userId);
        
        sendData(res, job);
    });

    /**
     * Create new job
     * POST /api/jobs
     */
    createJob = asyncHandler(async (req, res) => {
        const jobData = req.body;
        const companyId = req.params.companyId;
        
        const result = await JobService.addJob(companyId, jobData);
        
        sendData(res, result);
    });

    /**
     * Update job by ID
     * PUT /api/jobs/:jobId
     */
    updateJob = asyncHandler(async (req, res) => {
        const { jobId } = req.params;
        const updateData = req.body;
        
        const updatedJob = await JobService.updateJob(jobId, updateData);
        
        sendData(res, updatedJob);
    });

    /**
     * Delete job by ID
     * DELETE /api/jobs/:jobId
     */
    deleteJob = asyncHandler(async (req, res) => {
        const { jobId } = req.params;
        
        const deletedJob = await JobService.deleteJob(jobId);
        
        sendData(res, deletedJob);
    });

    /**
     * Increment job view count
     * POST /api/jobs/:jobId/views
     */
    incrementJobViews = asyncHandler(async (req, res) => {
        const { jobId } = req.params;
        
        const result = await JobService.incrementJobViewCount(jobId);
        
        sendData(res, result);
    });

    /**
     * Get top viewed jobs
     * GET /api/jobs/top-viewed
     */
    getTopViewedJobs = asyncHandler(async (req, res) => {
        const number = parseInt(req.query.number) || 10;
        
        const topJobs = await JobService.getTopViewedJobs(number);
        
        sendData(res, topJobs);
    });

    /**
     * Hide job for specific user
     * POST /api/jobs/:jobId/hide/:userId
     */
    hideJobForUser = asyncHandler(async (req, res) => {
        const { jobId, userId } = req.params;
        
        const result = await JobService.hideJobForUser(userId, jobId);
        
        sendData(res, result);
    });

    /**
     * Get hidden jobs for user
     * GET /api/jobs/hidden/:userId
     */
    getHiddenJobsForUser = asyncHandler(async (req, res) => {
        const { userId } = req.params;
        
        const hiddenJobs = await JobService.getHiddenJobsForUser(userId);
        
        sendData(res, hiddenJobs);
    });

    /**
     * Admin: Hide job globally
     * POST /api/admin/jobs/:jobId/hide
     */
    hideJobGlobally = asyncHandler(async (req, res) => {
        const { jobId } = req.params;
        
        await JobService.hideJobGlobally(jobId);
        
        sendData(res, { jobId });
    });

    /**
     * Admin: Unhide job globally
     * DELETE /api/admin/jobs/:jobId/hide
     */
    unhideJobGlobally = asyncHandler(async (req, res) => {
        const { jobId } = req.params;
        
        await JobService.unhideJobGlobally(jobId);
        
        sendData(res, { jobId });
    });
}

module.exports = new JobController();

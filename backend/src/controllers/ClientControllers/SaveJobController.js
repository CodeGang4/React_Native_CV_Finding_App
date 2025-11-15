const SaveJobService = require('../../services/ClientServices/SaveJob.service');
const { asyncHandler } = require('../../utils/errorHandler');
const { sendData } = require('../../utils/response');

class SaveJobController {
    getJobsByCandidates = asyncHandler(async (req, res) => {
        const { candidate_id } = req.params;
        const savedJobs = await SaveJobService.getSavedJobsByCandidate(candidate_id);
        return sendData(res, savedJobs);
    });

    getSavedJobsDetails = asyncHandler(async (req, res) => {
        const { candidate_id, job_id } = req.params;
        const jobDetails = await SaveJobService.getSavedJobDetails(candidate_id, job_id);
        return sendData(res, jobDetails);
    });

    saveJobs = asyncHandler(async (req, res) => {
        const { candidate_id } = req.params;
        const { job_id } = req.body;
        const savedJob = await SaveJobService.saveJob(candidate_id, job_id);
        return sendData(res, savedJob);
    });

    unsaveJob = asyncHandler(async (req, res) => {
        const { candidate_id } = req.params;
        const { job_id } = req.body;
        const result = await SaveJobService.unsaveJob(candidate_id, job_id);
        return sendData(res, result);
    });
}

module.exports = new SaveJobController();

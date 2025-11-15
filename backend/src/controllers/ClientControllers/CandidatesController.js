const CandidateService = require('../../services/ClientServices/Candidate.service');
const { asyncHandler } = require('../../utils/errorHandler');
const { sendSuccess,sendData, sendError } = require('../../utils/response');

class CandidatesController {

    /**
     * Get candidate profile by user ID
     * @route GET /api/candidates/profile/:userId
     */
    getProfile = asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const profile = await CandidateService.getCandidateProfile(userId);
        return sendData(res, profile);
    });

    /**
     * Get all candidates
     * @route GET /api/candidates
     */
    getAllCandidates = asyncHandler(async (req, res) => {
        const candidates = await CandidateService.getAllCandidates();
        return sendData(res, candidates);
    });

    /**
     * Update candidate profile
     * @route PUT /api/candidates/profile/:userId
     */
    updateProfile = asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const updateData = req.body;
        
        const updatedProfile = await CandidateService.updateCandidateProfile(userId, updateData);
        return sendData(res, updatedProfile);
    });

    /**
     * Upload CV file
     * @route POST /api/candidates/cv/:userId
     */
    uploadCV = asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const file = req.file;

        const cvUrl = await CandidateService.uploadCV(userId, file);
        return sendData(res, { cv_url: cvUrl });
    });

    /**
     * Upload portfolio/avatar
     * @route POST /api/candidates/portfolio/:userId
     */
    uploadPortfolio = asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const file = req.file;

        const result = await CandidateService.uploadPortfolio(userId, file);
        return sendData(res, result);
    });
}

module.exports = new CandidatesController();

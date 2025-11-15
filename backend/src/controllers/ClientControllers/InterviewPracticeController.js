const InterviewPracticeService = require("../../services/ClientServices/InterviewPractice.service");
const { asyncHandler } = require("../../utils/errorHandler");
const { sendData, sendError } = require("../../utils/response");

/**
 * Controller Layer - HTTP request/response handling for Interview Practice
 * Responsibility: Handle HTTP requests, delegate to Service layer
 */
class InterviewPracticeController {
    /**
     * Upload audio file
     * POST /api/client/interview-practice/:userId/:questionId/upload
     */
    uploadAudio = asyncHandler(async (req, res) => {
        const { userId, questionId } = req.params;
        const file = req.file;

        const result = await InterviewPracticeService.uploadAudio(userId, questionId, file);
        
        sendData(res, result);
    });

    /**
     * Transcribe audio to text
     * POST /api/client/interview-practice/:userId/:questionId/transcribe
     */
    transcribeAudio = asyncHandler(async (req, res) => {
        const { userId, questionId } = req.params;

        const result = await InterviewPracticeService.transcribeAudio(userId, questionId);
        
        sendData(res, result);
    });

    /**
     * Grade answer using AI
     * POST /api/client/interview-practice/:userId/:questionId/grade
     */
    gradingAnswer = asyncHandler(async (req, res) => {
        const { userId, questionId } = req.params;

        const result = await InterviewPracticeService.gradingAnswer(userId, questionId);
        
        sendData(res, result);
    });

    /**
     * Get all results for a user
     * GET /api/client/interview-practice/:userId/results
     */
    getUserResults = asyncHandler(async (req, res) => {
        const { userId } = req.params;

        const results = await InterviewPracticeService.getUserResults(userId);
        
        sendData(res, results);
    });
}

module.exports = new InterviewPracticeController();

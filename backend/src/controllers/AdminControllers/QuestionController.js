const supabase = require('../../supabase/config');
const redis = require('../../redis/config');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const QuestionRepository = require('../../repositories/AdminRepositories/Question.repository');
const { sendData, sendError } = require('../../utils');
const QuestionService = require('../../services/AdminServices/Question.service');
const apiKey = process.env.OPEN_AI_KEY;
class QuestionController {
    /**
     * Create a new question
     * @route POST /create
     */
    async createQuestion(req, res) {
        const { industry, level, question } = req.body;
        const questionData = {
            industry,
            level,
            question,
            created_by: 'Admin',
        }
        try {
            const question = await QuestionService.createQuestions(questionData);
            return sendData(res, question);
        } catch (error) {
            console.error("QuestionController.createQuestion error:", error);
            return sendError(res, 'Failed to create question', 500);
        }
    }

    /**
     * Delete a question
     * @route DELETE /delete/:id
     */
    async deleteQuestion(req, res) {
        const questionId = req.params.id;
        const question = await QuestionService.deleteQuestion(questionId);
        return sendData(res, question);
    }

    /**
     * Update a question
     * @route PUT /update/:id
     */
    async updateQuestion(req, res) {
        const questionId = req.params.id;
        const { industry, level, question } = req.body;
        const questionData = { industry, level, question };
        const updatedQuestion = await QuestionService.updateQuestion(questionId, questionData);
        return sendData(res, updatedQuestion);
    }


    /**
     * Cenerate a question using Gemini API
     * @route POST /generate
     */
    async generate(req, res) {
        const { industry, level } = req.body;
        const prompt = `Bạn là 1 chuyên gia tuyển dụng trong lĩnh vực ${industry}. Hãy tạo 1 câu hỏi phỏng vấn cho vị trí ${level}.Câu hỏi nên thiên hướng có thể trả lời bằng giọng nói, không phải những câu cần thao tác code. Không bao gồm bất kỳ phần giới thiệu, giải thích hoặc văn bản bổ sung nào. Câu hỏi bằng tiếng Việt`;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        try {
            const result = await model.generateContent(prompt);
            const answer =
                result.response.candidates?.[0]?.content?.parts?.[0]?.text ||
                '';

            const questionData = {industry, level, question: answer, created_by: 'AI'};
            const data = await QuestionService.generate(questionData);
            return sendData(res, data);

        } catch (error) {
            if (error.status === 429) {
                return res.status(429).json({
                    error: 'Quota exceeded. Please check your plan and billing.',
                });
            }
            console.error('Gemini API error:', error.message || error);
            return sendError(res, 500, 'Failed to generate question');
        }
    }

    /**
     * Get questions by industry and level
     * @route GET /questions?industry=industry&level=level
     */
    async getQuestionsByIndustryAndLevel(req, res) {
        const { industry, level } = req.query;
        const data= await QuestionService.getQuestionsByIndustryAndLevel(industry,level);
        return sendData(res, data);
    }

    /**
     * Get questions by industry
     * @route GET /questions?industry=industry
     */
    async getQuestionsByIndustry(req, res) {
        const { industry } = req.query;
        const data= await QuestionService.getQuestionsByIndustry(industry);
        return sendData(res, data);
    }


    /**
     * Get all questions
     * @route GET /getQuestions
     */
    async getAllQuestions(req, res) {
        const data= await QuestionService.getAllQuestions();
        return sendData(res, data);
    }
}

module.exports = new QuestionController();

const QuestionCache = require("../../Cache/AdminCache/Question.cache");
const QuestionRepository = require("../../repositories/AdminRepositories/Question.repository");
const { AppError } = require("../../utils/errorHandler");


class QuestionService {

    /**
     * Create new question(s)
     * @param {Object|Array} questionsData - Single question or array of questions
     * @returns {Promise<Object|Array>}
     */
    async createQuestions(questionsData) {
        try {
            const questionsArray = Array.isArray(questionsData) ? questionsData : [questionsData];
            
            if (questionsArray.length === 0) {
                throw new AppError("Invalid questions data: Must be non-empty", 400);
            }

            // Validate required fields
            for (const question of questionsArray) {
                if (!question.question || !question.industry || !question.level) {
                    throw new AppError("Missing required fields: question, industry, or level", 400);
                }
            }

            // Check for duplicates in database
            const questionContents = questionsArray.map(q => q.question);
            const { data: existingQuestions, error: checkError } = await QuestionRepository.checkMultipleQuestionsExist(questionContents);
            
            if (checkError) {
                console.error("Error checking duplicates:", checkError);
            }

            // Filter out questions that already exist
            const existingContents = new Set((existingQuestions || []).map(q => q.question));
            const newQuestions = questionsArray.filter(q => !existingContents.has(q.question));
            
            if (newQuestions.length === 0) {
                throw new AppError("All questions already exist in database", 409);
            }

            if (existingContents.size > 0) {
                console.log(`Skipped ${existingContents.size} duplicate question(s)`);
            }

            // Create only new questions
            const { data, error } = await QuestionRepository.create(newQuestions);
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to create questions in database", 500);
            }

            if (!data || data.length === 0) {
                throw new AppError("No questions were created", 500);
            }

            // Cache each created question
            for (const question of data) {
                try {
                    await QuestionCache.setQuestionCache(question.id, question);
                    console.log(`Cached question with ID: ${question.id}`);
                } catch (cacheError) {
                    console.error(`Failed to cache question with ID ${question.id}:`, cacheError);
                }
            }

            // Don't invalidate cache after creating new questions
            // The new questions are already cached above

            console.log(`Created ${data.length} new question(s) successfully`);
            
            // Return response with info about duplicates
            const response = {
                created: data,
                skipped: existingContents.size,
                message: existingContents.size > 0 
                    ? `Created ${data.length} questions, skipped ${existingContents.size} duplicates`
                    : `Created ${data.length} questions`
            };

            return Array.isArray(questionsData) ? response : response.created[0];
        } catch (error) {
            console.error("QuestionService.createQuestions error:", error);
            throw error;
        }
    }

    /**
     * Delete question by ID
     * @param {string} questionId
     * @returns {Promise<void>}
     */
    async deleteQuestion(questionId) {
        try {
            if (!questionId) {
                throw new AppError("Question ID is required", 400);
            }
            const cachedQuestion = await QuestionCache.getQuestionCache(questionId);
            const questionContent = cachedQuestion?.question;

            const { data, error } = await QuestionRepository.delete(questionId);
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to delete question", 500);
            }

            if (!data || data.length === 0) {
                throw new AppError("Question not found", 404);
            }

            // Invalidate only this specific question cache
            await QuestionCache.invalidateQuestionCache(questionId, questionContent);
            
            console.log(`Deleted question: ${questionId}`);
        } catch (error) {
            console.error("QuestionService.deleteQuestion error:", error);
            throw error;
        }
    }

    /**
     * Update question by ID
     * @param {string} questionId
     * @param {Object} questionData
     * @returns {Promise<Object>}
     */
    async updateQuestion(questionId, questionData) {
        try {
            if (!questionId) {
                throw new AppError("Question ID is required", 400);
            }

            if (!questionData || !questionData.question || !questionData.industry || !questionData.level) {
                throw new AppError("Missing required fields: question, industry, or level", 400);
            }

            const { data, error } = await QuestionRepository.update(questionId, questionData);
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to update question", 500);
            }

            if (!data || data.length === 0) {
                throw new AppError("Question not found", 404);
            }

            // Update cache with new data
            await QuestionCache.setQuestionCache(questionId, data[0]);

            console.log(`Updated question: ${questionId}`);
            return data[0];
        } catch (error) {
            console.error("QuestionService.updateQuestion error:", error);
            throw error;
        }
    }

    /**
     * Generate questions (AI-generated or bulk insert)
     * @param {Object|Array} questionData
     * @returns {Promise<Array>}
     */
    async generate(questionData) {
        try {
            const questionsArray = Array.isArray(questionData) ? questionData : [questionData];

            if (questionsArray.length === 0) {
                throw new AppError("Invalid question data", 400);
            }

            
            for (const question of questionsArray) {
                if (!question.industry || !question.level) {
                    throw new AppError("Missing required fields: industry or level", 400);
                }
            }

            const { data, error } = await QuestionRepository.generate(questionsArray);
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to generate questions", 500);
            }

            // Cache generated questions
            if (data && data.length > 0) {
                for (const question of data) {
                    await QuestionCache.setQuestionCache(question.id, question);
                }
            }

            console.log(`Generated ${data.length} question(s)`);
            return data;
        } catch (error) {
            console.error("QuestionService.generate error:", error);
            throw error;
        }
    }

    /**
     * Get questions by industry and level
     * @param {string} industry
     * @param {string} level
     * @returns {Promise<Array>}
     */
    async getQuestionsByIndustryAndLevel(industry, level) {
        try {
            if (!industry || !level) {
                throw new AppError("Industry and level are required", 400);
            }

            const { data, error } = await QuestionRepository.getQuestionByIndustryAndLevel(industry, level);
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to fetch questions", 500);
            }

            return data || [];
        } catch (error) {
            console.error("QuestionService.getQuestionsByIndustryAndLevel error:", error);
            throw error;
        }
    }

    /**
     * Get questions by industry
     * @param {string} industry
     * @returns {Promise<Array>}
     */
    async getQuestionsByIndustry(industry) {
        try {
            if (!industry) {
                throw new AppError("Industry is required", 400);
            }

            const { data, error } = await QuestionRepository.getQuestionByIndustry(industry);
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to fetch questions", 500);
            }

            return data || [];
        } catch (error) {
            console.error("QuestionService.getQuestionsByIndustry error:", error);
            throw error;
        }
    }

    /**
     * Get all questions with caching
     * @returns {Promise<Array>}
     */
    async getAllQuestions() {
        try {
            // Try cache first
            let questions = await QuestionCache.getAllQuestionsCache();
            if (questions && questions.length > 0) {
                console.log("Questions retrieved from cache");
                return questions;
            }

            // Cache miss: Get from database
            const { data, error } = await QuestionRepository.getAllQuestions();
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to fetch questions", 500);
            }

            if (!data || data.length === 0) {
                return [];
            }

            // Cache all questions
            await QuestionCache.setAllQuestionsCache(data);
            console.log(`Cached ${data.length} questions`);

            return data;
        } catch (error) {
            console.error("QuestionService.getAllQuestions error:", error);
            throw error;
        }
    }
}

module.exports = new QuestionService();
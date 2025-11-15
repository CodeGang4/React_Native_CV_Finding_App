const supabase = require('../../supabase/config');

class QuestionRepository {
    /**
     * @param {string} created_by
     * @param {Object} questionData
     * @returns {Promise<{data: Object|null, error: Object|null}>}
     */
    async create(questionData) {
        try {
            const { data, error } = await supabase
                .from('questions')
                .insert(questionData)
                .select();

            return { data, error };
        } catch (error) {
            console.error("QuestionRepository.create error:", error);
            return { data: null, error };
        }
    }

    /**
     * @param {string} questionId
     * @returns {Promise<{data: Object|null, error: Object|null}>}
     */
    async delete(questionId) {
        try {
            const { data, error } = await supabase
                .from('questions')
                .delete()
                .eq('id', questionId)
                .select();

            return { data, error };
        } catch (error) {
            console.error("QuestionRepository.delete error:", error);
            return { data: null, error };
        }
    }

    /**
     * 
     * @param {string} questionId 
     * @param {Object} questionData 
     * @returns {Promise<{data: Object|null, error: Object|null}>}
     */
    async update(questionId, questionData) {
        try {
            const { data, error } = await supabase
                .from('questions')
                .update(questionData)
                .eq('id', questionId)
                .select();
            return { data, error };
        } catch (error) {
            console.error("QuestionRepository.update error:", error);
            return { data: null, error };
        }
    }

    /**
     * 
     * @param {string} industry 
     * @param {string} level 
     * @param {string} created_by
     * @returns {Promise<{data: Array|null, error: Object|null}>}
     */
    async generate(questionData) {
        try {
            const {data,error} = await supabase
                .from('questions')
                .insert(questionData)
                .select();
            return { data, error };
        } catch (error) {
            console.error("QuestionRepository.generate error:", error);
            return { data: null, error };
        }
    }

    /**
     * @return {Promise<{data: Array|null, error: Object|null}>}
     */
    async getAllQuestions() {
        try {
            const { data, error } = await supabase.from('questions').select('*');
            return { data, error };
        } catch (error) {
            console.error("QuestionRepository.getAllQuestions error:", error);
            return { data: null, error };
        }
    }

    /**
     * 
     * @param {string} industry 
     * @param {string} level 
     * @returns {Promise<{data: Array|null, error: Object|null}>}
     */
    async getQuestionByIndustryAndLevel(industry, level) {
        try {
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .eq('industry', industry)
                .eq('level', level);
            return { data, error };
        } catch (error) {
            console.error("QuestionRepository.getQuestionByIndustryAndLevel error:", error);
            return { data: null, error };
        }
    }


    /**
     * @param {string} industry
     * @returns {Promise<{data: Array|null, error: Object|null}>}
     */
    async getQuestionByIndustry(industry) {
        try {
            const { data, error } = await supabase
                .from('questions')
                .select()
                .eq('industry', industry);

            return {data,error}
        } catch (error) {
            console.error("QuestionRepository.getQuestionByIndustry error:", error);
            return { data: null, error };
        }
    }

    /**
     * Check if question content already exists in database
     * @param {string} questionContent
     * @returns {Promise<{exists: boolean, data: Object|null, error: Object|null}>}
     */
    async checkQuestionExists(questionContent) {
        try {
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .eq('question', questionContent)
                .maybeSingle(); // Returns null if not found instead of error

            return { 
                exists: data !== null, 
                data, 
                error 
            };
        } catch (error) {
            console.error("QuestionRepository.checkQuestionExists error:", error);
            return { exists: false, data: null, error };
        }
    }

    /**
     * Check if multiple questions exist in database
     * @param {Array<string>} questionContents - Array of question texts
     * @returns {Promise<{data: Array|null, error: Object|null}>}
     */
    async checkMultipleQuestionsExist(questionContents) {
        try {
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .in('question', questionContents);

            return { data, error };
        } catch (error) {
            console.error("QuestionRepository.checkMultipleQuestionsExist error:", error);
            return { data: null, error };
        }
    }
}

module.exports = new QuestionRepository();
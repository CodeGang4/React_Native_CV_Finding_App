const supabase = require('../../supabase/config');
const redis = require('../../redis/config');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const apiKey = process.env.OPEN_AI_KEY;
class QuestionController {
    async createQuestion(req, res) {
        const { industry, level, question } = req.body;
        if (!industry || !level || !question) {
            return res
                .status(400)
                .json({ error: 'Missing industry, level, or question' });
        }
        const existingQuestions = await supabase
            .from('questions')
            .select()
            .eq('industry', industry)
            .eq('level', level)
            .eq('question', question)
            .single();
        if (existingQuestions.data) {
            return res.status(409).json({ error: 'Question already exists' });
        }
        const { data, error } = await supabase
            .from('questions')
            .insert({ industry, level, question, created_by: 'Admin' })
            .select();
        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ error: 'Failed to save questions' });
        }
        return res.status(200).json(data);
    }
    async deleteQuestion(req, res) {
        const questionId = req.params.id;
        if (!questionId) {
            return res.status(400).json({ error: 'Question ID is required' });
        }
        const { data, error } = await supabase
            .from('questions')
            .delete()
            .eq('id', questionId)
            .select();
        if (error) {
            console.error('Supabase delete error:', error);
            return res.status(500).json({ error: 'Failed to delete question' });
        }
        if (!data || data.length === 0) {
            return res
                .status(404)
                .json({ error: 'Question not found or not deleted' });
        }
        return res.status(200).json(data);
    }

    async updateQuestion(req, res) {
        const questionId = req.params.id;
        const { industry, level, question } = req.body;
        if (!questionId || !industry || !level || !question) {
            return res
                .status(400)
                .json({
                    error: 'Missing question ID, industry, level, or question',
                });
        }
        const { data, error } = await supabase
            .from('questions')
            .update({ industry, level, question })
            .eq('id', questionId)
            .select();
        if (error) {
            console.error('Supabase update error:', error);
            return res.status(500).json({ error: 'Failed to update question' });
        }
        if (!data || data.length === 0) {
            return res
                .status(404)
                .json({ error: 'Question not found or not updated' });
        }
        return res.status(200).json(data);
    }

    async generate(req, res) {
        const { industry, level } = req.body;
        if (!industry || !level) {
            return res.status(400).json({ error: 'Missing industry or level' });
        }
        const prompt = `You are an expert in ${industry}. Create 1 interview questions for a ${level} position.  do not include any introductions, explanations, or extra text.`;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        try {
            const result = await model.generateContent(prompt);
            const answer =
                result.response.candidates?.[0]?.content?.parts?.[0]?.text ||
                '';

            const { data, error } = await supabase
                .from('questions')
                .insert({ industry, level, question: answer, created_by: 'AI' })
                .select();
            if (error) {
                console.error('Supabase insert error:', error);
                return res
                    .status(500)
                    .json({ error: 'Failed to save questions' });
            }
            return res.status(200).json(data);
        } catch (error) {
            if (error.status === 429) {
                return res
                    .status(429)
                    .json({
                        error: 'Quota exceeded. Please check your plan and billing.',
                    });
            }
            console.error('Gemini API error:', error.message || error);
            return res
                .status(500)
                .json({ error: 'Failed to generate content' });
        }
    }
    async getQuestionsByIndustryAndLevel(req, res) {
        const { industry, level } = req.body;
        if (!industry || !level) {
            return res.status(400).json({ error: 'Missing industry or level' });
        }
        const { data, error } = await supabase
            .from('questions')
            .select()
            .eq('industry', industry)
            .eq('level', level);
        if (error) {
            console.error('Supabase fetch error:', error);
            return res.status(500).json({ error: 'Failed to fetch questions' });
        }
        res.status(200).json(data);
    }
    async getAllQuestions(req, res) {
        const { data, error } = await supabase.from('questions').select('*');
        if (error) {
            console.error('Supabase fetch error:', error);
            return res.status(500).json({ error: 'Failed to fetch questions' });
        }
        res.status(200).json(data);
    }
}

module.exports = new QuestionController();

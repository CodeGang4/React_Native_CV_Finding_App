const ChatbotService = require('../../services/ChatbotService');
const supabase = require('../../supabase/config');

class ChatbotController {
    /**
     * Send message to chatbot
     * POST /client/chatbot/message
     */
    async sendMessage(req, res) {
        try {
            const { message } = req.body;
            const userId = req.user?.id;

            if (!message || message.trim().length === 0) {
                return res.status(400).json({ error: 'Message is required' });
            }

            console.log(`User ${userId} sent message: "${message}"`);

            // Get chatbot response
            const response = await ChatbotService.chat(message, userId);

            // Save conversation history
            if (userId) {
                try {
                    await supabase.from('chatbot_conversations').insert({
                        user_id: userId,
                        user_message: message,
                        bot_message: response.message,
                        intent: response.intent,
                        metadata: response.data
                    });
                } catch (saveError) {
                    console.warn('Failed to save conversation:', saveError);
                    // Don't fail the request if saving fails
                }
            }

            return res.status(200).json({
                success: true,
                ...response
            });
        } catch (error) {
            console.error(' Chatbot message error:', error);
            return res.status(500).json({ 
                error: 'Failed to process message',
                details: error.message 
            });
        }
    }

    /**
     * Get conversation history
     * GET /client/chatbot/history
     */
    async getHistory(req, res) {
        try {
            const userId = req.user?.id;
            const { limit = 50 } = req.query;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const { data, error } = await supabase
                .from('chatbot_conversations')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(parseInt(limit));

            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Failed to fetch history' });
            }

            return res.status(200).json({
                success: true,
                conversations: data || []
            });
        } catch (error) {
            console.error(' Get history error:', error);
            return res.status(500).json({ 
                error: 'Failed to fetch conversation history',
                details: error.message 
            });
        }
    }

    /**
     * Clear conversation history
     * DELETE /client/chatbot/history
     */
    async clearHistory(req, res) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const { error } = await supabase
                .from('chatbot_conversations')
                .delete()
                .eq('user_id', userId);

            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Failed to clear history' });
            }

            return res.status(200).json({
                success: true,
                message: 'Conversation history cleared'
            });
        } catch (error) {
            console.error(' Clear history error:', error);
            return res.status(500).json({ 
                error: 'Failed to clear conversation history',
                details: error.message 
            });
        }
    }

    /**
     * Get suggested questions
     * GET /client/chatbot/suggestions
     */
    async getSuggestions(req, res) {
        try {
            const suggestions = [
                {
                    id: 1,
                    text: 'Tìm việc IT ở Hà Nội',
                    icon: '💻'
                },
                {
                    id: 2,
                    text: 'Công ty nào đang tuyển marketing?',
                    icon: '📢'
                },
                {
                    id: 3,
                    text: 'Tìm việc lương từ 10 đến 20 triệu',
                    icon: '💰'
                },
                {
                    id: 4,
                    text: 'Việc làm dành cho fresher',
                    icon: '🎓'
                },
                {
                    id: 5,
                    text: 'Công ty FPT đang tuyển gì?',
                    icon: '🏢'
                }
            ];

            return res.status(200).json({
                success: true,
                suggestions
            });
        } catch (error) {
            console.error(' Get suggestions error:', error);
            return res.status(500).json({ 
                error: 'Failed to fetch suggestions',
                details: error.message 
            });
        }
    }
}

module.exports = new ChatbotController();

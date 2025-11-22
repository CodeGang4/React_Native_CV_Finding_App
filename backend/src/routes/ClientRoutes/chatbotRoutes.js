const express = require('express');
const router = express.Router();
const ChatbotController = require('../../controllers/ClientControllers/ChatbotController');
const AuthMiddleware = require('../../middlewares/AuthMiddlewares');

// Send message to chatbot
router.post('/message', AuthMiddleware, ChatbotController.sendMessage);

// Get conversation history
router.get('/history', AuthMiddleware, ChatbotController.getHistory);

// Clear conversation history
router.delete('/history', AuthMiddleware, ChatbotController.clearHistory);

// Get suggested questions
router.get('/suggestions', AuthMiddleware, ChatbotController.getSuggestions);

module.exports = router;

import apiClient from './ApiClient';

class ChatbotApiService {
  static endpoint = '/client/chatbot';

  /**
   * Send message to chatbot
   */
  static async sendMessage(message) {
    try {
      const response = await apiClient.post(`${this.endpoint}/message`, {
        message
      });
      return response.data;
    } catch (error) {
      console.error(' [ChatbotApiService] Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get conversation history
   */
  static async getHistory(limit = 50) {
    try {
      const response = await apiClient.get(`${this.endpoint}/history`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error(' [ChatbotApiService] Error fetching history:', error);
      throw error;
    }
  }

  /**
   * Clear conversation history
   */
  static async clearHistory() {
    try {
      const response = await apiClient.delete(`${this.endpoint}/history`);
      return response.data;
    } catch (error) {
      console.error(' [ChatbotApiService] Error clearing history:', error);
      throw error;
    }
  }

  /**
   * Get suggested questions
   */
  static async getSuggestions() {
    try {
      const response = await apiClient.get(`${this.endpoint}/suggestions`);
      return response.data;
    } catch (error) {
      console.error(' [ChatbotApiService] Error fetching suggestions:', error);
      throw error;
    }
  }
}

export default ChatbotApiService;

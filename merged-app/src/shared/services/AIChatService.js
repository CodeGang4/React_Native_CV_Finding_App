/**
 * AI Chat Service
 * Service để tích hợp với AI APIs (OpenAI, Google Gemini, etc.)
 */

class AIChatService {
  constructor() {
    this.apiKey = null; // Set your API key
    this.apiProvider = 'openai'; // 'openai' | 'gemini' | 'custom'
    this.conversationHistory = [];
  }

  /**
   * Set API configuration
   */
  setConfig(apiKey, provider = 'openai') {
    this.apiKey = apiKey;
    this.apiProvider = provider;
  }

  /**
   * Send message to AI and get response
   */
  async sendMessage(userMessage, context = {}) {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
      });

      let response;

      switch (this.apiProvider) {
        case 'openai':
          response = await this.callOpenAI(userMessage, context);
          break;
        case 'gemini':
          response = await this.callGemini(userMessage, context);
          break;
        case 'custom':
          response = await this.callCustomBackend(userMessage, context);
          break;
        default:
          response = this.getMockResponse(userMessage);
      }

      // Add AI response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response,
      });

      return response;
    } catch (error) {
      console.error('AI Chat Error:', error);
      return 'Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu. Vui lòng thử lại.';
    }
  }

  /**
   * Call OpenAI API (GPT-3.5/4)
   */
  async callOpenAI(message, context) {
    if (!this.apiKey) {
      return this.getMockResponse(message);
    }

    const systemPrompt = this.buildSystemPrompt(context);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...this.conversationHistory.slice(-10), // Last 10 messages
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.choices[0].message.content;
  }

  /**
   * Call Google Gemini API
   */
  async callGemini(message, context) {
    if (!this.apiKey) {
      return this.getMockResponse(message);
    }

    const systemPrompt = this.buildSystemPrompt(context);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\n${message}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.candidates[0].content.parts[0].text;
  }

  /**
   * Call custom backend API
   */
  async callCustomBackend(message, context) {
    const response = await fetch('YOUR_BACKEND_URL/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        context,
        history: this.conversationHistory.slice(-10),
      }),
    });

    const data = await response.json();
    return data.response;
  }

  /**
   * Build system prompt based on context
   */
  buildSystemPrompt(context) {
    const basePrompt = `Bạn là AI Assistant của ứng dụng tìm việc làm JobFinder. 
Bạn giúp người dùng:
- Tìm kiếm việc làm phù hợp
- Tạo và tối ưu CV
- Chuẩn bị phỏng vấn
- Tư vấn nghề nghiệp

Hãy trả lời ngắn gọn, thân thiện và hữu ích bằng tiếng Việt.`;

    if (context.userRole === 'candidate') {
      return `${basePrompt}\n\nNgười dùng là ứng viên tìm việc.`;
    } else if (context.userRole === 'employer') {
      return `${basePrompt}\n\nNgười dùng là nhà tuyển dụng.`;
    }

    return basePrompt;
  }

  /**
   * Mock response for testing without API
   */
  getMockResponse(message) {
    const lowerText = message.toLowerCase();

    const responses = {
      'việc làm|job|tìm việc': [
        'Tôi có thể giúp bạn tìm kiếm công việc phù hợp. Bạn quan tâm đến lĩnh vực nào? (IT, Marketing, Sales, Kế toán...)',
        'Bạn đang tìm việc ở vị trí gì? Hãy cho tôi biết để tôi gợi ý các công việc phù hợp nhất.',
      ],
      'lương|salary|thu nhập': [
        'Mức lương phụ thuộc vào nhiều yếu tố như vị trí, kinh nghiệm, công ty... Bạn có kinh nghiệm bao nhiêu năm?',
        'Theo khảo sát, mức lương trung bình cho vị trí này dao động từ 10-20 triệu. Bạn mong muốn mức lương bao nhiêu?',
      ],
      'cv|hồ sơ|resume': [
        'Tôi có thể hỗ trợ bạn tạo CV chuyên nghiệp. Bạn đã có thông tin cá nhân, kinh nghiệm làm việc chưa?',
        'CV tốt nên bao gồm: thông tin cá nhân, mục tiêu nghề nghiệp, kinh nghiệm, kỹ năng, học vấn. Bạn cần giúp phần nào?',
      ],
      'phỏng vấn|interview': [
        'Một số lời khuyên cho phỏng vấn:\n1. Tìm hiểu về công ty\n2. Chuẩn bị câu trả lời cho câu hỏi thường gặp\n3. Ăn mặc chỉnh chu\n4. Đến đúng giờ\n5. Tự tin và chân thành',
        'Bạn đang chuẩn bị phỏng vấn cho vị trí gì? Tôi có thể giúp bạn luyện tập câu hỏi phỏng vấn.',
      ],
      'skill|kỹ năng': [
        'Kỹ năng quan trọng tùy thuộc vào ngành nghề. Bạn đang muốn phát triển kỹ năng gì? (Kỹ năng mềm, kỹ năng chuyên môn, ngoại ngữ...)',
        'Để nâng cao khả năng cạnh tranh, bạn nên phát triển: kỹ năng chuyên môn, tiếng Anh, làm việc nhóm, giải quyết vấn đề.',
      ],
      'công ty|company': [
        'Bạn muốn tìm hiểu về công ty nào? Tôi có thể cung cấp thông tin về văn hóa công ty, đánh giá, mức lương...',
        'Top công ty hàng đầu hiện có rất nhiều cơ hội. Bạn quan tâm đến loại hình công ty nào? (Startup, MNC, công ty Việt Nam...)',
      ],
      'chào|hello|hi': [
        'Xin chào! Tôi là AI Assistant của JobFinder. Tôi có thể giúp gì cho bạn hôm nay?',
        'Chào bạn! Tôi sẵn sàng hỗ trợ bạn về tìm việc, CV, phỏng vấn và tư vấn nghề nghiệp. Bạn cần giúp gì?',
      ],
      'cảm ơn|thanks|thank': [
        'Không có gì! Rất vui được giúp đỡ bạn. Nếu còn thắc mắc gì, hãy hỏi tôi nhé! 😊',
        'Bạn không cần khách sáo! Chúc bạn thành công trong tìm kiếm việc làm! 💪',
      ],
    };

    // Find matching response
    for (const [keywords, responseList] of Object.entries(responses)) {
      const keywordArray = keywords.split('|');
      if (keywordArray.some((keyword) => lowerText.includes(keyword))) {
        return responseList[Math.floor(Math.random() * responseList.length)];
      }
    }

    // Default responses
    const defaultResponses = [
      'Tôi hiểu. Bạn có thể cho tôi biết thêm chi tiết để tôi hỗ trợ tốt hơn không?',
      'Để tôi giúp bạn hiệu quả hơn, bạn quan tâm đến: Tìm việc, Tạo CV, Lời khuyên phỏng vấn hay Tư vấn nghề nghiệp?',
      'Tôi có thể hỗ trợ bạn về nhiều vấn đề liên quan đến tìm việc. Bạn muốn tìm hiểu về điều gì?',
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return this.conversationHistory;
  }
}

// Export singleton instance
export default new AIChatService();

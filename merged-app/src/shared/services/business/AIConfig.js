/**
 * AI Configuration - Cấu hình API keys và settings cho Gemini AI
 */
export class AIConfig {
  /**
   * Cấu hình Google Gemini AI
   * 🔑 Để lấy API key miễn phí:
   * 1. Truy cập: https://makersuite.google.com/app/apikey
   * 2. Đăng nhập tài khoản Google
   * 3. Tạo API key mới
   * 4. Copy và paste vào đây
   */
  static GEMINI_CONFIG = {
    // 🚨 QUAN TRỌNG: Thay thế API key này bằng API key thật của bạn
    API_KEY: "AIzaSyB1nZhXYudwuWMGUl4989Da78yMUfQ-AOQ", // Thay bằng API key thật

    MODEL: "models/gemini-2.0-flash-lite", // Optimized for high-volume CV analysis

    // Rate limiting để tránh vượt quá giới hạn API
    REQUESTS_PER_MINUTE: 30, // gemini-2.0-flash-lite: 30 requests/minute
    MAX_BATCH_SIZE: 15, // Tăng lên 15 để tận dụng RPM cao hơn
    DELAY_BETWEEN_BATCHES: 50, // Giảm xuống 50ms - tối ưu với RPM 30

    // Timeout settings
    REQUEST_TIMEOUT: 8000, // Giảm xuống 8s để xử lý nhanh hơn với model mới

    // Retry settings for quota limits
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second
    QUOTA_RETRY_DELAY: 30000, // 30 giây cho model mới (thay vì 45s)

    // Quota tracking cho gemini-2.0-flash-lite
    DAILY_QUOTA_LIMIT: 200, // RPD limit for gemini-2.0-flash-lite
    MINUTE_QUOTA_LIMIT: 30, // RPM limit

    // Performance optimization
    PARALLEL_PROCESSING: true,
    CHUNK_SIZE: 5, // Process 5 CVs simultaneously
  };

  /**
   * Kiểm tra API key có hợp lệ không
   */
  static isValidAPIKey(apiKey) {
    return (
      apiKey &&
      apiKey !== "AIzaSyCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" &&
      apiKey.startsWith("AIzaSy") &&
      apiKey.length > 30
    );
  }

  /**
   * Lấy cấu hình hiện tại
   */
  static getCurrentConfig() {
    return {
      hasValidKey: this.isValidAPIKey(this.GEMINI_CONFIG.API_KEY),
      model: this.GEMINI_CONFIG.MODEL,
      rateLimit: this.GEMINI_CONFIG.REQUESTS_PER_MINUTE,
      batchSize: this.GEMINI_CONFIG.MAX_BATCH_SIZE,
    };
  }

  /**
   * Cập nhật API key
   * @param {string} newAPIKey - API key mới
   */
  static updateAPIKey(newAPIKey) {
    if (this.isValidAPIKey(newAPIKey)) {
      this.GEMINI_CONFIG.API_KEY = newAPIKey;
      console.log("✅ API key đã được cập nhật thành công");
      return true;
    } else {
      console.error("❌ API key không hợp lệ");
      return false;
    }
  }

  /**
   * Hướng dẫn lấy API key
   */
  static getAPIKeyGuide() {
    return {
      title: "🔑 Hướng dẫn lấy Google Gemini API Key (MIỄN PHÍ)",
      steps: [
        "1. Truy cập: https://makersuite.google.com/app/apikey",
        "2. Đăng nhập tài khoản Google của bạn",
        '3. Click "Create API key" hoặc "Tạo API key"',
        "4. Chọn project hoặc tạo project mới",
        "5. Copy API key và paste vào file AIConfig.js",
        "6. Khởi động lại ứng dụng để áp dụng",
      ],
      notes: [
        "✅ Gemini API hoàn toàn miễn phí với giới hạn 60 requests/minute",
        "✅ Không cần thẻ tín dụng để đăng ký",
        "✅ API key không hết hạn (trừ khi bạn xóa)",
        "⚠️ Bảo mật API key, không chia sẻ với người khác",
      ],
      troubleshooting: [
        "Nếu không truy cập được → Thử VPN hoặc đổi mạng",
        "Nếu API bị từ chối → Kiểm tra API key có đúng không",
        "Nếu quá giới hạn → Đợi 1 phút rồi thử lại",
        "Nếu vẫn lỗi → Dùng Local AI (rule-based) tạm thời",
      ],
    };
  }

  /**
   * Test API key
   */
  static async testAPIKey(apiKey = null) {
    const testKey = apiKey || this.GEMINI_CONFIG.API_KEY;

    if (!this.isValidAPIKey(testKey)) {
      return {
        success: false,
        error: "API key không hợp lệ hoặc chưa được cấu hình",
      };
    }

    try {
      // Simple test với Gemini API
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(testKey);
      const model = genAI.getGenerativeModel({
        model: "models/gemini-2.5-flash",
      });

      const result = await model.generateContent("Hello, test connection");
      const response = await result.response;

      return {
        success: true,
        message: "API key hoạt động tốt!",
        response: response.text().substring(0, 100) + "...",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        suggestion: this.getSuggestionForError(error.message),
      };
    }
  }

  /**
   * Gợi ý giải quyết lỗi
   */
  static getSuggestionForError(errorMessage) {
    if (errorMessage.includes("API key")) {
      return "Kiểm tra lại API key có đúng không";
    }
    if (errorMessage.includes("quota")) {
      return "Đã vượt quá giới hạn API, đợi 1 phút rồi thử lại";
    }
    if (errorMessage.includes("network")) {
      return "Kiểm tra kết nối mạng hoặc thử VPN";
    }
    if (
      errorMessage.includes("models/") &&
      errorMessage.includes("not found")
    ) {
      return "Model không tồn tại. Đã cập nhật model mới: models/gemini-2.5-flash";
    }
    return "Thử khởi động lại ứng dụng hoặc dùng Local AI tạm thời";
  }

  /**
   * List available models (for debugging)
   */
  static async listAvailableModels(apiKey = null) {
    const testKey = apiKey || this.GEMINI_CONFIG.API_KEY;

    if (!this.isValidAPIKey(testKey)) {
      console.error("❌ API key không hợp lệ");
      return [];
    }

    try {
      // List some popular available models
      console.log("📋 Recommended Gemini models:");
      console.log("- models/gemini-2.5-flash (current, fastest)");
      console.log("- models/gemini-2.5-pro (more powerful)");
      console.log("- models/gemini-flash-latest (auto-updated)");
      console.log("- models/gemini-pro-latest (auto-updated)");

      return [
        "models/gemini-2.5-flash",
        "models/gemini-2.5-pro",
        "models/gemini-flash-latest",
        "models/gemini-pro-latest",
      ];
    } catch (error) {
      console.error("❌ Không thể list models:", error.message);
      return [];
    }
  }
}

/**
 * Fallback config nếu không có Real AI
 */
export const FALLBACK_CONFIG = {
  USE_LOCAL_AI: true,
  LOCAL_AI_FEATURES: [
    "Phân tích kỹ năng cơ bản",
    "Đánh giá kinh nghiệm",
    "Tính điểm tổng hợp",
    "Gợi ý phỏng vấn đơn giản",
  ],
  GEMINI_AI_FEATURES: [
    "Phân tích CV chi tiết bằng AI",
    "Đánh giá tính cách và soft skills",
    "Gợi ý phỏng vấn thông minh",
    "Dự đoán khả năng phù hợp chính xác",
    "Phân tích ngôn ngữ tự nhiên",
    "So sánh với job requirements",
  ],
};

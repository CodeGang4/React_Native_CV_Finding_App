import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIConfig } from "./AIConfig.js";

/**
 * Gemini AI Service - Sử dụng Google Gemini AI để phân tích ứng viên
 * Advanced AI-powered candidate analysis with Google's Gemini API
 */
export class GeminiAIService {
  constructor() {
    this.config = AIConfig.GEMINI_CONFIG;

    // Kiểm tra API key
    if (!AIConfig.isValidAPIKey(this.config.API_KEY)) {
      console.warn(
        "⚠️ Google Gemini API key chưa được cấu hình. Xem hướng dẫn trong AIConfig.js"
      );
      this.isConfigured = false;
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(this.config.API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: this.config.MODEL });
      this.isConfigured = true;
      console.log("✅ Google Gemini AI đã sẵn sàng");
    } catch (error) {
      console.error("❌ Lỗi khởi tạo Gemini AI:", error);
      this.isConfigured = false;
    }
  }

  /**
   * Phân tích ứng viên bằng AI thật
   * @param {Array} candidates - Danh sách ứng viên
   * @param {Object} jobRequirements - Yêu cầu công việc
   * @returns {Array} Ứng viên đã được AI phân tích
   */
  async analyzeAndRankCandidatesWithAI(candidates, jobRequirements = {}) {
    // Kiểm tra cấu hình
    if (!this.isConfigured) {
      console.warn("⚠️ Real AI chưa được cấu hình, fallback về Local AI");
      return this.fallbackToLocalAI(candidates, jobRequirements);
    }

    try {
      console.log("🤖 Bắt đầu phân tích ứng viên với Google Gemini AI...");
      console.log(
        `⚠️ LƯU Ý: Free tier có giới hạn ${this.config.REQUESTS_PER_MINUTE} requests/minute`
      );
      console.log(
        `📊 Với ${candidates.length} ứng viên, ước tính thời gian: ~${Math.ceil(
          candidates.length * 0.5
        )} giây`
      );

      // Xử lý theo batch để tránh quota limits, nhưng sử dụng parallel trong mỗi batch
      const batchSize = this.config.MAX_BATCH_SIZE;
      const results = [];

      console.log(
        `📊 Sẽ xử lý ${candidates.length} ứng viên trong ${Math.ceil(
          candidates.length / batchSize
        )} batches (${batchSize} ứng viên/batch)`
      );

      for (let i = 0; i < candidates.length; i += batchSize) {
        const batch = candidates.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(candidates.length / batchSize);

        console.log(
          `📦 Đang xử lý batch ${batchNum}/${totalBatches} (${batch.length} ứng viên)`
        );

        try {
          const batchResults = await this.processCandidateBatch(
            batch,
            jobRequirements
          );
          results.push(...batchResults);

          // Delay ngắn giữa các batch, chỉ khi cần thiết
          if (i + batchSize < candidates.length) {
            console.log(
              `⏸️ Đợi ${this.config.DELAY_BETWEEN_BATCHES}ms giữa các batch...`
            );
            await new Promise((resolve) =>
              setTimeout(resolve, this.config.DELAY_BETWEEN_BATCHES)
            );
          }
        } catch (error) {
          console.error(`❌ Lỗi xử lý batch ${batchNum}:`, error);

          // Nếu gặp quota limit, đợi ít hơn và retry
          if (error.message.includes("429")) {
            console.warn("⚠️ Quota limit reached, đợi 10 giây và thử lại...");
            await new Promise((resolve) => setTimeout(resolve, 10000));
          }

          // Thêm fallback data cho batch bị lỗi
          const fallbackResults = batch.map((candidate) => ({
            ...candidate,
            aiScore: 30,
            aiRecommendations: ["Không thể phân tích do quota limits"],
            riskFactors: ["Lỗi API quota"],
            aiProvider: "Fallback",
          }));
          results.push(...fallbackResults);
        }
      }

      // Sắp xếp theo AI score
      const sortedResults = results.sort((a, b) => b.aiScore - a.aiScore);

      console.log(
        "✅ Hoàn thành phân tích AI cho",
        candidates.length,
        "ứng viên"
      );
      return sortedResults;
    } catch (error) {
      console.error("❌ Lỗi phân tích AI:", error);
      // Fallback về AI cũ nếu API thất bại
      return this.fallbackToLocalAI(candidates, jobRequirements);
    }
  }

  /**
   * Xử lý một batch ứng viên - PARALLEL với rate limiting thông minh
   */
  async processCandidateBatch(candidates, jobRequirements) {
    console.log(
      `🚀 Phân tích song song ${candidates.length} ứng viên với rate limiting thông minh...`
    );

    // Chia nhỏ thành các sub-batches để xử lý parallel mà không vượt quá rate limit
    const MAX_CONCURRENT = Math.min(5, this.config.REQUESTS_PER_MINUTE); // 5 requests concurrent max
    const results = [];

    // Xử lý parallel với Promise.all
    const promises = candidates.map(async (candidate, index) => {
      try {
        // Delay staggered để tránh hit API cùng lúc
        const staggerDelay = index * 200; // 200ms delay giữa mỗi request
        await new Promise((resolve) => setTimeout(resolve, staggerDelay));

        console.log(
          `📊 Phân tích ứng viên ${index + 1}/${candidates.length}: ${
            candidate.name
          }`
        );

        const analysis = await this.analyzeSingleCandidateWithRetry(
          candidate,
          jobRequirements
        );
        return {
          ...candidate,
          ...analysis,
          aiAnalyzedAt: new Date(),
          aiProvider: "Google Gemini",
        };
      } catch (error) {
        console.error(`❌ Lỗi phân tích ứng viên ${candidate.name}:`, error);
        // Fallback với điểm thấp nếu AI thất bại
        return {
          ...candidate,
          aiScore: 30,
          aiRecommendations: [
            "Không thể phân tích được với AI do quota limits",
          ],
          riskFactors: ["Lỗi phân tích AI: " + error.message],
          aiProvider: "Fallback",
          aiAnalyzedAt: new Date(),
        };
      }
    });

    // Chờ tất cả requests hoàn thành
    const batchResults = await Promise.all(promises);

    console.log(
      `✅ Hoàn thành phân tích batch: ${batchResults.length} ứng viên`
    );
    return batchResults;
  }

  /**
   * Phân tích một ứng viên với retry logic cho quota limits
   */
  async analyzeSingleCandidateWithRetry(
    candidate,
    jobRequirements,
    retryCount = 0
  ) {
    try {
      return await this.analyzeSingleCandidate(candidate, jobRequirements);
    } catch (error) {
      // Kiểm tra nếu là lỗi quota limit (429)
      if (error.message.includes("429") && error.message.includes("quota")) {
        console.warn(
          `⚠️ Quota limit reached for ${candidate.name}. Retry ${
            retryCount + 1
          }/${this.config.MAX_RETRIES}`
        );

        if (retryCount < this.config.MAX_RETRIES) {
          // Extract retry delay từ error message nếu có
          const retryMatch = error.message.match(
            /Please retry in (\d+(?:\.\d+)?)s/
          );
          const delayMs = retryMatch
            ? parseFloat(retryMatch[1]) * 1000
            : this.config.QUOTA_RETRY_DELAY;

          console.log(
            `⏳ Đợi ${Math.ceil(delayMs / 1000)}s trước khi retry...`
          );
          await new Promise((resolve) => setTimeout(resolve, delayMs));

          return this.analyzeSingleCandidateWithRetry(
            candidate,
            jobRequirements,
            retryCount + 1
          );
        }
      }

      // Nếu không phải quota limit hoặc đã hết retry, throw error
      throw error;
    }
  }

  /**
   * Phân tích một ứng viên với Gemini AI
   */
  async analyzeSingleCandidate(candidate, jobRequirements) {
    const prompt = this.buildAnalysisPrompt(candidate, jobRequirements);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();

      // Parse kết quả từ AI
      return this.parseAIResponse(analysisText, candidate);
    } catch (error) {
      console.error("Lỗi gọi Gemini API:", error);
      throw error;
    }
  }

  /**
   * Tạo prompt để AI phân tích ứng viên
   */
  buildAnalysisPrompt(candidate, jobRequirements) {
    const candidateData = {
      name: candidate.name || "Không rõ",
      title: candidate.title || "Không rõ",
      skills: candidate.skills || [],
      experience: candidate.experience || "Không rõ",
      education: candidate.education || [],
      workHistory: candidate.workHistory || [],
      summary: candidate.summary || "Không có",
    };

    const requirements = {
      requiredSkills: jobRequirements.requiredSkills || [],
      preferredSkills: jobRequirements.preferredSkills || [],
      jobTitle: jobRequirements.jobTitle || "Nhân viên IT",
      industry: jobRequirements.industry || "Công nghệ thông tin",
      experienceLevel: jobRequirements.level || "all",
    };

    return `
Bạn là chuyên gia tuyển dụng AI. Hãy phân tích ứng viên sau và đưa ra đánh giá chi tiết:

## THÔNG TIN ỨNG VIÊN:
- Tên: ${candidateData.name}
- Vị trí hiện tại: ${candidateData.title}
- Kỹ năng: ${candidateData.skills.join(", ")}
- Kinh nghiệm: ${candidateData.experience}
- Mô tả bản thân: ${candidateData.summary}
- Lịch sử công việc: ${candidateData.workHistory
      .map((job) => `${job.title} tại ${job.company}`)
      .join(", ")}
- Học vấn: ${candidateData.education
      .map((edu) => `${edu.degree} ${edu.field}`)
      .join(", ")}

## YÊU CẦU CÔNG VIỆC:
- Vị trí tuyển dụng: ${requirements.jobTitle}
- Ngành: ${requirements.industry}
- Kỹ năng bắt buộc: ${requirements.requiredSkills.join(", ")}
- Kỹ năng ưu tiên: ${requirements.preferredSkills.join(", ")}
- Cấp độ kinh nghiệm: ${requirements.experienceLevel}

## YÊU CẦU PHÂN TÍCH:
Hãy trả lời theo định dạng JSON chính xác sau. QUAN TRỌNG: 
- KHÔNG bao gồm markdown code blocks
- KHÔNG có ký tự lạ hoặc escape characters
- ĐẢM BẢO mọi key và value đều có dấu ngoặc kép đúng

{
  "aiScore": 75,
  "fitPrediction": 80,
  "aiRecommendations": [
    "Gợi ý 1",
    "Gợi ý 2", 
    "Gợi ý 3"
  ],
  "strengthsAndWeaknesses": {
    "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
    "weaknesses": ["Điểm yếu 1", "Điểm yếu 2"],
    "overallProfile": "excellent"
  },
  "skillsAnalysis": {
    "requiredSkillsMatch": 3,
    "totalSkills": 5,
    "skillLevel": "intermediate",
    "skillGaps": ["Kỹ năng thiếu 1", "Kỹ năng thiếu 2"]
  },
  "experienceAnalysis": {
    "totalYears": 3,
    "relevantExperience": 2,
    "leadershipExperience": false,
    "careerProgression": "stable"
  },
  "riskFactors": [
    "Rủi ro 1",
    "Rủi ro 2"
  ],
  "suggestedInterviewQuestions": [
    "Câu hỏi 1?",
    "Câu hỏi 2?",
    "Câu hỏi 3?"
  ],
  "aiTier": "Trung bình",
  "personalityInsights": {
    "communicationStyle": "average",
    "adaptability": "medium",
    "motivationFactors": ["Phát triển kỹ năng"]
  }
}

Chỉ trả lời JSON object trên, không thêm text hay giải thích gì khác.
    `;
  }

  /**
   * Parse phản hồi từ AI
   */
  parseAIResponse(aiResponse, candidate) {
    try {
      // Extract JSON từ markdown hoặc plain text
      let jsonStr = aiResponse.trim();

      // Remove markdown code blocks
      jsonStr = jsonStr.replace(/```json\s*/g, "").replace(/```\s*/g, "");

      // Clean up common issues
      jsonStr = jsonStr
        .replace(/[\u201C\u201D]/g, '"') // Smart quotes to regular quotes
        .replace(/[\u2018\u2019]/g, "'") // Smart single quotes
        .replace(/""([^"]*?)"/g, '"$1"'); // Fix double quotes at start

      // Try to find JSON object
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn("⚠️ Không tìm thấy JSON trong response, dùng fallback");
        return this.fallbackParseResponse(aiResponse, candidate);
      }

      let cleanJsonStr = jsonMatch[0];

      // Fix specific common errors
      cleanJsonStr = cleanJsonStr
        .replace(/""careerProgression"/g, '"careerProgression"') // Fix the specific error
        .replace(/"\s*careerProgression"/g, '"careerProgression"')
        .replace(/,\s*,/g, ",") // Remove double commas
        .replace(/,(\s*[}\]])/g, "$1"); // Remove trailing commas

      console.log("🔧 Attempting to parse JSON for candidate:", candidate.name);

      const analysis = JSON.parse(cleanJsonStr);

      // Validate và set default values
      return {
        aiScore: Math.min(100, Math.max(0, analysis.aiScore || 50)),
        fitPrediction: Math.min(100, Math.max(0, analysis.fitPrediction || 50)),
        aiRecommendations: analysis.aiRecommendations || [
          "Phân tích chưa hoàn tất",
        ],
        strengthsAndWeaknesses: analysis.strengthsAndWeaknesses || {
          strengths: ["Đang phân tích"],
          weaknesses: ["Đang phân tích"],
          overallProfile: "average",
        },
        skillsAnalysis: analysis.skillsAnalysis || {
          requiredSkillsMatch: 0,
          totalSkills: candidate.skills?.length || 0,
          skillLevel: "intermediate",
          skillGaps: [],
        },
        experienceAnalysis: analysis.experienceAnalysis || {
          totalYears: 0,
          relevantExperience: 0,
          leadershipExperience: false,
          careerProgression: "stable",
        },
        riskFactors: analysis.riskFactors || [],
        suggestedInterviewQuestions: analysis.suggestedInterviewQuestions || [
          "Hãy kể về kinh nghiệm của bạn?",
          "Mục tiêu nghề nghiệp của bạn là gì?",
        ],
        aiTier: analysis.aiTier || "Trung bình",
        personalityInsights: analysis.personalityInsights || {
          communicationStyle: "average",
          adaptability: "medium",
          motivationFactors: ["Phát triển kỹ năng"],
        },
      };
    } catch (error) {
      console.error("Lỗi parse AI response:", error);
      console.log("Raw AI response:", aiResponse);

      // Fallback parsing đơn giản
      return this.fallbackParseResponse(aiResponse, candidate);
    }
  }

  /**
   * Fallback parsing nếu JSON parsing thất bại
   */
  fallbackParseResponse(aiResponse, candidate) {
    // Cố gắng extract thông tin cơ bản từ text
    const scoreMatch = aiResponse.match(/score[":]\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 60;

    return {
      aiScore: Math.min(100, Math.max(0, score)),
      fitPrediction: score,
      aiRecommendations: ["AI đã phân tích nhưng cần kiểm tra thêm"],
      strengthsAndWeaknesses: {
        strengths: ["Có kinh nghiệm trong lĩnh vực"],
        weaknesses: ["Cần đánh giá thêm qua phỏng vấn"],
        overallProfile: score >= 70 ? "good" : "average",
      },
      skillsAnalysis: {
        requiredSkillsMatch: candidate.skills?.length || 0,
        totalSkills: candidate.skills?.length || 0,
        skillLevel: "intermediate",
        skillGaps: [],
      },
      experienceAnalysis: {
        totalYears: this.extractYears(candidate.experience || ""),
        relevantExperience: 0,
        leadershipExperience: false,
        careerProgression: "stable",
      },
      riskFactors: [],
      suggestedInterviewQuestions: [
        "Hãy mô tả kinh nghiệm của bạn?",
        "Tại sao bạn quan tâm đến vị trí này?",
        "Kỹ năng mạnh nhất của bạn là gì?",
      ],
      aiTier:
        score >= 80 ? "Tốt" : score >= 60 ? "Trung bình" : "Cần cải thiện",
      personalityInsights: {
        communicationStyle: "average",
        adaptability: "medium",
        motivationFactors: ["Phát triển nghề nghiệp"],
      },
    };
  }

  /**
   * Fallback về AI cũ nếu API thất bại
   */
  async fallbackToLocalAI(candidates, jobRequirements) {
    console.log("⚠️ Fallback về AI local do lỗi API");
    const { EnhancedAIService } = await import("./EnhancedAIService.js");
    return EnhancedAIService.analyzeAndRankCandidates(
      candidates,
      jobRequirements
    );
  }

  /**
   * Helper: Extract số năm từ text
   */
  extractYears(text) {
    const match = text.match(/(\d+)\s*(year|năm)/i);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Lấy top ứng viên nổi bật
   * @param {Array} analyzedCandidates - Ứng viên đã phân tích
   * @param {number} limit - Số lượng tối đa
   * @returns {Array} Top ứng viên
   */
  getTopCandidates(analyzedCandidates, limit = 10) {
    return analyzedCandidates
      .filter((candidate) => candidate.aiScore >= 60) // Chỉ lấy ứng viên điểm >= 60
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, limit)
      .map((candidate, index) => ({
        ...candidate,
        aiRank: index + 1,
      }));
  }

  /**
   * Lấy thống kê phân tích
   */
  getAnalysisStats(analyzedCandidates) {
    const total = analyzedCandidates.length;
    const excellent = analyzedCandidates.filter((c) => c.aiScore >= 80).length;
    const good = analyzedCandidates.filter(
      (c) => c.aiScore >= 60 && c.aiScore < 80
    ).length;
    const average = analyzedCandidates.filter(
      (c) => c.aiScore >= 40 && c.aiScore < 60
    ).length;
    const poor = analyzedCandidates.filter((c) => c.aiScore < 40).length;

    return {
      total,
      excellent,
      good,
      average,
      poor,
      averageScore: Math.round(
        analyzedCandidates.reduce((sum, c) => sum + c.aiScore, 0) / total
      ),
    };
  }
}

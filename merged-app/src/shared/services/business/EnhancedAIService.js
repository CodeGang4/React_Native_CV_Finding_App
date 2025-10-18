import { AIService } from "./AIService.js";
import { GeminiAIService } from "./GeminiAIService.js";

/**
 * Enhanced AI Service - Advanced AI-powered candidate analysis and recommendations
 * Phân tích sâu CV và thông tin ứng viên với Gemini AI hoặc fallback AI
 */
export class EnhancedAIService extends AIService {
  static geminiAIService = new GeminiAIService();

  /**
   * Phân tích toàn diện ứng viên với Real AI
   * @param {Array} candidates - Danh sách ứng viên
   * @param {Object} criteria - Tiêu chí tìm kiếm và yêu cầu
   * @param {Object} options - Tùy chọn phân tích (limit, offset, etc.)
   * @returns {Array} Danh sách ứng viên đã được AI phân tích và sắp xếp
   */
  static async analyzeAndRankCandidates(
    candidates,
    criteria = {},
    options = {}
  ) {
    if (!candidates || candidates.length === 0) {
      return { candidates: [], total: 0, hasMore: false };
    }

    const startTime = Date.now(); // Track performance
    const {
      limit = 20,
      offset = 0,
      showAll = false,
      useRealAI = true, // Mặc định sử dụng Gemini AI
    } = options;

    console.log(
      `🤖 ${useRealAI ? "Gemini AI" : "Local AI"} Analysis: Processing ${
        candidates.length
      } candidates`
    );

    try {
      if (useRealAI) {
        // Sử dụng Gemini AI
        console.log("🚀 Sử dụng Google Gemini AI để phân tích...");

        const candidatesToAnalyze = showAll
          ? candidates
          : candidates.slice(offset, offset + limit);

        const analyzedCandidates =
          await this.geminiAIService.analyzeAndRankCandidatesWithAI(
            candidatesToAnalyze,
            criteria
          );

        const rankedCandidates = analyzedCandidates.map((candidate, index) => ({
          ...candidate,
          aiRank: offset + index + 1,
          aiTier: candidate.aiTier || this.getTierFromScore(candidate.aiScore),
        }));

        const endTime = Date.now();
        const performance = {
          totalTime: endTime - startTime,
          analysisSpeed: Math.round(
            candidatesToAnalyze.length / ((endTime - startTime) / 1000)
          ),
          averageTimePerCandidate: Math.round(
            (endTime - startTime) / candidatesToAnalyze.length
          ),
        };

        return {
          candidates: rankedCandidates,
          total: candidates.length,
          hasMore: offset + limit < candidates.length,
          analyzed: candidatesToAnalyze.length,
          aiProvider: "Google Gemini",
          performance, // Add performance tracking
          stats: this.geminiAIService.getAnalysisStats(rankedCandidates),
        };
      } else {
        // Fallback về Local AI nếu không dùng Gemini AI
        return await this.analyzeWithLocalAI(candidates, criteria, options);
      }
    } catch (error) {
      console.error("❌ Gemini AI thất bại, fallback về Local AI:", error);
      return await this.analyzeWithLocalAI(candidates, criteria, options);
    }
  }

  /**
   * Phân tích với Local AI (fallback method)
   */
  static async analyzeWithLocalAI(candidates, criteria, options) {
    const { limit = 20, offset = 0, showAll = false } = options;

    // Quick scoring tất cả ứng viên để sắp xếp ban đầu
    const quickScored = candidates.map((candidate) => ({
      ...candidate,
      quickScore: this.calculateQuickScore(candidate, criteria),
    }));

    // Sắp xếp theo quick score và chỉ lấy top candidates để phân tích chi tiết
    const sortedCandidates = quickScored.sort(
      (a, b) => b.quickScore - a.quickScore
    );

    const candidatesToAnalyze = showAll
      ? sortedCandidates
      : sortedCandidates.slice(offset, offset + limit);

    console.log(
      `🎯 Deep analyzing top ${candidatesToAnalyze.length} candidates with Local AI`
    );

    // Phân tích chi tiết chỉ cho top candidates
    const analyzedCandidates = await Promise.all(
      candidatesToAnalyze.map((candidate) =>
        this.analyzeCandidate(candidate, criteria)
      )
    );

    // Sắp xếp theo điểm AI chi tiết và thêm thông tin ranking
    const rankedCandidates = analyzedCandidates
      .sort((a, b) => b.aiScore - a.aiScore)
      .map((candidate, index) => ({
        ...candidate,
        aiRank: offset + index + 1,
        aiTier: this.getTier(candidate.aiScore, analyzedCandidates.length),
      }));

    return {
      candidates: rankedCandidates,
      total: candidates.length,
      hasMore: offset + limit < candidates.length,
      analyzed: candidatesToAnalyze.length,
      aiProvider: "Local AI",
      quickScoreRange: {
        min: Math.min(...quickScored.map((c) => c.quickScore)),
        max: Math.max(...quickScored.map((c) => c.quickScore)),
      },
    };
  }

  /**
   * Helper: Chuyển đổi score sang tier
   */
  static getTierFromScore(score) {
    if (score >= 80) return "Xuất sắc";
    if (score >= 65) return "Tốt";
    if (score >= 50) return "Trung bình";
    return "Cần cải thiện";
  }

  /**
   * Quick scoring để sắp xếp ban đầu (nhanh, ít chi tiết)
   */
  static calculateQuickScore(candidate, criteria) {
    let score = 0;

    // Quick skill matching
    const candidateSkills = (candidate.skills || []).map((s) =>
      s.toLowerCase()
    );
    const requiredSkills = (criteria.requiredSkills || []).map((s) =>
      s.toLowerCase()
    );
    const skillMatch = requiredSkills.filter((skill) =>
      candidateSkills.some(
        (candSkill) => candSkill.includes(skill) || skill.includes(candSkill)
      )
    ).length;
    score += (skillMatch / Math.max(requiredSkills.length, 1)) * 40;

    // Quick experience check
    const experience = this.extractYearsFromExperience(
      candidate.experience || ""
    );
    score += Math.min(experience * 3, 30);

    // CV availability bonus
    if (candidate.cvUrl) score += 15;

    // Education bonus
    const education = candidate.education || [];
    if (education.length > 0) score += 10;

    // Activity bonus
    if (candidate.isActive) score += 5;

    return Math.min(score, 100);
  }

  /**
   * Phân tích chi tiết một ứng viên
   * @param {Object} candidate - Thông tin ứng viên
   * @param {Object} criteria - Tiêu chí đánh giá
   * @returns {Object} Ứng viên với thông tin AI đã phân tích
   */
  static async analyzeCandidate(candidate, criteria = {}) {
    const analysis = {
      // Thông tin gốc
      ...candidate,

      // Điểm số AI tổng hợp
      aiScore: 0,

      // Phân tích chi tiết
      skillsAnalysis: this.analyzeSkills(candidate, criteria),
      experienceAnalysis: this.analyzeExperience(candidate, criteria),
      educationAnalysis: this.analyzeEducation(candidate, criteria),
      cvAnalysis: await this.analyzeCVContent(candidate),
      personalityInsights: this.generatePersonalityInsights(candidate),

      // Gợi ý và nhận xét
      aiRecommendations: [],
      strengthsAndWeaknesses: this.evaluateStrengthsAndWeaknesses(candidate),

      // Dự đoán khả năng phù hợp
      fitPrediction: 0,
      riskFactors: [],

      // Gợi ý câu hỏi phỏng vấn
      suggestedInterviewQuestions: this.generateInterviewQuestions(candidate),
    };

    // Tính toán điểm AI tổng hợp
    analysis.aiScore = this.calculateComprehensiveScore(analysis, criteria);
    analysis.fitPrediction = this.predictJobFit(analysis, criteria);
    analysis.aiRecommendations = this.generateRecommendations(
      analysis,
      criteria
    );
    analysis.riskFactors = this.identifyRiskFactors(analysis);

    return analysis;
  }

  /**
   * Phân tích kỹ năng của ứng viên
   */
  static analyzeSkills(candidate, criteria) {
    const skills = candidate.skills || [];
    const requiredSkills = criteria.requiredSkills || [];
    const preferredSkills = criteria.preferredSkills || [];

    const analysis = {
      totalSkills: skills.length,
      requiredSkillsMatch: 0,
      preferredSkillsMatch: 0,
      uniqueSkills: [],
      skillGaps: [],
      skillLevel: "beginner",
      trendingSkills: [],
      rareSkills: [],
    };

    // Đánh giá kỹ năng bắt buộc
    analysis.requiredSkillsMatch = requiredSkills.filter((skill) =>
      skills.some(
        (candSkill) =>
          candSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(candSkill.toLowerCase())
      )
    ).length;

    // Đánh giá kỹ năng ưu tiên
    analysis.preferredSkillsMatch = preferredSkills.filter((skill) =>
      skills.some(
        (candSkill) =>
          candSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(candSkill.toLowerCase())
      )
    ).length;

    // Tìm kỹ năng thiếu
    analysis.skillGaps = requiredSkills.filter(
      (skill) =>
        !skills.some((candSkill) =>
          candSkill.toLowerCase().includes(skill.toLowerCase())
        )
    );

    // Đánh giá level kỹ năng dựa trên số lượng và độ phức tạp
    const techSkills = skills.filter((skill) => this.isTechnicalSkill(skill));

    if (techSkills.length >= 15) analysis.skillLevel = "expert";
    else if (techSkills.length >= 8) analysis.skillLevel = "advanced";
    else if (techSkills.length >= 4) analysis.skillLevel = "intermediate";

    // Tìm kỹ năng trending và hiếm
    analysis.trendingSkills = skills.filter((skill) =>
      this.isTrendingSkill(skill)
    );

    analysis.rareSkills = skills.filter((skill) => this.isRareSkill(skill));

    return analysis;
  }

  /**
   * Phân tích kinh nghiệm làm việc
   */
  static analyzeExperience(candidate, criteria) {
    const workHistory = candidate.workHistory || [];
    const experience = candidate.experience || "";

    const analysis = {
      totalYears: this.extractYearsFromExperience(experience),
      jobChanges: workHistory.length,
      averageJobDuration: 0,
      careerProgression: "stable",
      industryExperience: [],
      leadershipExperience: false,
      relevantExperience: 0,
      experienceGaps: [],
    };

    // Tính thời gian trung bình ở mỗi công việc
    if (workHistory.length > 0) {
      const totalMonths = workHistory.reduce((sum, job) => {
        const duration = this.calculateJobDuration(job);
        return sum + duration;
      }, 0);
      analysis.averageJobDuration = totalMonths / workHistory.length;
    }

    // Đánh giá sự phát triển sự nghiệp
    analysis.careerProgression = this.evaluateCareerProgression(workHistory);

    // Tìm kinh nghiệm lãnh đạo
    analysis.leadershipExperience = workHistory.some(
      (job) =>
        (job.title || "").toLowerCase().includes("lead") ||
        (job.title || "").toLowerCase().includes("manager") ||
        (job.title || "").toLowerCase().includes("director") ||
        (job.description || "").toLowerCase().includes("team")
    );

    // Đánh giá kinh nghiệm liên quan đến vị trí
    analysis.relevantExperience = this.calculateRelevantExperience(
      workHistory,
      criteria.jobTitle,
      criteria.industry
    );

    return analysis;
  }

  /**
   * Phân tích học vấn
   */
  static analyzeEducation(candidate, criteria) {
    const education = candidate.education || [];
    const certifications = candidate.certifications || [];

    const analysis = {
      highestDegree: "none",
      relevantDegree: false,
      prestigiousInstitution: false,
      continuousLearning: false,
      certificationCount: certifications.length,
      relevantCertifications: [],
      educationGaps: [],
    };

    // Tìm bằng cấp cao nhất
    const degrees = ["bachelor", "master", "phd", "doctorate"];
    for (const edu of education) {
      const degree = (edu.degree || "").toLowerCase();
      for (const d of degrees.reverse()) {
        if (degree.includes(d)) {
          analysis.highestDegree = d;
          break;
        }
      }
    }

    // Đánh giá độ liên quan của học vấn
    analysis.relevantDegree = education.some((edu) =>
      this.isRelevantEducation(edu, criteria.jobTitle, criteria.industry)
    );

    // Tìm chứng chỉ liên quan
    analysis.relevantCertifications = certifications.filter((cert) =>
      this.isRelevantCertification(cert, criteria.requiredSkills)
    );

    // Đánh giá việc học tập liên tục
    analysis.continuousLearning = this.evaluateContinuousLearning(
      education,
      certifications,
      candidate.updatedAt
    );

    return analysis;
  }

  /**
   * Phân tích nội dung CV (nếu có)
   */
  static async analyzeCVContent(candidate) {
    const analysis = {
      hasCV: !!candidate.cvUrl,
      cvQuality: "unknown",
      keywordDensity: {},
      readabilityScore: 0,
      structureScore: 0,
      contentRichness: 0,
    };

    if (!candidate.cvUrl) {
      return analysis;
    }

    // Nếu có URL CV, có thể phân tích nội dung
    // (Ở đây chúng ta mô phỏng phân tích, trong thực tế cần OCR hoặc PDF parser)
    analysis.cvQuality = this.mockCVQualityAnalysis(candidate);
    analysis.keywordDensity = this.mockKeywordAnalysis(candidate);
    analysis.readabilityScore = Math.random() * 100;
    analysis.structureScore = Math.random() * 100;
    analysis.contentRichness = Math.random() * 100;

    return analysis;
  }

  /**
   * Tạo insights về tính cách từ thông tin có sẵn
   */
  static generatePersonalityInsights(candidate) {
    const insights = {
      communicationStyle: "unknown",
      workStyle: "unknown",
      motivationFactors: [],
      culturalFit: "medium",
      adaptability: "medium",
    };

    // Phân tích dựa trên thông tin có sẵn
    const summary = (candidate.summary || "").toLowerCase();
    const workHistory = candidate.workHistory || [];

    // Đánh giá style giao tiếp từ summary
    if (summary.includes("communication") || summary.includes("present")) {
      insights.communicationStyle = "strong";
    }

    // Đánh giá work style từ lịch sử công việc
    if (workHistory.length > 3) {
      insights.adaptability = "high";
    }

    // Tìm motivation factors
    if (summary.includes("innovation") || summary.includes("creative")) {
      insights.motivationFactors.push("innovation");
    }
    if (summary.includes("team") || summary.includes("collaborate")) {
      insights.motivationFactors.push("teamwork");
    }
    if (summary.includes("lead") || summary.includes("manage")) {
      insights.motivationFactors.push("leadership");
    }

    return insights;
  }

  /**
   * Đánh giá điểm mạnh và điểm yếu
   */
  static evaluateStrengthsAndWeaknesses(candidate) {
    const evaluation = {
      strengths: [],
      weaknesses: [],
      overallProfile: "balanced",
    };

    const skills = candidate.skills || [];
    const workHistory = candidate.workHistory || [];
    const experience = candidate.experience || "";

    // Xác định điểm mạnh
    if (skills.length >= 10) {
      evaluation.strengths.push("Đa dạng kỹ năng kỹ thuật");
    }

    if (workHistory.length >= 3) {
      evaluation.strengths.push("Kinh nghiệm làm việc phong phú");
    }

    if (this.extractYearsFromExperience(experience) >= 5) {
      evaluation.strengths.push("Kinh nghiệm lâu năm trong ngành");
    }

    // Xác định điểm yếu hoặc rủi ro
    if (
      workHistory.length > 5 &&
      this.extractYearsFromExperience(experience) < 5
    ) {
      evaluation.weaknesses.push("Thay đổi công việc thường xuyên");
    }

    if (skills.length < 3) {
      evaluation.weaknesses.push("Hạn chế về kỹ năng kỹ thuật");
    }

    if (!candidate.cvUrl) {
      evaluation.weaknesses.push("Chưa có CV đính kèm");
    }

    // Đánh giá tổng thể
    if (evaluation.strengths.length > evaluation.weaknesses.length) {
      evaluation.overallProfile = "strong";
    } else if (evaluation.weaknesses.length > evaluation.strengths.length) {
      evaluation.overallProfile = "needs_development";
    }

    return evaluation;
  }

  /**
   * Tạo câu hỏi phỏng vấn gợi ý
   */
  static generateInterviewQuestions(candidate) {
    const questions = [];
    const skills = candidate.skills || [];
    const workHistory = candidate.workHistory || [];

    // Câu hỏi về kỹ năng
    if (skills.length > 0) {
      const randomSkill = skills[Math.floor(Math.random() * skills.length)];
      questions.push(`Hãy chia sẻ về kinh nghiệm của bạn với ${randomSkill}?`);
    }

    // Câu hỏi về kinh nghiệm
    if (workHistory.length > 0) {
      const latestJob = workHistory[0];
      if (latestJob && latestJob.title) {
        questions.push(`Thử thách lớn nhất khi làm ${latestJob.title} là gì?`);
      }
    }

    // Câu hỏi chung
    questions.push("Điều gì động viên bạn nhất trong công việc?");
    questions.push("Bạn thấy bản thân như thế nào sau 3 năm nữa?");

    return questions.slice(0, 5); // Giới hạn 5 câu hỏi
  }

  /**
   * Tính điểm AI tổng hợp
   */
  static calculateComprehensiveScore(analysis, criteria) {
    let score = 0;
    const weights = {
      skills: 0.3,
      experience: 0.25,
      education: 0.15,
      cv: 0.1,
      personality: 0.1,
      overall: 0.1,
    };

    // Điểm kỹ năng
    const skillsScore = this.calculateSkillsScore(
      analysis.skillsAnalysis,
      criteria
    );
    score += skillsScore * weights.skills;

    // Điểm kinh nghiệm
    const experienceScore = this.calculateExperienceScore(
      analysis.experienceAnalysis,
      criteria
    );
    score += experienceScore * weights.experience;

    // Điểm học vấn
    const educationScore = this.calculateEducationScore(
      analysis.educationAnalysis
    );
    score += educationScore * weights.education;

    // Điểm CV
    const cvScore = this.calculateCVScore(analysis.cvAnalysis);
    score += cvScore * weights.cv;

    // Điểm tính cách
    const personalityScore = this.calculatePersonalityScore(
      analysis.personalityInsights
    );
    score += personalityScore * weights.personality;

    // Điểm tổng thể
    const overallScore = this.calculateOverallScore(
      analysis.strengthsAndWeaknesses
    );
    score += overallScore * weights.overall;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Dự đoán khả năng phù hợp với công việc
   */
  static predictJobFit(analysis, criteria) {
    const factors = [
      analysis.skillsAnalysis.requiredSkillsMatch /
        (criteria.requiredSkills?.length || 1),
      analysis.experienceAnalysis.relevantExperience / 10,
      analysis.educationAnalysis.relevantDegree ? 1 : 0.5,
      analysis.cvAnalysis.hasCV ? 1 : 0.7,
      analysis.personalityInsights.culturalFit === "high" ? 1 : 0.8,
    ];

    const avgFit =
      factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
    return Math.min(100, avgFit * 100);
  }

  /**
   * Tạo gợi ý dựa trên phân tích
   */
  static generateRecommendations(analysis, criteria) {
    const recommendations = [];

    // Gợi ý dựa trên kỹ năng
    if (analysis.skillsAnalysis.requiredSkillsMatch > 0.8) {
      recommendations.push("Ứng viên có kỹ năng rất phù hợp với yêu cầu");
    } else if (analysis.skillsAnalysis.skillGaps.length > 0) {
      recommendations.push(
        `Cần đào tạo thêm: ${analysis.skillsAnalysis.skillGaps.join(", ")}`
      );
    }

    // Gợi ý dựa trên kinh nghiệm
    if (analysis.experienceAnalysis.totalYears >= 5) {
      recommendations.push("Ứng viên có kinh nghiệm phong phú");
    }

    if (analysis.experienceAnalysis.leadershipExperience) {
      recommendations.push("Có tiềm năng lãnh đạo");
    }

    // Gợi ý dựa trên tổng thể
    if (analysis.aiScore >= 80) {
      recommendations.push("Ứng viên xuất sắc, nên ưu tiên phỏng vấn");
    } else if (analysis.aiScore >= 60) {
      recommendations.push("Ứng viên tiềm năng, đáng xem xét");
    }

    return recommendations;
  }

  /**
   * Xác định các yếu tố rủi ro
   */
  static identifyRiskFactors(analysis) {
    const risks = [];

    if (analysis.experienceAnalysis.averageJobDuration < 12) {
      risks.push("Thời gian làm việc ngắn ở mỗi công ty");
    }

    if (analysis.skillsAnalysis.skillGaps.length > 3) {
      risks.push("Thiếu nhiều kỹ năng bắt buộc");
    }

    if (!analysis.cvAnalysis.hasCV) {
      risks.push("Không có CV đính kèm");
    }

    if (
      analysis.strengthsAndWeaknesses.overallProfile === "needs_development"
    ) {
      risks.push("Hồ sơ cần được cải thiện");
    }

    return risks;
  }

  // Helper methods
  static getTier(score, totalCandidates) {
    const percentage = score / 100;
    if (percentage >= 0.8) return "Xuất sắc";
    if (percentage >= 0.6) return "Tốt";
    if (percentage >= 0.4) return "Trung bình";
    return "Cần cải thiện";
  }

  static isTechnicalSkill(skill) {
    const techKeywords = [
      "javascript",
      "python",
      "java",
      "react",
      "node",
      "sql",
      "aws",
      "docker",
      "git",
    ];
    return techKeywords.some((keyword) =>
      skill.toLowerCase().includes(keyword)
    );
  }

  static isTrendingSkill(skill) {
    const trending = [
      "ai",
      "machine learning",
      "blockchain",
      "cloud",
      "devops",
      "microservices",
    ];
    return trending.some((trend) => skill.toLowerCase().includes(trend));
  }

  static isRareSkill(skill) {
    const rare = ["quantum", "webassembly", "rust", "go", "kotlin"];
    return rare.some((r) => skill.toLowerCase().includes(r));
  }

  static extractYearsFromExperience(experience) {
    const match = experience.match(/(\d+)\s*(year|năm)/i);
    return match ? parseInt(match[1]) : 0;
  }

  static calculateJobDuration(job) {
    // Mô phỏng tính toán thời gian làm việc (tháng)
    return Math.floor(Math.random() * 36) + 6; // 6-42 tháng
  }

  static evaluateCareerProgression(workHistory) {
    if (workHistory.length < 2) return "stable";

    // Đánh giá dựa trên title progression
    const hasProgression = workHistory.some((job, index) => {
      if (index === 0) return false;
      const current = (job.title || "").toLowerCase();
      const previous = (workHistory[index - 1].title || "").toLowerCase();

      return (
        (current.includes("senior") && !previous.includes("senior")) ||
        (current.includes("lead") && !previous.includes("lead")) ||
        (current.includes("manager") && !previous.includes("manager"))
      );
    });

    return hasProgression ? "progressing" : "stable";
  }

  static calculateRelevantExperience(workHistory, jobTitle, industry) {
    let relevantYears = 0;
    const targetTitle = (jobTitle || "").toLowerCase();
    const targetIndustry = (industry || "").toLowerCase();

    for (const job of workHistory) {
      const jobTitleLower = (job.title || "").toLowerCase();
      const jobIndustryLower = (job.company || "").toLowerCase();

      let relevanceScore = 0;

      // Điểm cho title match
      if (
        jobTitleLower.includes(targetTitle) ||
        targetTitle.includes(jobTitleLower)
      ) {
        relevanceScore += 1;
      }

      // Điểm cho industry match
      if (
        jobIndustryLower.includes(targetIndustry) ||
        targetIndustry.includes(jobIndustryLower)
      ) {
        relevanceScore += 0.5;
      }

      const duration = this.calculateJobDuration(job) / 12; // Convert to years
      relevantYears += duration * relevanceScore;
    }

    return relevantYears;
  }

  static isRelevantEducation(education, jobTitle, industry) {
    const degree = (education.degree || "").toLowerCase();
    const field = (education.field || "").toLowerCase();

    // Mapping đơn giản cho demo
    const techFields = ["computer", "software", "information", "engineering"];
    const businessFields = ["business", "management", "economics", "marketing"];

    if (jobTitle && jobTitle.toLowerCase().includes("developer")) {
      return techFields.some(
        (field) => degree.includes(field) || field.includes(field)
      );
    }

    return true; // Default to relevant
  }

  static isRelevantCertification(cert, requiredSkills) {
    const certName = (cert.name || "").toLowerCase();
    return (requiredSkills || []).some((skill) =>
      certName.includes(skill.toLowerCase())
    );
  }

  static evaluateContinuousLearning(education, certifications, lastUpdate) {
    const recentEducation = education.filter((edu) => {
      const year = edu.year || new Date().getFullYear();
      return new Date().getFullYear() - year <= 3;
    });

    const recentCerts = certifications.filter((cert) => {
      const year = cert.year || new Date().getFullYear();
      return new Date().getFullYear() - year <= 2;
    });

    return recentEducation.length > 0 || recentCerts.length > 0;
  }

  // Mock functions for CV analysis (in real implementation, use OCR/PDF parsing)
  static mockCVQualityAnalysis(candidate) {
    const factors = [
      candidate.skills?.length || 0,
      candidate.workHistory?.length || 0,
      candidate.education?.length || 0,
      candidate.summary ? 1 : 0,
    ];

    const score = factors.reduce((sum, factor) => sum + factor, 0);

    if (score >= 8) return "excellent";
    if (score >= 5) return "good";
    if (score >= 3) return "fair";
    return "poor";
  }

  static mockKeywordAnalysis(candidate) {
    const text = [
      candidate.summary || "",
      ...(candidate.skills || []),
      ...(candidate.workHistory || []).map((job) => job.description || ""),
    ]
      .join(" ")
      .toLowerCase();

    const keywords = [
      "javascript",
      "react",
      "node",
      "python",
      "java",
      "aws",
      "docker",
    ];
    const density = {};

    keywords.forEach((keyword) => {
      const count = (text.match(new RegExp(keyword, "g")) || []).length;
      density[keyword] = count;
    });

    return density;
  }

  // Score calculation helpers
  static calculateSkillsScore(skillsAnalysis, criteria) {
    const requiredWeight = 0.6;
    const preferredWeight = 0.3;
    const diversityWeight = 0.1;

    const requiredScore =
      (skillsAnalysis.requiredSkillsMatch /
        (criteria.requiredSkills?.length || 1)) *
      100;
    const preferredScore =
      (skillsAnalysis.preferredSkillsMatch /
        (criteria.preferredSkills?.length || 1)) *
      100;
    const diversityScore = Math.min(skillsAnalysis.totalSkills * 2, 100);

    return (
      requiredScore * requiredWeight +
      preferredScore * preferredWeight +
      diversityScore * diversityWeight
    );
  }

  static calculateExperienceScore(experienceAnalysis, criteria) {
    const yearScore = Math.min(experienceAnalysis.totalYears * 10, 100);
    const relevanceScore = Math.min(
      experienceAnalysis.relevantExperience * 20,
      100
    );
    const stabilityScore =
      experienceAnalysis.averageJobDuration >= 18 ? 100 : 50;
    const leadershipBonus = experienceAnalysis.leadershipExperience ? 20 : 0;

    return (
      (yearScore * 0.4 +
        relevanceScore * 0.4 +
        stabilityScore * 0.2 +
        leadershipBonus) *
      0.01 *
      100
    );
  }

  static calculateEducationScore(educationAnalysis) {
    const degreeScores = { none: 0, bachelor: 60, master: 80, phd: 100 };
    const degreeScore = degreeScores[educationAnalysis.highestDegree] || 0;
    const relevanceBonus = educationAnalysis.relevantDegree ? 20 : 0;
    const certBonus = Math.min(educationAnalysis.certificationCount * 5, 20);
    const learningBonus = educationAnalysis.continuousLearning ? 10 : 0;

    return Math.min(
      degreeScore + relevanceBonus + certBonus + learningBonus,
      100
    );
  }

  static calculateCVScore(cvAnalysis) {
    if (!cvAnalysis.hasCV) return 30;

    const qualityScores = { poor: 40, fair: 60, good: 80, excellent: 100 };
    return qualityScores[cvAnalysis.cvQuality] || 50;
  }

  static calculatePersonalityScore(personalityInsights) {
    let score = 50; // Base score

    if (personalityInsights.communicationStyle === "strong") score += 20;
    if (personalityInsights.adaptability === "high") score += 15;
    if (personalityInsights.motivationFactors.length > 2) score += 15;

    return Math.min(score, 100);
  }

  static calculateOverallScore(strengthsAndWeaknesses) {
    const strengthPoints = strengthsAndWeaknesses.strengths.length * 20;
    const weaknessPoints = strengthsAndWeaknesses.weaknesses.length * 10;

    const profileScores = { strong: 100, balanced: 70, needs_development: 40 };
    const profileScore =
      profileScores[strengthsAndWeaknesses.overallProfile] || 50;

    return Math.max(0, profileScore + strengthPoints - weaknessPoints);
  }
}

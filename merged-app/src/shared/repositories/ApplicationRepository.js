import BaseRepository from "./BaseRepository.js";
import apiClient from "../services/api/ApiClient.js";
import ApplicationApiService from "../services/api/ApplicationApiService.js";

/**
 * Application Repository - Handles application and candidate data operations
 */
export class ApplicationRepository extends BaseRepository {
  constructor() {
    super(apiClient);
    this.baseEndpoint = "/application";
    this.apiService = ApplicationApiService;
  }

  // Lấy tất cả ứng viên của một job
  async getCandidatesByJobId(jobId, forceRefresh = false) {
    const cacheKey = `job_candidates_${jobId}`;

    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      console.log(`[API Request] GET /application/getAllCandidates/${jobId}`);

      const response = await this.apiService.getAllCandidates(jobId);

      console.log(`🔍 Raw backend response for job ${jobId}:`, { data: response });
      console.log(`🔍 Response data type:`, typeof response);
      console.log(`🔍 Response data:`, JSON.stringify(response, null, 2));
      console.log(
        `🔍 Response data length:`,
        Array.isArray(response) ? response.length : "Not array"
      );

      // Transform data từ backend format sang UI format
      const transformedData = this.transformCandidatesData(response || []);

      console.log(
        `🔄 Transformed data for job ${jobId}:`,
        JSON.stringify(transformedData, null, 2)
      );
      console.log(`🔄 Transformed data length:`, transformedData.length);

      // Cache kết quả
      this.setCache(cacheKey, transformedData);

      return transformedData;
    } catch (error) {
      console.error(`Get candidates for job ${jobId} error:`, error);
      throw error;
    }
  }

  // Transform data từ backend format sang UI format
  transformCandidatesData(backendData) {
    console.log(
      `🔄 transformCandidatesData input:`,
      JSON.stringify(backendData, null, 2)
    );
    console.log(`🔄 Is array:`, Array.isArray(backendData));

    if (!Array.isArray(backendData)) {
      console.log(`❌ BackendData is not array, returning empty array`);
      return [];
    }

    if (backendData.length === 0) {
      console.log(`⚠️ BackendData is empty array`);
      return [];
    }

    return backendData.map((item, index) => {
      console.log(
        `🔄 Processing item ${index}:`,
        JSON.stringify(item, null, 2)
      );
      // Backend trả về structure: { candidates: {...}, applied_at, status }
      const application = item;
      const candidate = application.candidates || {};

      // Get user data if available (might have avatar in users table)
      const user = candidate.users || candidate.user || {};

      console.log(`🔄 Application:`, JSON.stringify(application, null, 2));
      console.log(`🔄 Candidate:`, JSON.stringify(candidate, null, 2));

      // Debug avatar mapping
      console.log(
        `🖼️ Avatar mapping for ${candidate.full_name || candidate.name}:`,
        {
          candidate_portfolio: candidate.portfolio,
          final: candidate.portfolio,
        }
      );

      return {
        id: candidate.user_id || candidate.id,
        name: candidate.full_name || candidate.name || "N/A",
        email: candidate.email || "N/A",
        phone: candidate.phone_number || candidate.phone || "N/A",
        experience: candidate.experience || "Chưa có thông tin",
        rating: candidate.rating || 0,
        avatar: candidate.portfolio,

        appliedDate: application.applied_at
          ? new Date(application.applied_at).toLocaleDateString("vi-VN")
          : "N/A",
        status: this.mapApplicationStatus(application.status),
        cv_url: candidate.cv_url,
        cvUrl: candidate.cv_url, // Thêm alias cho CandidateCard
        title: candidate.title || candidate.current_job,
        appliedPosition: candidate.desired_position,
        // Thêm thông tin bổ sung
        location: candidate.location || candidate.address,
        education: candidate.education,
        skills: Array.isArray(candidate.skills) ? candidate.skills : [],
        bio: candidate.bio || candidate.summary,
        profileImage: candidate.profile_image || candidate.avatar,
        // Thông tin nguyện vọng công việc
        job_preferences:
          candidate.job_preferences || candidate.preferred_position,
        salary_expectation:
          candidate.salary_expectation || candidate.expected_salary,
        work_type_preference:
          candidate.work_type_preference || candidate.work_type,
      };
    });
  }

  // Map application status từ backend sang UI
  mapApplicationStatus(backendStatus) {
    const statusMap = {
      pending: "pending",
      reviewed: "pending", // reviewed vẫn là pending trong UI
      accepted: "shortlisted",
      rejected: "rejected",
      approved: "shortlisted", // fallback cho trường hợp cũ
      interviewing: "shortlisted",
      hired: "shortlisted",
    };

    return statusMap[backendStatus] || "pending";
  }

  // Clear cache cho job candidates
  clearJobCandidatesCache(jobId) {
    this.clearCache(`job_candidates_${jobId}`);
  }

  // Cập nhật trạng thái ứng viên
  async updateApplicationStatus(applicationId, status) {
    try {
      const response = await this.apiService.updateApplicationStatus(applicationId, status);
      return response;
    } catch (error) {
      console.error(`Update application ${applicationId} status error:`, error);
      throw error;
    }
  }

  // Helper method để delay giữa requests
  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Lấy tổng số applications cho các job IDs với rate limiting
  async getApplicationCountByJobIds(jobIds, forceRefresh = false) {
    const cacheKey = `application_counts_${jobIds.join("_")}`;

    if (!forceRefresh && jobIds.length > 0) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log("💾 Cache hit for application counts");
        return cached;
      }
    }

    try {
      console.log(`🔄 Fetching application counts for ${jobIds.length} jobs`);

      // Use ApplicationApiService with rate limiting protection
      const batchResults = await this.apiService.batchGetApplications(jobIds, {
        batchSize: 3,
        delay: 200,
        maxRetries: 2
      });

      const applicationCounts = {};
      let totalApplications = 0;

      Object.entries(batchResults).forEach(([jobId, result]) => {
        const count = result.count || 0;
        applicationCounts[jobId] = count;
        totalApplications += count;
      });

      const result = { applicationCounts, totalApplications };

      console.log("✅ Application counts fetched:", result);

      // Cache kết quả
      this.setCache(cacheKey, result);

      return result;
    } catch (error) {
      console.error("Get application count by job IDs error:", error);
      // Return 0 counts instead of throwing to avoid breaking UI
      return {
        applicationCounts: jobIds.reduce((acc, jobId) => {
          acc[jobId] = 0;
          return acc;
        }, {}),
        totalApplications: 0,
      };
    }
  }

  // Lấy số lượng ứng viên UNIQUE cho các job IDs (1 ứng viên chỉ đếm 1 lần dù apply nhiều job)
  async getUniqueCandidateCountByJobIds(jobIds, forceRefresh = false) {
    const cacheKey = `unique_candidates_${jobIds.join("_")}`;

    if (!forceRefresh && jobIds.length > 0) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const uniqueCandidateIds = new Set();
      const candidateCountsByJob = {};

      // Use batch API with rate limiting
      const batchResults = await this.apiService.batchGetApplications(jobIds, {
        batchSize: 3,
        delay: 200,
        maxRetries: 2
      });

      Object.entries(batchResults).forEach(([jobId, result]) => {
        const candidates = result.candidates || [];
        const transformedCandidates = this.transformCandidatesData(candidates);
        
        candidateCountsByJob[jobId] = transformedCandidates.length;

        // Thêm candidate IDs vào Set để đếm unique
        transformedCandidates.forEach((candidate) => {
          if (candidate.id) {
            uniqueCandidateIds.add(candidate.id);
          }
        });
      });

      const result = {
        applicationCounts: candidateCountsByJob, // Số applications per job
        totalApplications: Object.values(candidateCountsByJob).reduce(
          (sum, count) => sum + count,
          0
        ),
        uniqueCandidateIds: Array.from(uniqueCandidateIds),
        totalUniqueCandidates: uniqueCandidateIds.size, // Số ứng viên unique
      };

      // Cache kết quả
      this.setCache(cacheKey, result);

      return result;
    } catch (error) {
      console.error("Get unique candidate count by job IDs error:", error);
      return {
        applicationCounts: jobIds.reduce((acc, jobId) => {
          acc[jobId] = 0;
          return acc;
        }, {}),
        totalApplications: 0,
        uniqueCandidateIds: [],
        totalUniqueCandidates: 0,
      };
    }
  }
}

export default new ApplicationRepository();

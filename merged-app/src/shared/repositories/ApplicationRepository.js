import BaseRepository from "./BaseRepository.js";
import apiClient from "../services/api/ApiClient.js";
import Constants from "expo-constants";

/**
 * Application Repository - Handles application and candidate data operations
 */
export class ApplicationRepository extends BaseRepository {
  constructor() {
    super(apiClient);
    this.baseEndpoint = "/application";
  }

  // Helper method để tạo request
  async makeApplicationRequest(method, endpoint, data = null, config = {}) {
    const baseUrl =
      Constants.expoConfig?.extra?.API?.replace("/client", "") ||
      "http://localhost:3000";
    const fullUrl = `${baseUrl}${endpoint}`;

    const requestConfig = {
      ...config,
      url: fullUrl,
      method,
      ...(data && { data }),
    };

    return await apiClient.request(requestConfig);
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

      const response = await this.makeApplicationRequest(
        "GET",
        `/application/getAllCandidates/${jobId}`
      );

      console.log(`🔍 Raw backend response for job ${jobId}:`, response);
      console.log(`🔍 Response data type:`, typeof response.data);
      console.log(`🔍 Response data:`, JSON.stringify(response.data, null, 2));
      console.log(
        `🔍 Response data length:`,
        Array.isArray(response.data) ? response.data.length : "Not array"
      );

      // Transform data từ backend format sang UI format
      const transformedData = this.transformCandidatesData(response.data || []);

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

      console.log(`🔄 Application:`, JSON.stringify(application, null, 2));
      console.log(`🔄 Candidate:`, JSON.stringify(candidate, null, 2));

      return {
        id: candidate.user_id || candidate.id,
        name: candidate.full_name || candidate.name || "N/A",
        email: candidate.email || "N/A",
        phone: candidate.phone_number || candidate.phone || "N/A",
        experience: candidate.experience || "Chưa có thông tin",
        rating: candidate.rating || 0,
        avatar: candidate.avatar || "👤",
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
      const response = await this.makeApplicationRequest(
        "PATCH",
        `/application/updateStatus/${applicationId}`,
        { status }
      );

      return response.data;
    } catch (error) {
      console.error(`Update application ${applicationId} status error:`, error);
      throw error;
    }
  }
}

export default new ApplicationRepository();

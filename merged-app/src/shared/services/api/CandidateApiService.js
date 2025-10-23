import apiClient from "./ApiClient.js";

/**
 * Candidate API Service - Handles candidate-related API calls
 */
export class CandidateApiService {
  static endpoint = "/client/candidates";

  // Get all candidates
  static async getAllCandidates() {
    const response = await apiClient.get(`${this.endpoint}/getAll`);
    return response.data;
  }

  // Get candidate profile by ID
  static async getCandidateById(candidateId) {
    const response = await apiClient.get(
      `${this.endpoint}/getProfile/${candidateId}`
    );
    return response.data;
  }

  // Search candidates (fallback to client-side filtering)
  static async searchCandidates(query, filters = {}) {
    const candidates = await this.getAllCandidates();
    if (!query) return candidates;

    return candidates.filter(
      (candidate) =>
        candidate.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        candidate.skills?.some((skill) =>
          skill.toLowerCase().includes(query.toLowerCase())
        )
    );
  }

  // Upload avatar - Use portfolio upload for now
  static async uploadAvatar(candidateId, avatarUri) {
    const formData = new FormData();
    formData.append("portfolio", {
      uri: avatarUri,
      name: "avatar.jpg",
      type: "image/jpeg",
    });

    const response = await apiClient.post(
      `${this.endpoint}/uploadPortfolio/${candidateId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  // Update candidate profile
  static async updateCandidateProfile(candidateId, profileData) {
    const response = await apiClient.post(
      `${this.endpoint}/updateProfile/${candidateId}`,
      profileData
    );
    return response.data;
  }

  // Upload portfolio
  static async uploadPortfolio(candidateId, portfolioFile) {
    const formData = new FormData();
    formData.append("portfolio", portfolioFile);

    const response = await apiClient.post(
      `${this.endpoint}/uploadPortfolio/${candidateId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  // Upload CV
  // static async uploadCV(candidateId, cvFile) {
  //   const formData = new FormData();
  //   formData.append("cv", cvFile);

  //   const response = await apiClient.post(
  //     `${this.endpoint}/uploadCV/${candidateId}`,
  //     formData,
  //     {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     }
  //   );
  //   return response.data;
  // }

  static async uploadCV(candidateId, cvFile) {
    try {
      const formData = new FormData();

      formData.append("cv", {
        uri: cvFile.uri,
        type: cvFile.type || "application/octet-stream",
        name:
          cvFile.name ||
          `cv_${candidateId}_${Date.now()}.${this.getFileExtension(cvFile.uri)}`,
      });

      console.log("Uploading CV...");

      const response = await apiClient.post(
        `${this.endpoint}/uploadCV/${candidateId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload raw response:", response);

      // Xử lý response data - có thể là string URL hoặc object
      let resultUrl;

      if (typeof response.data === "string") {
        // Nếu response là string URL trực tiếp
        resultUrl = response.data;
      } else if (response.data?.url) {
        // Nếu response là object có property url
        resultUrl = response.data.url;
      } else if (response.data?.data?.url) {
        // Nếu response nested
        resultUrl = response.data.data.url;
      } else {
        console.warn("Unexpected response format:", response.data);
        // Thử lấy bất kỳ string nào từ response
        resultUrl = JSON.stringify(response.data);
      }

      console.log("Processed URL:", resultUrl);

      // Decode URL nếu cần
      if (resultUrl && typeof resultUrl === "string") {
        // Fix encoding issues - decode URL components
        const decodedUrl = decodeURIComponent(resultUrl);
        console.log("Decoded URL:", decodedUrl);

        return { url: decodedUrl };
      }

      throw new Error("No valid URL in response");
    } catch (error) {
      console.error("Upload CV service error:", error);

      if (error.message?.includes("Network Error")) {
        throw new Error("NETWORK_ERROR");
      } else {
        throw new Error("UPLOAD_FAILED: " + error.message);
      }
    }
  }

  // Helper function để lấy extension
  static getFileExtension(uri) {
    const filename = uri.split("/").pop();
    return filename.split(".").pop().toLowerCase();
  }

  // Get candidate CV
  static async getCandidateCV(candidateId) {
    const response = await apiClient.get(`${this.endpoint}/${candidateId}/cv`);
    return response.data;
  }

  // Get candidate portfolio
  static async getCandidatePortfolio(candidateId) {
    const response = await apiClient.get(
      `${this.endpoint}/${candidateId}/portfolio`
    );
    return response.data;
  }

  // Get candidates by skills
  static async getCandidatesBySkills(skills, filters = {}) {
    const params = {
      skills: Array.isArray(skills) ? skills : [skills],
      ...filters,
    };
    const response = await apiClient.get(`${this.endpoint}/by-skills`, {
      params,
    });
    return response.data;
  }

  // Get candidates by location
  static async getCandidatesByLocation(location, radius = 50, filters = {}) {
    const params = { location, radius, ...filters };
    const response = await apiClient.get(`${this.endpoint}/by-location`, {
      params,
    });
    return response.data;
  }

  // Get candidates by level
  static async getCandidatesByLevel(level, filters = {}) {
    const params = { level, ...filters };
    const response = await apiClient.get(`${this.endpoint}/by-level`, {
      params,
    });
    return response.data;
  }

  // Send interview invitation
  static async sendInterviewInvitation(candidateId, invitationData) {
    const response = await apiClient.post(
      `${this.endpoint}/${candidateId}/interview-invitation`,
      invitationData
    );
    return response.data;
  }

  // Create job application
  static async createApplication(candidateId, jobId) {
    const response = await apiClient.post(`/application/create`, {
      candidate_id: candidateId,
      job_id: jobId,
    });
    return response.data;
  }

  // Get candidate applications
  static async getCandidateApplications(candidateId, params = {}) {
    const response = await apiClient.get(
      `${this.endpoint}/${candidateId}/applications`,
      { params }
    );
    return response.data;
  }

  // Get candidate interviews
  static async getCandidateInterviews(candidateId, params = {}) {
    const response = await apiClient.get(
      `${this.endpoint}/${candidateId}/interviews`,
      { params }
    );
    return response.data;
  }

  // Rate candidate
  static async rateCandidate(candidateId, rating, feedback = "") {
    const response = await apiClient.post(
      `${this.endpoint}/${candidateId}/rating`,
      { rating, feedback }
    );
    return response.data;
  }

  // Add to shortlist
  static async addToShortlist(candidateId, jobId, notes = "") {
    const response = await apiClient.post(
      `${this.endpoint}/${candidateId}/shortlist`,
      { jobId, notes }
    );
    return response.data;
  }

  // Remove from shortlist
  static async removeFromShortlist(candidateId, jobId) {
    const response = await apiClient.delete(
      `${this.endpoint}/${candidateId}/shortlist/${jobId}`
    );
    return response.data;
  }

  // Get shortlisted candidates
  static async getShortlistedCandidates(jobId) {
    const response = await apiClient.get(
      `${this.endpoint}/shortlisted/job/${jobId}`
    );
    return response.data;
  }

  // Reject candidate
  static async rejectCandidate(candidateId, jobId, reason = "") {
    const response = await apiClient.post(
      `${this.endpoint}/${candidateId}/reject`,
      { jobId, reason }
    );
    return response.data;
  }

  // Get similar candidates
  static async getSimilarCandidates(candidateId, limit = 10) {
    const response = await apiClient.get(
      `${this.endpoint}/${candidateId}/similar`,
      { params: { limit } }
    );
    return response.data;
  }

  // Get candidate suggestions for job
  static async getCandidateSuggestions(jobId, limit = 20) {
    const response = await apiClient.get(
      `${this.endpoint}/suggestions/job/${jobId}`,
      { params: { limit } }
    );
    return response.data;
  }

  // Advanced AI search
  static async searchCandidatesWithAI(searchCriteria) {
    const response = await apiClient.post(
      `${this.endpoint}/ai-search`,
      searchCriteria
    );
    return response.data;
  }

  // Bulk operations
  static async bulkInviteCandidates(candidateIds, invitationData) {
    const response = await apiClient.post(`${this.endpoint}/bulk/invite`, {
      candidateIds,
      ...invitationData,
    });
    return response.data;
  }

  static async bulkAddToShortlist(candidateIds, jobId) {
    const response = await apiClient.post(`${this.endpoint}/bulk/shortlist`, {
      candidateIds,
      jobId,
    });
    return response.data;
  }

  static async bulkRejectCandidates(candidateIds, jobId, reason) {
    const response = await apiClient.post(`${this.endpoint}/bulk/reject`, {
      candidateIds,
      jobId,
      reason,
    });
    return response.data;
  }

  // Analytics
  static async getCandidateAnalytics(candidateId) {
    const response = await apiClient.get(
      `${this.endpoint}/${candidateId}/analytics`
    );
    return response.data;
  }

  static async getCandidateEngagement(candidateId, dateRange = {}) {
    const params = dateRange;
    const response = await apiClient.get(
      `${this.endpoint}/${candidateId}/engagement`,
      { params }
    );
    return response.data;
  }
}

export default CandidateApiService;

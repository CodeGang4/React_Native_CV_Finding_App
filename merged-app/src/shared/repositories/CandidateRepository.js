import BaseRepository from "./BaseRepository.js";
import { Candidate } from "../domain/entities/Candidate.js";

/**
 * Candidate Repository - Handles candidate data access
 */
export class CandidateRepository extends BaseRepository {
  constructor(apiClient) {
    super(apiClient);
    this.endpoint = "/candidates";
  }

  // Get all candidates with filters
  async getCandidates(filters = {}, useCache = true) {
    try {
      const data = await this.get(`${this.endpoint}/getAll`, {}, useCache);

      // Backend trả về array trực tiếp hoặc có thể là object chứa array
      const candidatesArray = Array.isArray(data)
        ? data
        : data.candidates || [];

      return {
        candidates: candidatesArray.map((c) => Candidate.fromJSON(c)),
        total: candidatesArray.length,
        page: 1,
        totalPages: 1,
      };
    } catch (error) {
      // If no candidates found, return empty array
      if (error.message && error.message.includes("No candidates found")) {
        return {
          candidates: [],
          total: 0,
          page: 1,
          totalPages: 1,
        };
      }
      throw error;
    }
  }

  // Get single candidate by ID
  async getCandidateById(candidateId, useCache = true) {
    const data = await this.get(
      `${this.endpoint}/${candidateId}`,
      {},
      useCache
    );
    return Candidate.fromJSON(data);
  }

  // Search candidates
  async searchCandidates(searchQuery, filters = {}) {
    const params = {
      q: searchQuery,
      ...this.buildCandidateFilters(filters),
    };

    const data = await this.get(`${this.endpoint}/search`, params, false);

    return {
      candidates: data.candidates
        ? data.candidates.map((c) => Candidate.fromJSON(c))
        : data.map((c) => Candidate.fromJSON(c)),
      total: data.total || data.length,
      suggestions: data.suggestions || [],
    };
  }

  // Get candidate suggestions for job
  async getCandidateSuggestions(jobId, limit = 20) {
    const data = await this.get(`${this.endpoint}/suggestions/job/${jobId}`, {
      limit,
    });
    return data.map((c) => Candidate.fromJSON(c));
  }

  // Get candidates by skills
  async getCandidatesBySkills(skills, filters = {}) {
    const params = {
      skills: Array.isArray(skills) ? skills : [skills],
      ...this.buildCandidateFilters(filters),
    };

    const data = await this.get(`${this.endpoint}/by-skills`, params);
    return data.map((c) => Candidate.fromJSON(c));
  }

  // Get candidates by location
  async getCandidatesByLocation(location, radius = 50, filters = {}) {
    const params = {
      location,
      radius,
      ...this.buildCandidateFilters(filters),
    };

    const data = await this.get(`${this.endpoint}/by-location`, params);
    return data.map((c) => Candidate.fromJSON(c));
  }

  // Get candidates by level
  async getCandidatesByLevel(level, filters = {}) {
    const params = {
      level,
      ...this.buildCandidateFilters(filters),
    };

    const data = await this.get(`${this.endpoint}/by-level`, params);
    return data.map((c) => Candidate.fromJSON(c));
  }

  // Update candidate profile
  async updateCandidateProfile(candidateId, profileData) {
    const data = await this.put(`${this.endpoint}/${candidateId}`, profileData);
    return Candidate.fromJSON(data);
  }

  // Upload candidate CV
  async uploadCV(candidateId, cvFile) {
    const formData = new FormData();
    formData.append("cv", cvFile);

    // Use different endpoint for file upload
    const data = await this.post(
      `${this.endpoint}/${candidateId}/cv`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return data;
  }

  // Upload candidate portfolio
  async uploadPortfolio(candidateId, portfolioFile) {
    const formData = new FormData();
    formData.append("portfolio", portfolioFile);

    const data = await this.post(
      `${this.endpoint}/${candidateId}/portfolio`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return data;
  }

  // Get candidate CV URL
  async getCandidateCV(candidateId) {
    return await this.get(`${this.endpoint}/${candidateId}/cv`);
  }

  // Get candidate portfolio URL
  async getCandidatePortfolio(candidateId) {
    return await this.get(`${this.endpoint}/${candidateId}/portfolio`);
  }

  // Send interview invitation
  async sendInterviewInvitation(candidateId, invitationData) {
    return await this.post(
      `${this.endpoint}/${candidateId}/interview-invitation`,
      invitationData
    );
  }

  // Get candidate applications
  async getCandidateApplications(candidateId, filters = {}) {
    const params = this.buildPaginationParams(filters.page, filters.limit, {
      status: filters.status,
      sortBy: filters.sortBy || "createdAt",
      sortOrder: filters.sortOrder || "desc",
    });

    return await this.get(
      `${this.endpoint}/${candidateId}/applications`,
      params
    );
  }

  // Get candidate interviews
  async getCandidateInterviews(candidateId, filters = {}) {
    const params = this.buildPaginationParams(filters.page, filters.limit, {
      status: filters.status,
      sortBy: filters.sortBy || "datetime",
      sortOrder: filters.sortOrder || "asc",
    });

    return await this.get(`${this.endpoint}/${candidateId}/interviews`, params);
  }

  // Rate candidate
  async rateCandidate(candidateId, rating, feedback = "") {
    return await this.post(`${this.endpoint}/${candidateId}/rating`, {
      rating,
      feedback,
    });
  }

  // Add candidate to shortlist
  async addToShortlist(candidateId, jobId, notes = "") {
    return await this.post(`${this.endpoint}/${candidateId}/shortlist`, {
      jobId,
      notes,
    });
  }

  // Remove candidate from shortlist
  async removeFromShortlist(candidateId, jobId) {
    return await this.delete(
      `${this.endpoint}/${candidateId}/shortlist/${jobId}`
    );
  }

  // Get shortlisted candidates for job
  async getShortlistedCandidates(jobId) {
    const data = await this.get(`${this.endpoint}/shortlisted/job/${jobId}`);
    return data.map((c) => Candidate.fromJSON(c));
  }

  // Reject candidate
  async rejectCandidate(candidateId, jobId, reason = "") {
    return await this.post(`${this.endpoint}/${candidateId}/reject`, {
      jobId,
      reason,
    });
  }

  // Get similar candidates
  async getSimilarCandidates(candidateId, limit = 10) {
    const data = await this.get(`${this.endpoint}/${candidateId}/similar`, {
      limit,
    });
    return data.map((c) => Candidate.fromJSON(c));
  }

  // Helper methods
  buildCandidateFilters(filters) {
    const params = {};

    if (filters.skills && filters.skills.length > 0)
      params.skills = filters.skills;
    if (filters.level) params.level = filters.level;
    if (filters.location) params.location = filters.location;
    if (filters.experience) params.experience = filters.experience;
    if (filters.salaryMin) params.salaryMin = filters.salaryMin;
    if (filters.salaryMax) params.salaryMax = filters.salaryMax;
    if (filters.jobType) params.jobType = filters.jobType;
    if (filters.availability) params.availability = filters.availability;
    if (filters.languages) params.languages = filters.languages;
    if (filters.education) params.education = filters.education;
    if (filters.hasCV !== undefined) params.hasCV = filters.hasCV;
    if (filters.hasPortfolio !== undefined)
      params.hasPortfolio = filters.hasPortfolio;
    if (filters.rating) params.rating = filters.rating;
    if (filters.isActive !== undefined) params.isActive = filters.isActive;
    if (filters.isAvailable !== undefined)
      params.isAvailable = filters.isAvailable;

    // Pagination
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    // Sorting
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;

    return params;
  }

  // Advanced search with AI scoring
  async searchCandidatesWithAI(searchCriteria) {
    const data = await this.post(`${this.endpoint}/ai-search`, searchCriteria);
    return data.map((c) => Candidate.fromJSON(c));
  }

  // Bulk operations
  async bulkInviteCandidates(candidateIds, invitationData) {
    return await this.post(`${this.endpoint}/bulk/invite`, {
      candidateIds,
      ...invitationData,
    });
  }

  async bulkAddToShortlist(candidateIds, jobId) {
    return await this.post(`${this.endpoint}/bulk/shortlist`, {
      candidateIds,
      jobId,
    });
  }

  async bulkRejectCandidates(candidateIds, jobId, reason) {
    return await this.post(`${this.endpoint}/bulk/reject`, {
      candidateIds,
      jobId,
      reason,
    });
  }

  // Analytics
  async getCandidateAnalytics(candidateId) {
    return await this.get(`${this.endpoint}/${candidateId}/analytics`);
  }

  async getCandidateEngagement(candidateId, dateRange = {}) {
    const params = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };

    return await this.get(`${this.endpoint}/${candidateId}/engagement`, params);
  }
}

export default CandidateRepository;

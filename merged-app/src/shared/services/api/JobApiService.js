import apiClient from "./ApiClient.js";

/**
 * Job API Service - Handles job-related API calls
 */
export class JobApiService {
  static endpoint = "/jobs";

  // Get all jobs
  static async getAllJobs(params = {}) {
    const response = await apiClient.get(this.endpoint, { params });
    return response.data;
  }

  // Get jobs by company
  static async getJobsByCompany(companyId, params = {}) {
    const response = await apiClient.get(
      `${this.endpoint}/company/${companyId}`,
      { params }
    );
    return response.data;
  }

  // Get job by ID
  static async getJobById(jobId) {
    const response = await apiClient.get(`${this.endpoint}/${jobId}`);
    return response.data;
  }

  // Create new job
  static async createJob(jobData) {
    const response = await apiClient.post(this.endpoint, jobData);
    return response.data;
  }

  // Update job
  static async updateJob(jobId, jobData) {
    const response = await apiClient.put(`${this.endpoint}/${jobId}`, jobData);
    return response.data;
  }

  // Delete job
  static async deleteJob(jobId) {
    const response = await apiClient.delete(`${this.endpoint}/${jobId}`);
    return response.data;
  }

  // Search jobs
  static async searchJobs(query, filters = {}) {
    const params = { q: query, ...filters };
    const response = await apiClient.get(`${this.endpoint}/search`, { params });
    return response.data;
  }

  // Get job statistics
  static async getJobStats(jobId) {
    const response = await apiClient.get(`${this.endpoint}/${jobId}/stats`);
    return response.data;
  }

  // Change job status
  static async changeJobStatus(jobId, status) {
    const response = await apiClient.patch(`${this.endpoint}/${jobId}/status`, {
      status,
    });
    return response.data;
  }

  // Get job applications
  static async getJobApplications(jobId, params = {}) {
    const response = await apiClient.get(
      `${this.endpoint}/${jobId}/applications`,
      { params }
    );
    return response.data;
  }

  // Apply to job
  static async applyToJob(jobId, applicationData) {
    const response = await apiClient.post(
      `${this.endpoint}/${jobId}/apply`,
      applicationData
    );
    return response.data;
  }

  // Save job
  static async saveJob(jobId, candidateId) {
    const response = await apiClient.post(`${this.endpoint}/${jobId}/save`, {
      candidateId,
    });
    return response.data;
  }

  // Unsave job
  static async unsaveJob(jobId, candidateId) {
    const response = await apiClient.delete(
      `${this.endpoint}/${jobId}/save/${candidateId}`
    );
    return response.data;
  }

  // Get saved jobs
  static async getSavedJobs(candidateId) {
    const response = await apiClient.get(
      `${this.endpoint}/saved/${candidateId}`
    );
    return response.data;
  }

  // Increment job views
  static async incrementJobViews(jobId) {
    const response = await apiClient.post(`${this.endpoint}/${jobId}/view`);
    return response.data;
  }

  // Get featured jobs
  static async getFeaturedJobs(limit = 10) {
    const response = await apiClient.get(`${this.endpoint}/featured`, {
      params: { limit },
    });
    return response.data;
  }

  // Get urgent jobs
  static async getUrgentJobs(limit = 10) {
    const response = await apiClient.get(`${this.endpoint}/urgent`, {
      params: { limit },
    });
    return response.data;
  }

  // Get job suggestions
  static async getJobSuggestions(candidateId, limit = 20) {
    const response = await apiClient.get(
      `${this.endpoint}/suggestions/${candidateId}`,
      { params: { limit } }
    );
    return response.data;
  }

  // Bulk operations
  static async bulkUpdateJobStatus(jobIds, status) {
    const response = await apiClient.post(`${this.endpoint}/bulk/status`, {
      jobIds,
      status,
    });
    return response.data;
  }

  static async bulkDeleteJobs(jobIds) {
    const response = await apiClient.post(`${this.endpoint}/bulk/delete`, {
      jobIds,
    });
    return response.data;
  }

  // Analytics
  static async getJobAnalytics(employerId, dateRange = {}) {
    const params = { employerId, ...dateRange };
    const response = await apiClient.get(`${this.endpoint}/analytics`, {
      params,
    });
    return response.data;
  }
}

export default JobApiService;

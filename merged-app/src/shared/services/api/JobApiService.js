import apiClient from "./ApiClient.js";
import { requestQueue } from "../utils/RequestQueue.js";
/**
 * Job API Service - Handles job-related API calls
 */
export class JobApiService {
  static endpoint = "/job";

  // Get all jobs
  static async getAllJobs(params = {}) {
    return requestQueue.enqueue(async () => {
      const response = await apiClient.get(`${this.endpoint}/getJobs`, {
        params,
      });
      console.log(
        "[JobApiService] getAllJobs success:",
        Array.isArray(response.data) ? response.data.length : 0,
        "jobs"
      );
      return response.data;
    }, "jobs-list");
  }

  // Get jobs by company
  static async getJobsByCompany(companyId, params = {}) {
    const response = await apiClient.get(
      `${this.endpoint}/getJobByCompanyId/${companyId}`,
      {
        params,
        priority: "normal",
      }
    );
    return response.data;
  }

  // Get job by ID
  static async getJobById(jobId) {
    const response = await apiClient.get(
      `${this.endpoint}/getJobDetail/${jobId}`,
      {
        priority: "high", // High priority cho job detail
      }
    );
    return response.data;
  }

  // Create new job (requires companyId in route)
  static async createJob(jobData, companyId) {
    const response = await apiClient.post(
      `${this.endpoint}/addJob/${companyId}`,
      jobData,
      {
        priority: "high", // High priority cho create job
        retryable: true, // Cho phép retry
      }
    );
    return response.data;
  }

  // Update job
  static async updateJob(jobId, jobData) {
    const response = await apiClient.put(
      `${this.endpoint}/updateJob/${jobId}`,
      jobData,
      {
        priority: "high", // High priority cho update
        retryable: true,
      }
    );
    return response.data;
  }

  // Delete job
  static async deleteJob(jobId) {
    const response = await apiClient.delete(
      `${this.endpoint}/deleteJob/${jobId}`,
      {
        priority: "normal",
        retryable: false, // Không retry delete để tránh double deletion
      }
    );
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

  // Apply to job - Use ApplicationApiService instead
  static async applyToJob(jobId, applicationData) {
    // Redirect to ApplicationApiService for consistency
    const ApplicationApiService = await import("./ApplicationApiService.js");
    return ApplicationApiService.default.createApplication({
      job_id: jobId,
      ...applicationData,
    });
  }

  // Hide job for candidate
  static async hideJob(candidateId, jobId) {
    const response = await apiClient.post(
      `${this.endpoint}/hideJob/${candidateId}/${jobId}`
    );
    return response.data;
  }

  // Get hidden jobs for candidate
  static async getHiddenJobs(candidateId) {
    const response = await apiClient.get(
      `${this.endpoint}/getHiddenJobs/${candidateId}`
    );
    return response.data;
  }

  static async saveJob(jobId, candidateId) {
    const response = await apiClient.post(
      `/client/saveJobs/save/${candidateId}`,
      { job_id: jobId }
    );
    return response.data;
  }

  static async unsaveJob(jobId, candidateId) {
    const response = await apiClient.delete(
      `/client/saveJobs/unsave/${candidateId}`,
      { data: { job_id: jobId }, }
    );
    return response.data;
  }

  static async getSavedJobs(candidateId) {
    const response = await apiClient.get(
      `/client/saveJobs/getJobs/${candidateId}`
    );
    return response.data;
  }

  // Increment job views
  static async incrementJobViews(jobId) {
    const response = await apiClient.post(`${this.endpoint}/views/${jobId}`);
    return response.data;
  }

  // Get top jobs (featured/popular jobs)
  static async getTopJobs(limit = 10) {
    const response = await apiClient.get(`${this.endpoint}/getTopJobs`, {
      params: { limit },
    });
    return response.data;
  }

  // Alias for backward compatibility
  static async getFeaturedJobs(limit = 10) {
    return this.getTopJobs(limit);
  }

  // Get urgent jobs (may not exist in backend, using getTopJobs)
  static async getUrgentJobs(limit = 10) {
    return this.getTopJobs(limit);
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

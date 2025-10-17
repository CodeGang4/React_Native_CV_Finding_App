import BaseRepository from "./BaseRepository.js";
import { Job } from "../domain/entities/Job.js";

/**
 * Job Repository - Handles job data access
 */
export class JobRepository extends BaseRepository {
  constructor(apiClient) {
    super(apiClient);
    this.endpoint = "/jobs";
  }

  // Get all jobs with filters
  async getJobs(filters = {}, useCache = true) {
    const params = this.buildJobFilters(filters);
    const data = await this.get(this.endpoint, params, useCache);

    return {
      jobs: data.jobs
        ? data.jobs.map((job) => Job.fromJSON(job))
        : data.map((job) => Job.fromJSON(job)),
      total: data.total || data.length,
      page: data.page || 1,
      totalPages: data.totalPages || 1,
    };
  }

  // Get jobs by company
  async getJobsByCompany(companyId, filters = {}, useCache = true) {
    const params = { ...this.buildJobFilters(filters), companyId };
    const data = await this.get(
      `${this.endpoint}/company/${companyId}`,
      params,
      useCache
    );

    return {
      jobs: data.jobs
        ? data.jobs.map((job) => Job.fromJSON(job))
        : data.map((job) => Job.fromJSON(job)),
      total: data.total || data.length,
    };
  }

  // Get jobs by employer
  async getJobsByEmployer(employerId, filters = {}, useCache = true) {
    const params = { ...this.buildJobFilters(filters), employerId };
    const data = await this.get(
      `${this.endpoint}/employer/${employerId}`,
      params,
      useCache
    );

    return {
      jobs: data.jobs
        ? data.jobs.map((job) => Job.fromJSON(job))
        : data.map((job) => Job.fromJSON(job)),
      total: data.total || data.length,
    };
  }

  // Get single job by ID
  async getJobById(jobId, useCache = true) {
    const data = await this.get(`${this.endpoint}/${jobId}`, {}, useCache);
    return Job.fromJSON(data);
  }

  // Create new job
  async createJob(jobData) {
    const data = await this.post(this.endpoint, jobData);
    return Job.fromJSON(data);
  }

  // Update job
  async updateJob(jobId, jobData) {
    const data = await this.put(`${this.endpoint}/${jobId}`, jobData);
    return Job.fromJSON(data);
  }

  // Delete job
  async deleteJob(jobId) {
    return await this.delete(`${this.endpoint}/${jobId}`);
  }

  // Change job status
  async changeJobStatus(jobId, status) {
    const data = await this.put(`${this.endpoint}/${jobId}/status`, { status });
    return Job.fromJSON(data);
  }

  // Get job statistics
  async getJobStats(jobId) {
    return await this.get(`${this.endpoint}/${jobId}/stats`);
  }

  // Get job applications
  async getJobApplications(jobId, filters = {}) {
    const params = this.buildPaginationParams(filters.page, filters.limit, {
      status: filters.status,
      sortBy: filters.sortBy || "createdAt",
      sortOrder: filters.sortOrder || "desc",
    });

    return await this.get(`${this.endpoint}/${jobId}/applications`, params);
  }

  // Search jobs
  async searchJobs(searchQuery, filters = {}) {
    const params = {
      q: searchQuery,
      ...this.buildJobFilters(filters),
    };

    const data = await this.get(`${this.endpoint}/search`, params, false);

    return {
      jobs: data.jobs
        ? data.jobs.map((job) => Job.fromJSON(job))
        : data.map((job) => Job.fromJSON(job)),
      total: data.total || data.length,
      suggestions: data.suggestions || [],
    };
  }

  // Get featured jobs
  async getFeaturedJobs(limit = 10) {
    const data = await this.get(`${this.endpoint}/featured`, { limit });
    return data.map((job) => Job.fromJSON(job));
  }

  // Get urgent jobs
  async getUrgentJobs(limit = 10) {
    const data = await this.get(`${this.endpoint}/urgent`, { limit });
    return data.map((job) => Job.fromJSON(job));
  }

  // Get job suggestions for candidate
  async getJobSuggestions(candidateId, limit = 20) {
    const data = await this.get(`${this.endpoint}/suggestions/${candidateId}`, {
      limit,
    });
    return data.map((job) => Job.fromJSON(job));
  }

  // Increment job views
  async incrementJobViews(jobId) {
    return await this.post(`${this.endpoint}/${jobId}/view`, {});
  }

  // Save/bookmark job
  async saveJob(jobId, candidateId) {
    return await this.post(`${this.endpoint}/${jobId}/save`, { candidateId });
  }

  // Unsave/unbookmark job
  async unsaveJob(jobId, candidateId) {
    return await this.delete(`${this.endpoint}/${jobId}/save/${candidateId}`);
  }

  // Get saved jobs for candidate
  async getSavedJobs(candidateId) {
    const data = await this.get(`${this.endpoint}/saved/${candidateId}`);
    return data.map((job) => Job.fromJSON(job));
  }

  // Apply to job
  async applyToJob(jobId, applicationData) {
    // Use application endpoint instead of jobs endpoint
    const data = { ...applicationData, job_id: jobId };
    return await this.apiClient.post("/application/create", data);
  }

  // Helper methods
  buildJobFilters(filters) {
    const params = {};

    if (filters.status) params.status = filters.status;
    if (filters.location) params.location = filters.location;
    if (filters.jobType) params.jobType = filters.jobType;
    if (filters.level) params.level = filters.level;
    if (filters.salaryMin) params.salaryMin = filters.salaryMin;
    if (filters.salaryMax) params.salaryMax = filters.salaryMax;
    if (filters.skills && filters.skills.length > 0)
      params.skills = filters.skills;
    if (filters.company) params.company = filters.company;
    if (filters.industry) params.industry = filters.industry;
    if (filters.datePosted) params.datePosted = filters.datePosted;
    if (filters.priority) params.priority = filters.priority;

    // Pagination
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    // Sorting
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;

    return params;
  }

  // Bulk operations
  async bulkUpdateJobStatus(jobIds, status) {
    return await this.post(`${this.endpoint}/bulk/status`, { jobIds, status });
  }

  async bulkDeleteJobs(jobIds) {
    return await this.post(`${this.endpoint}/bulk/delete`, { jobIds });
  }

  // Analytics
  async getJobAnalytics(employerId, dateRange = {}) {
    const params = {
      employerId,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };

    return await this.get(`${this.endpoint}/analytics`, params);
  }
}

export default JobRepository;

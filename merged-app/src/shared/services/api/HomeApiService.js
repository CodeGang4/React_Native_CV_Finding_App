import { apiClient } from "./ApiClient.js";
import { requestQueue } from "../utils/RequestQueue.js";

/**
 * Home API Service - Handles home page data from backend
 */
export class HomeApiService {
  static endpoint = "/job";

  // Get jobs for home page (suggestions and best jobs)
  static async getJobs() {
    return requestQueue.enqueue(
      async () => {
        const response = await apiClient.get(`${this.endpoint}/getJobs`);
        console.log("[HomeApiService] getJobs success:", response.data.length, "jobs");
        return response.data;
      },
      "jobs-list" // cache key
    );
  }

  // Get company info by employer_id
  static async getCompanyByEmployerId(employerId) {
    // Validate employerId before making API call
    if (!employerId || employerId === 'undefined' || employerId === null) {
      console.warn('[HomeApiService] Invalid employerId:', employerId);
      throw new Error('Invalid employer ID');
    }

    return requestQueue.enqueue(
      async () => {
        const response = await apiClient.get(`/employer/getCompanyInfo/${employerId}`);
        return response.data;
      },
      `company-${employerId}` // cache key with employer ID
    );
  }

  // Get top jobs by views
  static async getTopJobs(number = 10) {
    return requestQueue.enqueue(
      async () => {
        const response = await apiClient.get(`${this.endpoint}/getTopJobs`, {
          params: { number }
        });
        console.log(
          "[HomeApiService] getTopJobs success:",
          response.data.length,
          "top jobs"
        );
        return response.data;
      },
      `top-jobs-${number}` // cache key with number param
    );
  }

  // Get top companies (only accepted status)
  static async getTopCompanies(number = 10) {
    return requestQueue.enqueue(
      async () => {
        const response = await apiClient.get("/employer/getTopCompanies", {
          params: { number, status: "accepted" }
        });
        const data = response.data;

        // Backend đã filter theo status=accepted trong query, nhưng vẫn giữ backup filter
        const acceptedCompanies = data.filter(
          (company) => company.company_name // Chỉ lấy company có tên
        );

        console.log(
          "[HomeApiService] getTopCompanies success:",
          acceptedCompanies.length,
          "accepted companies"
        );
        
        // Debug: Log first company to see available fields
        if (acceptedCompanies.length > 0) {
          console.log("[HomeApiService] Sample company data:", {
            id: acceptedCompanies[0].id,
            user_id: acceptedCompanies[0].user_id,
            employer_id: acceptedCompanies[0].employer_id,
            company_id: acceptedCompanies[0].company_id,
            company_name: acceptedCompanies[0].company_name,
          });
        }
        return acceptedCompanies;
      },
      `top-companies-${number}` // cache key
    );
  }

  // Get podcasts using existing apiClient (this one uses client prefix)
  static async getPodcasts() {
    return requestQueue.enqueue(
      async () => {
        const response = await apiClient.get("/client/podcast");
        console.log(
          "[HomeApiService] getPodcasts success:",
          response.data.length,
          "podcasts"
        );
        return response.data;
      },
      "podcasts-list" // cache key
    );
  }

  // Get all podcasts for PodcastPage (no limit)
  static async getAllPodcasts() {
    return requestQueue.enqueue(
      async () => {
        const response = await apiClient.get("/client/podcast");
        console.log(
          "[HomeApiService] getAllPodcasts success:",
          response.data.length,
          "total podcasts"
        );
        return response.data;
      },
      "all-podcasts-list" // cache key
    );
  }

  // Update job (for edit functionality)
  static async updateJob(jobId, jobData) {
    return requestQueue.enqueue(
      async () => {
        const response = await apiClient.put(`${this.endpoint}/updateJob/${jobId}`, jobData);
        const data = response.data;
        console.log("[HomeApiService] updateJob success:", jobId);

        // Invalidate cache for this job and related lists
        requestQueue.clearCacheKey(`job-${jobId}`);
        requestQueue.clearCacheKey("jobs-list");
        requestQueue.clearCacheKey("top-jobs-3");

        return data;
      },
      `job-update-${jobId}` // cache key
    );
  }

  // Delete job
  static async deleteJob(jobId) {
    return requestQueue.enqueue(
      async () => {
        const response = await apiClient.delete(`${this.endpoint}/deleteJob/${jobId}`);
        console.log("[HomeApiService] deleteJob success:", jobId);

        // Invalidate cache for this job and related lists
        requestQueue.clearCacheKey(`job-${jobId}`);
        requestQueue.clearCacheKey("jobs-list");
        requestQueue.clearCacheKey("top-jobs-3");

        return { success: true };
      },
      `job-delete-${jobId}` // cache key
    );
  }

  // Get jobs by company ID
  static async getJobsByCompanyId(companyId) {
    return requestQueue.enqueue(
      async () => {
        const response = await apiClient.get(`${this.endpoint}/getJobByCompanyId/${companyId}`);
        const data = response.data;
        console.log(
          "[HomeApiService] getJobsByCompanyId success:",
          data.length,
          "jobs for company",
          companyId
        );
        return data;
      },
      `jobs-company-${companyId}` // cache key
    );
  }
}

export default HomeApiService;

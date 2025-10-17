import apiClient from "./ApiClient.js";

/**
 * Application API Service - Handles application-related API calls
 */
export class ApplicationApiService {
  static endpoint = "/application";

  // Create application (apply to job)
  static async createApplication(applicationData) {
    const response = await apiClient.post(`${this.endpoint}/create`, applicationData);
    return response.data;
  }

  // Update application status
  static async updateApplicationStatus(applicationId, status) {
    const response = await apiClient.patch(
      `${this.endpoint}/updateStatus/${applicationId}`,
      { status }
    );
    return response.data;
  }

  // Calculate competition rate for a job
  static async calculateCompetitionRate(jobId) {
    const response = await apiClient.get(`${this.endpoint}/calculate/${jobId}`);
    return response.data;
  }

  // Get all candidates for a job
  static async getAllCandidates(jobId) {
    const response = await apiClient.get(`${this.endpoint}/getAllCandidates/${jobId}`);
    return response.data;
  }

  // Get all applications by status for a job
  static async getAllApplicationsByStatus(jobId, status = null) {
    const endpoint = status 
      ? `${this.endpoint}/getAllApplicationsByStatus/${jobId}?status=${status}`
      : `${this.endpoint}/getAllApplicationsByStatus/${jobId}`;
    const response = await apiClient.get(endpoint);
    return response.data;
  }

  // Get applications by candidate
  static async getApplicationByCandidate(candidateId) {
    const response = await apiClient.get(`${this.endpoint}/getApplicationByCandidate/${candidateId}`);
    return response.data;
  }

  // Get application statistics
  static async getApplicationStats(jobIds = []) {
    if (jobIds.length === 0) {
      return {
        totalApplications: 0,
        applicationsByJob: {},
      };
    }

    const promises = jobIds.map(async (jobId) => {
      try {
        const candidates = await this.getAllCandidates(jobId);
        return {
          jobId,
          count: Array.isArray(candidates) ? candidates.length : 0,
        };
      } catch (error) {
        console.warn(`Failed to get candidates for job ${jobId}:`, error.message);
        return { jobId, count: 0 };
      }
    });

    const results = await Promise.all(promises);
    
    const applicationsByJob = {};
    let totalApplications = 0;

    results.forEach(({ jobId, count }) => {
      applicationsByJob[jobId] = count;
      totalApplications += count;
    });

    return {
      totalApplications,
      applicationsByJob,
    };
  }

  // Batch get applications with rate limiting protection
  static async batchGetApplications(jobIds, options = {}) {
    const {
      batchSize = 3,
      delay = 200,
      maxRetries = 2
    } = options;

    const results = {};
    
    for (let i = 0; i < jobIds.length; i += batchSize) {
      const batch = jobIds.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (jobId) => {
        let attempts = 0;
        
        while (attempts <= maxRetries) {
          try {
            const candidates = await this.getAllCandidates(jobId);
            return { jobId, candidates, success: true };
          } catch (error) {
            attempts++;
            
            if (error.message?.includes('429') && attempts <= maxRetries) {
              // Rate limited, wait and retry
              const backoffDelay = delay * Math.pow(2, attempts);
              console.warn(`Rate limited for job ${jobId}, retrying in ${backoffDelay}ms...`);
              await new Promise(resolve => setTimeout(resolve, backoffDelay));
              continue;
            }
            
            console.warn(`Failed to get candidates for job ${jobId} after ${attempts} attempts:`, error.message);
            return { jobId, candidates: [], success: false };
          }
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(({ jobId, candidates, success }) => {
        results[jobId] = {
          candidates: candidates || [],
          count: Array.isArray(candidates) ? candidates.length : 0,
          success,
        };
      });

      // Add delay between batches
      if (i + batchSize < jobIds.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return results;
  }
}

export default ApplicationApiService;
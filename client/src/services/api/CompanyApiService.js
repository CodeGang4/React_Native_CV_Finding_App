import apiClient from "./ApiClient.js";

/**
 * Company API Service - Handles company-related API calls
 */
export class CompanyApiService {
  static endpoint = "/companies";

  // Get all companies with pagination and filters
  static async getCompanies(params = {}) {
    const response = await apiClient.get(this.endpoint, { params });
    return response.data;
  }

  // Get company by ID
  static async getCompanyById(companyId) {
    const response = await apiClient.get(`${this.endpoint}/${companyId}`);
    return response.data;
  }

  // Create new company
  static async createCompany(companyData) {
    const response = await apiClient.post(this.endpoint, companyData);
    return response.data;
  }

  // Update company
  static async updateCompany(companyId, companyData) {
    const response = await apiClient.put(
      `${this.endpoint}/${companyId}`,
      companyData
    );
    return response.data;
  }

  // Delete company
  static async deleteCompany(companyId) {
    const response = await apiClient.delete(`${this.endpoint}/${companyId}`);
    return response.data;
  }

  // Get company jobs
  static async getCompanyJobs(companyId, params = {}) {
    const response = await apiClient.get(`${this.endpoint}/${companyId}/jobs`, {
      params,
    });
    return response.data;
  }

  // Get company employees
  static async getCompanyEmployees(companyId, params = {}) {
    const response = await apiClient.get(
      `${this.endpoint}/${companyId}/employees`,
      { params }
    );
    return response.data;
  }

  // Upload company logo
  static async uploadLogo(companyId, imageFile) {
    const formData = new FormData();
    formData.append("logo", imageFile);

    const response = await apiClient.post(
      `${this.endpoint}/${companyId}/logo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  // Get company statistics
  static async getCompanyStats(companyId) {
    const response = await apiClient.get(`${this.endpoint}/${companyId}/stats`);
    return response.data;
  }

  // Search companies
  static async searchCompanies(query, filters = {}) {
    const params = { q: query, ...filters };
    const response = await apiClient.get(`${this.endpoint}/search`, { params });
    return response.data;
  }

  // Get company reviews
  static async getCompanyReviews(companyId, params = {}) {
    const response = await apiClient.get(
      `${this.endpoint}/${companyId}/reviews`,
      { params }
    );
    return response.data;
  }

  // Add company review
  static async addCompanyReview(companyId, reviewData) {
    const response = await apiClient.post(
      `${this.endpoint}/${companyId}/reviews`,
      reviewData
    );
    return response.data;
  }

  // Follow company
  static async followCompany(companyId) {
    const response = await apiClient.post(
      `${this.endpoint}/${companyId}/follow`
    );
    return response.data;
  }

  // Unfollow company
  static async unfollowCompany(companyId) {
    const response = await apiClient.delete(
      `${this.endpoint}/${companyId}/follow`
    );
    return response.data;
  }
}

export default CompanyApiService;

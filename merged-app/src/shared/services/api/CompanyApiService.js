import apiClient from "./ApiClient.js";

/**
 * Company API Service - Handles company-related API calls
 */
export class CompanyApiService {
  static endpoint = "/employer";

  // Get all companies
  static async getCompanies(params = {}) {
    const response = await apiClient.get(`${this.endpoint}/getAllCompany`, { params });
    return response.data;
  }

  // Get verified companies
  static async getVerifiedCompanies(params = {}) {
    const response = await apiClient.get(`${this.endpoint}/getVerifiedCompany`, { params });
    return response.data;
  }

  // Get top companies
  static async getTopCompanies(params = {}) {
    const response = await apiClient.get(`${this.endpoint}/getTopCompanies`, { params });
    return response.data;
  }

  // Get companies by status
  static async getCompanyByStatus(status, params = {}) {
    const response = await apiClient.get(`${this.endpoint}/getCompanyWithStatus/${status}`, { params });
    return response.data;
  }

  // Get company by ID
  static async getCompanyById(companyId) {
    const response = await apiClient.get(`${this.endpoint}/getCompanyInfo/${companyId}`);
    return response.data;
  }

  // Update company information
  static async updateCompany(companyId, companyData) {
    const response = await apiClient.put(
      `${this.endpoint}/updateInfor/${companyId}`,
      companyData
    );
    return response.data;
  }

  // Update company name
  static async updateCompanyName(companyId, name) {
    const response = await apiClient.patch(
      `${this.endpoint}/updateCompanyName/${companyId}`,
      { name }
    );
    return response.data;
  }

  // Update company status
  static async updateCompanyStatus(companyId, status) {
    const response = await apiClient.patch(
      `${this.endpoint}/updateStatus/${companyId}`,
      { status }
    );
    return response.data;
  }

  // Verify company
  static async verifyCompany(companyId) {
    const response = await apiClient.patch(
      `${this.endpoint}/verified/${companyId}`,
      {}
    );
    return response.data;
  }

  // Get company jobs - Use JobApiService instead
  static async getCompanyJobs(companyId, params = {}) {
    const JobApiService = await import('./JobApiService.js');
    return JobApiService.default.getJobsByCompany(companyId, params);
  }

  // Upload company logo
  static async uploadLogo(companyId, imageFile) {
    const formData = new FormData();
    formData.append("companyLogo", imageFile);

    const response = await apiClient.post(
      `${this.endpoint}/uploadCompanyLogo/${companyId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  // Get company analytics/statistics
  static async getCompanyStats(companyId) {
    const response = await apiClient.get(`${this.endpoint}/analytics/${companyId}`);
    return response.data;
  }

  // Search companies - Not implemented in backend yet
  static async searchCompanies(query, filters = {}) {
    // Fallback to getAllCompany with filtering on frontend
    const companies = await this.getCompanies();
    if (!query) return companies;
    
    return companies.filter(company => 
      company.name?.toLowerCase().includes(query.toLowerCase()) ||
      company.category?.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Company reviews, follow features not implemented in current backend
  // These would need separate routes/controllers to be added
}

export default CompanyApiService;

import BaseRepository from "./BaseRepository.js";
import { CompanyApiService } from "../services/api/CompanyApiService.js";

/**
 * Company Repository - Handles company data operations with caching
 */
export class CompanyRepository extends BaseRepository {
  constructor() {
    super("company");
  }

  // Get all companies with pagination and filters
  async getCompanies(params = {}, forceRefresh = false) {
    const cacheKey = `companies_${JSON.stringify(params)}`;

    // Try cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const companies = await CompanyApiService.getCompanies(params);

      // Cache the result
      this.setCache(cacheKey, companies);

      // Cache individual companies
      if (companies.data) {
        companies.data.forEach((company) => {
          this.setCache(`company_${company.id}`, company);
        });
      }

      return companies;
    } catch (error) {
      console.error("Get companies error:", error);
      throw error;
    }
  }

  // Get company by ID
  async getCompanyById(companyId, forceRefresh = false) {
    const cacheKey = `company_${companyId}`;

    // Try cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const company = await CompanyApiService.getCompanyById(companyId);

      // Cache the company data
      this.setCache(cacheKey, company);

      return company;
    } catch (error) {
      console.error(`Get company ${companyId} error:`, error);
      throw error;
    }
  }

  // Create new company
  async createCompany(companyData) {
    try {
      const result = await CompanyApiService.createCompany(companyData);

      // Cache the new company
      this.setCache(`company_${result.id}`, result);

      // Clear companies list cache to force refresh
      this.clearCacheByPattern("companies_");

      return result;
    } catch (error) {
      console.error("Create company error:", error);
      throw error;
    }
  }

  // Update company
  async updateCompany(companyId, companyData) {
    try {
      const result = await CompanyApiService.updateCompany(
        companyId,
        companyData
      );

      // Update cache
      this.setCache(`company_${companyId}`, result);

      // Clear companies list cache to force refresh
      this.clearCacheByPattern("companies_");

      return result;
    } catch (error) {
      console.error(`Update company ${companyId} error:`, error);
      throw error;
    }
  }

  // Delete company
  async deleteCompany(companyId) {
    try {
      const result = await CompanyApiService.deleteCompany(companyId);

      // Clear company from cache
      this.clearCache(`company_${companyId}`);
      this.clearCacheByPattern(`company_${companyId}_`);

      // Clear companies list cache to force refresh
      this.clearCacheByPattern("companies_");

      return result;
    } catch (error) {
      console.error(`Delete company ${companyId} error:`, error);
      throw error;
    }
  }

  // Get company jobs
  async getCompanyJobs(companyId, params = {}, forceRefresh = false) {
    const cacheKey = `company_${companyId}_jobs_${JSON.stringify(params)}`;

    // Try cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const jobs = await CompanyApiService.getCompanyJobs(companyId, params);

      // Cache the result
      this.setCache(cacheKey, jobs);

      return jobs;
    } catch (error) {
      console.error(`Get company ${companyId} jobs error:`, error);
      throw error;
    }
  }

  // Get company employees
  async getCompanyEmployees(companyId, params = {}, forceRefresh = false) {
    const cacheKey = `company_${companyId}_employees_${JSON.stringify(params)}`;

    // Try cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const employees = await CompanyApiService.getCompanyEmployees(
        companyId,
        params
      );

      // Cache the result
      this.setCache(cacheKey, employees);

      return employees;
    } catch (error) {
      console.error(`Get company ${companyId} employees error:`, error);
      throw error;
    }
  }

  // Upload company logo
  async uploadLogo(companyId, imageFile) {
    try {
      const result = await CompanyApiService.uploadLogo(companyId, imageFile);

      // Update company cache with new logo URL
      const cachedCompany = this.getCache(`company_${companyId}`);
      if (cachedCompany) {
        cachedCompany.logoUrl = result.logoUrl;
        this.setCache(`company_${companyId}`, cachedCompany);
      }

      return result;
    } catch (error) {
      console.error(`Upload logo for company ${companyId} error:`, error);
      throw error;
    }
  }

  // Get company statistics
  async getCompanyStats(companyId, forceRefresh = false) {
    const cacheKey = `company_${companyId}_stats`;

    // Try cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const stats = await CompanyApiService.getCompanyStats(companyId);

      // Cache the stats with shorter TTL (5 minutes)
      this.setCache(cacheKey, stats, 5 * 60 * 1000);

      return stats;
    } catch (error) {
      console.error(`Get company ${companyId} stats error:`, error);
      throw error;
    }
  }

  // Search companies
  async searchCompanies(query, filters = {}, forceRefresh = false) {
    const cacheKey = `search_companies_${query}_${JSON.stringify(filters)}`;

    // Try cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const results = await CompanyApiService.searchCompanies(query, filters);

      // Cache the results with shorter TTL (2 minutes)
      this.setCache(cacheKey, results, 2 * 60 * 1000);

      // Cache individual companies
      if (results.data) {
        results.data.forEach((company) => {
          this.setCache(`company_${company.id}`, company);
        });
      }

      return results;
    } catch (error) {
      console.error("Search companies error:", error);
      throw error;
    }
  }

  // Get company reviews
  async getCompanyReviews(companyId, params = {}, forceRefresh = false) {
    const cacheKey = `company_${companyId}_reviews_${JSON.stringify(params)}`;

    // Try cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const reviews = await CompanyApiService.getCompanyReviews(
        companyId,
        params
      );

      // Cache the result
      this.setCache(cacheKey, reviews);

      return reviews;
    } catch (error) {
      console.error(`Get company ${companyId} reviews error:`, error);
      throw error;
    }
  }

  // Add company review
  async addCompanyReview(companyId, reviewData) {
    try {
      const result = await CompanyApiService.addCompanyReview(
        companyId,
        reviewData
      );

      // Clear reviews cache to force refresh
      this.clearCacheByPattern(`company_${companyId}_reviews_`);

      return result;
    } catch (error) {
      console.error(`Add review for company ${companyId} error:`, error);
      throw error;
    }
  }

  // Follow company
  async followCompany(companyId) {
    try {
      const result = await CompanyApiService.followCompany(companyId);

      // Update company cache to reflect follow status
      const cachedCompany = this.getCache(`company_${companyId}`);
      if (cachedCompany) {
        cachedCompany.isFollowed = true;
        cachedCompany.followersCount = (cachedCompany.followersCount || 0) + 1;
        this.setCache(`company_${companyId}`, cachedCompany);
      }

      return result;
    } catch (error) {
      console.error(`Follow company ${companyId} error:`, error);
      throw error;
    }
  }

  // Unfollow company
  async unfollowCompany(companyId) {
    try {
      const result = await CompanyApiService.unfollowCompany(companyId);

      // Update company cache to reflect unfollow status
      const cachedCompany = this.getCache(`company_${companyId}`);
      if (cachedCompany) {
        cachedCompany.isFollowed = false;
        cachedCompany.followersCount = Math.max(
          (cachedCompany.followersCount || 1) - 1,
          0
        );
        this.setCache(`company_${companyId}`, cachedCompany);
      }

      return result;
    } catch (error) {
      console.error(`Unfollow company ${companyId} error:`, error);
      throw error;
    }
  }

  // Clear company cache
  clearCompanyCache(companyId) {
    this.clearCache(`company_${companyId}`);
    this.clearCacheByPattern(`company_${companyId}_`);
  }
}

export default CompanyRepository;

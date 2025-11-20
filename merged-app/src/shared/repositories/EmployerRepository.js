import BaseRepository from "./BaseRepository.js";
import apiClient from "../services/api/ApiClient.js";
import Constants from "expo-constants";

/**
 * Employer Repository - Handles employer/company data operations with caching
 */
export class EmployerRepository extends BaseRepository {
  constructor() {
    super(apiClient);
    this.baseEndpoint = "/employer";
  }

  // Helper method để tạo request với correct base URL cho employer endpoints
  async makeEmployerRequest(method, endpoint, data = null, config = {}) {
    // Get base URL and ensure it doesn't end with /client
    let baseUrl = Constants.expoConfig?.extra?.API || "http://localhost:3000";

    // Remove /client suffix if it exists
    if (baseUrl.endsWith("/client")) {
      baseUrl = baseUrl.replace("/client", "");
    }

    const fullUrl = `${baseUrl}${endpoint}`;

    console.log(`[EmployerRepository] Making ${method} request to: ${fullUrl}`);
    console.log(`[EmployerRepository] Base URL: ${baseUrl}`);
    console.log(`[EmployerRepository] Endpoint: ${endpoint}`);

    const requestConfig = {
      ...config,
      url: fullUrl,
      method,
      ...(data && { data }),
    };

    return await apiClient.request(requestConfig);
  }

  // Lấy thông tin công ty theo ID
  async getCompanyInfo(companyId, forceRefresh = false) {
    // Validate companyId before proceeding
    if (!companyId || companyId === 'undefined' || companyId === null) {
      console.warn('[EmployerRepository] Invalid companyId:', companyId);
      throw new Error('Invalid company ID');
    }

    const cacheKey = `company_info_${companyId}`;

    // Kiểm tra cache trước (trừ khi bắt buộc refresh)
    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Get base URL and ensure it doesn't end with /client
      let baseUrl = Constants.expoConfig?.extra?.API || "http://localhost:3000";

      // Remove /client suffix if it exists
      if (baseUrl.endsWith("/client")) {
        baseUrl = baseUrl.replace("/client", "");
      }

      const fullUrl = `${baseUrl}/employer/getCompanyInfo/${companyId}`;

      console.log(`[EmployerRepository] Direct request to: ${fullUrl}`);

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache kết quả
      this.setCache(cacheKey, data);

      return data;
    } catch (error) {
      console.error(`Get company info ${companyId} error:`, error);
      throw error;
    }
  }

  // Cập nhật thông tin công ty
  async updateCompanyInfo(companyId, companyData) {
    try {
      const response = await this.makeEmployerRequest(
        "PUT",
        `/employer/updateInfor/${companyId}`,
        companyData
      );

      // Cập nhật cache
      this.setCache(`company_info_${companyId}`, response.data);

      return response.data;
    } catch (error) {
      console.error("Update company info error:", error);
      throw error;
    }
  }

  // Cập nhật tên công ty
  async updateCompanyName(companyId, companyName) {
    try {
      const response = await this.makeEmployerRequest(
        "PATCH",
        `/employer/updateCompanyName/${companyId}`,
        { company_name: companyName }
      );

      // Cập nhật cache
      const cachedInfo = this.getFromCache(`company_info_${companyId}`);
      if (cachedInfo) {
        cachedInfo.company_name = companyName;
        this.setCache(`company_info_${companyId}`, cachedInfo);
      }

      return response.data;
    } catch (error) {
      console.error("Update company name error:", error);
      throw error;
    }
  }

  // Upload logo công ty
  async uploadCompanyLogo(companyId, imageFile) {
    try {
      console.log("🔄 EmployerRepository.uploadCompanyLogo called with:");
      console.log("   Company ID:", companyId);
      console.log(
        "   Image file:",
        imageFile ? "✅ File provided" : "❌ No file"
      );

      const formData = new FormData();
      formData.append("companyLogo", imageFile);

      console.log(
        "📤 Making upload request to: /employer/uploadCompanyLogo/" + companyId
      );

      const response = await this.makeEmployerRequest(
        "POST",
        `/employer/uploadCompanyLogo/${companyId}`,
        formData,
        {
          // Don't set Content-Type for FormData - let browser handle it
          headers: {},
        }
      );

      console.log("✅ Upload response received:", response.status);

      // Cập nhật cache
      const cachedInfo = this.getFromCache(`company_info_${companyId}`);
      if (cachedInfo) {
        cachedInfo.company_logo = response.data.logo_url;
        this.setCache(`company_info_${companyId}`, cachedInfo);
      }

      return response.data;
    } catch (error) {
      console.error("Upload company logo error:", error);
      throw error;
    }
  }

  // Lấy tất cả công ty (cho admin)
  async getAllCompanies(forceRefresh = false) {
    const cacheKey = "all_companies";

    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.makeEmployerRequest(
        "GET",
        `/employer/getAllCompany`
      );

      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error("Get all companies error:", error);
      throw error;
    }
  }

  // Lấy các công ty đã được xác minh
  async getVerifiedCompanies(forceRefresh = false) {
    const cacheKey = "verified_companies";

    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.makeEmployerRequest(
        "GET",
        `/employer/getVerifiedCompany`
      );

      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error("Get verified companies error:", error);
      throw error;
    }
  }

  // Xác minh công ty
  async verifyCompany(companyId) {
    try {
      const response = await this.makeEmployerRequest(
        "PATCH",
        `/employer/verified/${companyId}`
      );

      // Cập nhật cache
      const cachedInfo = this.getFromCache(`company_info_${companyId}`);
      if (cachedInfo) {
        cachedInfo.isverified = true;
        this.setCache(`company_info_${companyId}`, cachedInfo);
      }

      // Xóa cache danh sách để buộc refresh
      this.clearCache("verified_companies");
      this.clearCache("all_companies");

      return response.data;
    } catch (error) {
      console.error("Verify company error:", error);
      throw error;
    }
  }

  // Xóa cache khi logout hoặc cần thiết
  clearCompanyCache(companyId = null) {
    if (companyId) {
      this.clearCache(`company_info_${companyId}`);
    } else {
      this.clearCache("company_info_");
      this.clearCache("all_companies");
      this.clearCache("verified_companies");
    }
  }
}

export default new EmployerRepository();

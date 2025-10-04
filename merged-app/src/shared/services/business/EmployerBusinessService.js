import employerRepository from "../../repositories/EmployerRepository.js";

/**
 * Employer Business Service - Handles employer business logic
 */
export class EmployerBusinessService {
  constructor() {
    this.repository = employerRepository;
  }

  // Lấy thông tin công ty với validation
  async getCompanyInfo(companyId, forceRefresh = false) {
    if (!companyId) {
      throw new Error("Company ID is required");
    }

    try {
      const companyInfo = await this.repository.getCompanyInfo(
        companyId,
        forceRefresh
      );

      // Transform data nếu cần thiết
      return this.transformCompanyInfo(companyInfo);
    } catch (error) {
      console.error("Get company info service error:", error);
      throw this.handleError(error);
    }
  }

  // Cập nhật thông tin công ty với validation
  async updateCompanyInfo(companyId, companyData) {
    if (!companyId) {
      throw new Error("Company ID is required");
    }

    // Validate dữ liệu đầu vào
    const validationError = this.validateCompanyData(companyData);
    if (validationError) {
      throw new Error(validationError);
    }

    try {
      const updatedInfo = await this.repository.updateCompanyInfo(
        companyId,
        companyData
      );

      return this.transformCompanyInfo(updatedInfo);
    } catch (error) {
      console.error("Update company info service error:", error);
      throw this.handleError(error);
    }
  }

  // Cập nhật tên công ty
  async updateCompanyName(companyId, companyName) {
    if (!companyId) {
      throw new Error("Company ID is required");
    }

    if (!companyName || companyName.trim().length === 0) {
      throw new Error("Company name is required");
    }

    try {
      const updatedInfo = await this.repository.updateCompanyName(
        companyId,
        companyName.trim()
      );

      return this.transformCompanyInfo(updatedInfo);
    } catch (error) {
      console.error("Update company name service error:", error);
      throw this.handleError(error);
    }
  }

  // Upload logo công ty
  async uploadCompanyLogo(companyId, imageFile) {
    if (!companyId) {
      throw new Error("Company ID is required");
    }

    if (!imageFile) {
      throw new Error("Image file is required");
    }

    // Validate file type và size nếu cần
    const validationError = this.validateImageFile(imageFile);
    if (validationError) {
      throw new Error(validationError);
    }

    try {
      const result = await this.repository.uploadCompanyLogo(
        companyId,
        imageFile
      );

      return result;
    } catch (error) {
      console.error("Upload company logo service error:", error);
      throw this.handleError(error);
    }
  }

  // Validate dữ liệu công ty
  validateCompanyData(data) {
    const required = [
      "company_website",
      "company_size",
      "industry",
      "company_address",
      "contact_person",
      "description",
    ];

    for (const field of required) {
      if (!data[field] || data[field].toString().trim().length === 0) {
        return `${field.replace(/_/g, " ")} is required`;
      }
    }

    // Validate email format trong contact_person nếu có
    if (data.contact_person && data.contact_person.includes("@")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.contact_person)) {
        return "Invalid email format in contact person";
      }
    }

    // Validate website URL
    if (data.company_website) {
      try {
        new URL(data.company_website);
      } catch {
        return "Invalid website URL format";
      }
    }

    return null;
  }

  // Validate image file
  validateImageFile(imageFile) {
    // Kiểm tra type nếu có
    if (imageFile.type && !imageFile.type.startsWith("image/")) {
      return "File must be an image";
    }

    // Kiểm tra size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size && imageFile.size > maxSize) {
      return "Image file must be less than 5MB";
    }

    return null;
  }

  // Transform company info cho UI
  transformCompanyInfo(companyInfo) {
    if (!companyInfo) return null;

    return {
      id: companyInfo.user_id,
      name: companyInfo.company_name || "Chưa cập nhật",
      code: companyInfo.tax_code || "N/A",
      employees: companyInfo.company_size || "Chưa cập nhật",
      logo: companyInfo.company_logo || null,
      address: companyInfo.company_address || "Chưa cập nhật",
      website: companyInfo.company_website || "Chưa cập nhật",
      description: companyInfo.description || "Chưa có mô tả",
      industry: companyInfo.industry || "Chưa cập nhật",
      contactPerson: companyInfo.contact_person || "Chưa cập nhật",
      isVerified: companyInfo.isverified || false,
      createdAt: companyInfo.created_at,
      updatedAt: companyInfo.updated_at,
    };
  }

  // Handle errors
  handleError(error) {
    if (error.response) {
      // HTTP error response
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          return new Error(data.error || "Invalid request data");
        case 401:
          return new Error("Unauthorized access");
        case 403:
          return new Error("Access forbidden");
        case 404:
          return new Error("Company not found");
        case 500:
          return new Error("Server error, please try again later");
        default:
          return new Error(data.error || "An error occurred");
      }
    }

    // Network hoặc other errors
    if (error.message.includes("timeout")) {
      return new Error("Request timeout, please check your connection");
    }

    if (error.message.includes("Network")) {
      return new Error("Network error, please check your connection");
    }

    return error;
  }
}

export default new EmployerBusinessService();

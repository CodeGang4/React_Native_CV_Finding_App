import employerJobRepository from "../../repositories/EmployerJobRepository.js";

/**
 * Employer Job Business Service - Handles job business logic
 */
export class EmployerJobBusinessService {
  constructor() {
    this.repository = employerJobRepository;
  }

  // Lấy jobs của company với validation
  async getCompanyJobs(companyId, forceRefresh = false) {
    if (!companyId) {
      throw new Error("Company ID is required");
    }

    try {
      const jobsData = await this.repository.getJobsByCompanyId(
        companyId,
        forceRefresh
      );

      // Transform dữ liệu cho UI
      const transformedJobs = Array.isArray(jobsData)
        ? jobsData.map((job) => this.repository.transformJobData(job))
        : [];

      return transformedJobs.filter((job) => job !== null);
    } catch (error) {
      console.error("Get company jobs service error:", error);
      throw this.handleError(error);
    }
  }

  // Lấy chi tiết job
  async getJobDetails(jobId) {
    if (!jobId) {
      throw new Error("Job ID is required");
    }

    try {
      const jobData = await this.repository.getJobById(jobId);
      return this.repository.transformJobData(jobData);
    } catch (error) {
      console.error("Get job details service error:", error);
      throw this.handleError(error);
    }
  }

  // Tạo job mới với validation
  async createJob(companyId, jobData) {
    if (!companyId) {
      throw new Error("Company ID is required");
    }

    // Validate dữ liệu đầu vào
    const validationError = this.validateJobData(jobData);
    if (validationError) {
      throw new Error(validationError);
    }

    try {
      // Transform data cho API
      const apiJobData = this.repository.transformJobDataToAPI(jobData);

      const createdJobData = await this.repository.createJob(
        apiJobData,
        companyId
      );

      // Return transformed data cho UI
      if (createdJobData && createdJobData[0]) {
        return this.repository.transformJobData(createdJobData[0]);
      }

      return null;
    } catch (error) {
      console.error("Create job service error:", error);
      throw this.handleError(error);
    }
  }

  // Cập nhật job với validation
  async updateJob(jobId, jobData) {
    if (!jobId) {
      throw new Error("Job ID is required");
    }

    // Validate dữ liệu đầu vào
    const validationError = this.validateJobData(jobData);
    if (validationError) {
      throw new Error(validationError);
    }

    try {
      // Transform data cho API
      const apiJobData = this.repository.transformJobDataToAPI(jobData);

      const updatedJobData = await this.repository.updateJob(jobId, apiJobData);

      return this.repository.transformJobData(updatedJobData);
    } catch (error) {
      console.error("Update job service error:", error);
      throw this.handleError(error);
    }
  }

  // Xóa job
  async deleteJob(jobId, companyId = null) {
    if (!jobId) {
      throw new Error("Job ID is required");
    }

    try {
      await this.repository.deleteJob(jobId, companyId);
      return { success: true, message: "Job deleted successfully" };
    } catch (error) {
      console.error("Delete job service error:", error);
      throw this.handleError(error);
    }
  }

  // Validate job data
  validateJobData(jobData) {
    const requiredFields = [
      "title",
      "description",
      "location",
      "jobType",
      "salary",
      "quantity",
      "position",
      "education",
      "deadline",
    ];

    for (const field of requiredFields) {
      if (!jobData[field] || jobData[field].toString().trim().length === 0) {
        return `${this.getFieldDisplayName(field)} is required`;
      }
    }

    // Validate salary format (có thể là số hoặc text như "10-15 triệu")
    if (
      jobData.salary &&
      typeof jobData.salary === "string" &&
      jobData.salary.length > 100
    ) {
      return "Salary description is too long";
    }

    // Validate quantity
    if (jobData.quantity && (isNaN(jobData.quantity) || jobData.quantity < 1)) {
      return "Quantity must be a positive number";
    }

    // Validate deadline
    if (jobData.deadline) {
      const deadlineDate = new Date(jobData.deadline);
      const today = new Date();
      if (deadlineDate <= today) {
        return "Deadline must be in the future";
      }
    }

    // Validate job type
    const validJobTypes = [
      "Toàn thời gian",
      "Bán thời gian",
      "Thực tập",
      "Freelance",
    ];
    if (jobData.jobType && !validJobTypes.includes(jobData.jobType)) {
      return "Invalid job type";
    }

    return null;
  }

  // Get display name cho field validation
  getFieldDisplayName(fieldName) {
    const fieldMap = {
      title: "Job Title",
      description: "Job Description",
      location: "Location",
      jobType: "Job Type",
      salary: "Salary",
      quantity: "Quantity",
      position: "Position",
      education: "Education Requirement",
      deadline: "Application Deadline",
    };
    return fieldMap[fieldName] || fieldName;
  }

  // Generate job statistics
  generateJobStats(jobs) {
    if (!Array.isArray(jobs)) {
      return {
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        totalViews: 0,
      };
    }

    return {
      totalJobs: jobs.length,
      activeJobs: jobs.filter((job) => job.status === "Đang tuyển").length,
      totalApplications: jobs.reduce(
        (sum, job) => sum + (job.applications || 0),
        0
      ),
      totalViews: jobs.reduce((sum, job) => sum + (job.views || 0), 0),
      pendingApproval: jobs.filter((job) => job.status === "Chờ duyệt").length,
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
          return new Error(data.error || "Invalid job data");
        case 401:
          return new Error("Unauthorized access");
        case 403:
          return new Error("Access forbidden");
        case 404:
          return new Error("Job not found");
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

export default new EmployerJobBusinessService();

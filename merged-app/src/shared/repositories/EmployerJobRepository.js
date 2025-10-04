import BaseRepository from "./BaseRepository.js";
import apiClient from "../services/api/ApiClient.js";
import Constants from "expo-constants";

/**
 * Employer Job Repository - Handles employer job data operations with caching
 */
export class EmployerJobRepository extends BaseRepository {
  constructor() {
    super(apiClient);
    this.baseEndpoint = "/employer";
  }

  // Helper method để tạo request với correct base URL cho employer job endpoints
  async makeJobRequest(method, endpoint, data = null, config = {}) {
    const baseUrl =
      Constants.expoConfig?.extra?.API?.replace("/client", "") ||
      "http://localhost:3000";
    const fullUrl = `${baseUrl}${endpoint}`;

    const requestConfig = {
      ...config,
      url: fullUrl,
      method,
      ...(data && { data }),
    };

    return await apiClient.request(requestConfig);
  }

  // Lấy tất cả jobs (admin)
  async getAllJobs(forceRefresh = false) {
    const cacheKey = "all_jobs";

    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.makeJobRequest("GET", "/job/getJobs");

      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error("Get all jobs error:", error);
      throw error;
    }
  }

  // Lấy jobs theo company ID
  async getJobsByCompanyId(companyId, forceRefresh = false) {
    const cacheKey = `jobs_company_${companyId}`;

    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.makeJobRequest(
        "GET",
        `/job/getJobByCompanyId/${companyId}`
      );

      // Cache kết quả
      this.setCache(cacheKey, response.data);

      // Cache individual jobs
      if (Array.isArray(response.data)) {
        response.data.forEach((job) => {
          this.setCache(`job_${job.id}`, job);
        });
      }

      return response.data;
    } catch (error) {
      console.error(`Get jobs by company ${companyId} error:`, error);
      throw error;
    }
  }

  // Lấy chi tiết job theo ID
  async getJobById(jobId, forceRefresh = false) {
    const cacheKey = `job_${jobId}`;

    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.makeJobRequest(
        "GET",
        `/job/getJobDetail/${jobId}`
      );

      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Get job ${jobId} error:`, error);

      // Nếu job không tồn tại (đã bị xóa), clear cache và throw error cụ thể
      if (error.response?.status === 404) {
        this.clearCache(cacheKey);
        const jobNotFoundError = new Error(
          "Job not found - may have been deleted"
        );
        jobNotFoundError.code = "JOB_NOT_FOUND";
        throw jobNotFoundError;
      }

      throw error;
    }
  }

  // Tạo job mới
  async createJob(jobData, companyId) {
    try {
      // Nếu companyId không được truyền thì lấy từ context hoặc default
      if (!companyId) {
        throw new Error("Company ID is required");
      }

      console.log(`[API Request] POST /job/addJob/${companyId}`, jobData);

      const response = await this.makeJobRequest(
        "POST",
        `/job/addJob/${companyId}`,
        jobData
      );

      // Cache job mới
      if (response.data && response.data[0]) {
        const newJob = response.data[0];
        this.setCache(`job_${newJob.id}`, newJob);
      }

      // Clear company jobs cache để force refresh
      this.clearCache(`jobs_company_${companyId}`);

      return response.data;
    } catch (error) {
      console.error("Create job error:", error);
      throw error;
    }
  }

  // Cập nhật job
  async updateJob(jobId, jobData) {
    try {
      const response = await this.makeJobRequest(
        "PUT",
        `/job/updateJob/${jobId}`,
        jobData
      );

      // Cập nhật cache
      this.setCache(`job_${jobId}`, response.data);

      // Clear related cache
      if (response.data?.employer_id) {
        this.clearCache(`jobs_company_${response.data.employer_id}`);
      }

      return response.data;
    } catch (error) {
      console.error(`Update job ${jobId} error:`, error);
      throw error;
    }
  }

  // Xóa job (hard delete - xóa hoàn toàn khỏi database)
  async deleteJob(jobId, companyId = null) {
    try {
      const response = await this.makeJobRequest(
        "DELETE",
        `/job/deleteJob/${jobId}`,
        null,
        {
          skipErrorLog: true, // Flag để skip error log trong interceptor
          jobDeleteContext: true, // Thêm context để phân biệt
        }
      );

      // Xóa cache của job này
      this.clearCache(`job_${jobId}`);

      // Clear company jobs cache để force refresh danh sách
      if (companyId) {
        this.clearCache(`jobs_company_${companyId}`);
      }

      return response.data;
    } catch (error) {
      // Handle backend bug: nếu backend trả về 404 vì logic sai,
      // nhưng job thực sự đã bị xóa, coi như thành công
      if (error.response?.status === 404) {
        console.info(
          `✅ Job ${jobId} deleted successfully (backend returned 404 due to known logic issue)`
        );

        // Clear caches vì job đã bị xóa thật
        this.clearCache(`job_${jobId}`);
        if (companyId) {
          this.clearCache(`jobs_company_${companyId}`);
        }

        return { message: "Job deleted successfully" };
      }

      // Log các lỗi thật sự với context đủ để debug
      console.error(`❌ Delete job ${jobId} failed:`, {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        companyId,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  // Transform job data từ API format sang UI format
  transformJobData(jobData) {
    if (!jobData) return null;

    return {
      id: jobData.id,
      title: jobData.title,
      company: jobData.company_name || "N/A",
      salary: jobData.salary || "Thỏa thuận",
      location: jobData.location || "Không xác định",
      experience: jobData.experience || "Không yêu cầu",
      deadline: jobData.exprired_date
        ? new Date(jobData.exprired_date).toLocaleDateString("vi-VN")
        : "N/A",
      postedDate: jobData.created_at
        ? new Date(jobData.created_at).toLocaleDateString("vi-VN")
        : "N/A",
      status: jobData.isAccepted ? "Đang tuyển" : "Chờ duyệt",
      views: jobData.views || 0,
      applications: jobData.applications || 0,
      shortlisted: jobData.shortlisted || 0,
      rejected: jobData.rejected || 0,
      pending: jobData.pending || 0,
      jobType: this.mapJobType(jobData.job_type),
      description: jobData.description || "",
      requirements: Array.isArray(jobData.requirements)
        ? jobData.requirements
        : jobData.requirements
        ? [jobData.requirements]
        : [],
      benefits: jobData.benefits || [],
      skills: jobData.skills || [],
      workLocation: jobData.location || "",
      workTime: jobData.work_time || "Thứ 2 - Thứ 6: 8:00 - 17:30",
      quantity: jobData.quantity || 1,
      position: jobData.position || "Nhân viên",
      education: jobData.education || "Không yêu cầu",
      employerId: jobData.employer_id,
    };
  }

  // Transform UI format sang API format
  transformJobDataToAPI(jobData) {
    return {
      title: jobData.title,
      description: jobData.description,
      requirements: Array.isArray(jobData.requirements)
        ? jobData.requirements.join("\n")
        : jobData.requirements,
      location: jobData.location || jobData.workLocation,
      job_type: this.mapJobTypeToAPI(jobData.jobType),
      salary: jobData.salary,
      quantity: jobData.quantity || 1,
      position: jobData.position,
      education: jobData.education,
      exprired_date: jobData.deadline
        ? new Date(jobData.deadline).toISOString()
        : null,
      isAccepted:
        jobData.status === "Đang tuyển" || jobData.isAccepted === true,
    };
  }

  // Map job type từ API sang UI
  mapJobType(apiJobType) {
    const typeMap = {
      fulltime: "Toàn thời gian",
      parttime: "Bán thời gian",
      internship: "Thực tập",
      freelance: "Freelance",
    };
    return typeMap[apiJobType] || "Toàn thời gian";
  }

  // Map job type từ UI sang API
  mapJobTypeToAPI(uiJobType) {
    const typeMap = {
      "Toàn thời gian": "fulltime",
      "Bán thời gian": "parttime",
      "Thực tập": "internship",
      Freelance: "freelance",
    };
    return typeMap[uiJobType] || "fulltime";
  }

  // Xóa cache jobs khi cần
  clearJobsCache(companyId = null) {
    if (companyId) {
      this.clearCache(`jobs_company_${companyId}`);
    } else {
      this.clearCache("all_jobs");
      this.clearCache("jobs_company_");
      this.clearCache("job_");
    }
  }
}

export default new EmployerJobRepository();

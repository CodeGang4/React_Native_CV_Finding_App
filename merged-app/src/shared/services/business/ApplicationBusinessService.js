import applicationRepository from "../../repositories/ApplicationRepository.js";
import jobRepository from "../../repositories/JobRepository.js";
import JobNotificationHelper from "../../utils/JobNotificationHelper.js";

/**
 * Application Business Service - Handles application business logic
 */
export class ApplicationBusinessService {
  constructor() {
    this.repository = applicationRepository;
    this.jobRepository = jobRepository;
  }

  // Apply job với auto notification
  async applyToJob(jobId, applicationData, candidateInfo = {}) {
    try {
      console.log('Processing job application...', { jobId, candidateId: candidateInfo.id });

      // Gọi API apply job
      const result = await this.jobRepository.applyToJob(jobId, applicationData);

      // AUTO: Gửi thông báo cho employer khi có ứng viên mới apply
      if (result && candidateInfo.id) {
        try {
          // Lấy thông tin job để có employer_id và job_title
          const job = await this.jobRepository.getJobById(jobId);
          
          if (job && job.employer_id) {
            await JobNotificationHelper.autoNotifyJobApplication(
              job.employer_id,
              candidateInfo.name || 'Ứng viên mới',
              job.title || 'Vị trí tuyển dụng',
              {
                application_id: result.id || result.application_id,
                candidate_id: candidateInfo.id,
                job_id: jobId,
                applied_at: new Date().toISOString()
              }
            );
            console.log(' [AUTO] Job application notification sent to employer:', job.employer_id);
          }
        } catch (notifError) {
          console.error(' [AUTO] Failed to send job application notification:', notifError);
          // Không throw error để không ảnh hưởng tới việc apply job chính
        }
      }

      return result;
    } catch (error) {
      console.error("Apply to job business logic error:", error);
      throw new Error("Không thể nộp đơn ứng tuyển. Vui lòng thử lại");
    }
  }

  // Lấy danh sách ứng viên cho job
  async getCandidatesByJobId(jobId, forceRefresh = false) {
    try {
      if (!jobId) {
        throw new Error("Job ID is required");
      }

      const candidates = await this.repository.getCandidatesByJobId(
        jobId,
        forceRefresh
      );

      // Validate và format data
      return this.validateAndFormatCandidates(candidates);
    } catch (error) {
      console.error("Get candidates business logic error:", error);

      // Provide user-friendly error messages
      if (error.message?.includes("404")) {
        throw new Error("Không tìm thấy thông tin ứng tuyển cho công việc này");
      } else if (error.message?.includes("network")) {
        throw new Error("Lỗi kết nối mạng. Vui lòng thử lại");
      }

      throw new Error("Không thể tải danh sách ứng viên. Vui lòng thử lại");
    }
  }

  // Validate và format candidates data
  validateAndFormatCandidates(candidates) {
    if (!Array.isArray(candidates)) {
      return [];
    }

    return candidates
      .filter((candidate) => candidate.id) // Chỉ lấy candidates có ID
      .map((candidate) => ({
        ...candidate,
        // Đảm bảo có các field cần thiết
        name: candidate.name || "Ứng viên ẩn danh",
        email: candidate.email || "N/A",
        phone: candidate.phone || "N/A",
        experience: candidate.experience || "Chưa có thông tin",
        rating: Math.max(0, Math.min(5, candidate.rating || 0)), // Giới hạn rating 0-5
        appliedDate: candidate.appliedDate || "N/A",
        status: candidate.status || "pending",
      }))
      .sort((a, b) => {
        // Sắp xếp theo thứ tự: shortlisted -> pending -> rejected
        const statusOrder = { shortlisted: 0, pending: 1, rejected: 2 };
        const aOrder = statusOrder[a.status] ?? 3;
        const bOrder = statusOrder[b.status] ?? 3;

        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }

        // Nếu cùng status, sắp xếp theo ngày apply (mới nhất trước)
        return new Date(b.appliedDate) - new Date(a.appliedDate);
      });
  }

  // Tính toán thống kê ứng viên
  generateCandidateStats(candidates) {
    if (!Array.isArray(candidates)) {
      return {
        total: 0,
        pending: 0,
        shortlisted: 0,
        rejected: 0,
      };
    }

    return {
      total: candidates.length,
      pending: candidates.filter((c) => c.status === "pending").length,
      shortlisted: candidates.filter((c) => c.status === "shortlisted").length,
      rejected: candidates.filter((c) => c.status === "rejected").length,
    };
  }

  // Cập nhật trạng thái ứng viên
  async updateCandidateStatus(applicationId, status, jobId, candidateData = {}) {
    try {
      if (!applicationId || !status) {
        throw new Error("Application ID and status are required");
      }

      // Validate status (dựa theo schema database)
      const validStatuses = ["pending", "reviewed", "accepted", "rejected"];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
      }

      await this.repository.updateApplicationStatus(applicationId, status);

      // AUTO: Gửi thông báo trạng thái ứng tuyển cho candidate
      if (candidateData.candidateId && candidateData.jobTitle) {
        try {
          await JobNotificationHelper.autoNotifyApplicationStatus(
            candidateData.candidateId,
            status,
            candidateData.jobTitle,
            {
              application_id: applicationId,
              job_id: jobId,
              updated_at: new Date().toISOString()
            }
          );
          console.log(' [AUTO] Application status notification sent for status:', status);
        } catch (notifError) {
          console.error(' [AUTO] Failed to send application status notification:', notifError);
          // Không throw error để không ảnh hưởng tới việc cập nhật status chính
        }
      }

      // Clear cache để refresh data
      if (jobId) {
        this.repository.clearJobCandidatesCache(jobId);
      }

      return { success: true };
    } catch (error) {
      console.error("Update candidate status error:", error);
      throw new Error("Không thể cập nhật trạng thái ứng viên");
    }
  }

  // Refresh candidates data
  async refreshCandidates(jobId) {
    try {
      return await this.getCandidatesByJobId(jobId, true);
    } catch (error) {
      console.error("Refresh candidates error:", error);
      throw error;
    }
  }

  // Lấy thống kê applications cho một employer
  async getApplicationStatsForEmployer(jobs, forceRefresh = false) {
    try {
      if (!Array.isArray(jobs) || jobs.length === 0) {
        return {
          totalApplications: 0,
          applicationsByJob: {},
        };
      }

      // Lấy job IDs
      const jobIds = jobs.map((job) => job.id).filter(Boolean);

      if (jobIds.length === 0) {
        return {
          totalApplications: 0,
          applicationsByJob: {},
        };
      }

      // Lấy application counts với rate limiting protection
      console.log(`Getting application stats for ${jobIds.length} jobs`);
      const result = await this.repository.getApplicationCountByJobIds(
        jobIds,
        forceRefresh
      );

      console.log("Application stats result:", {
        total: result.totalApplications,
        jobCounts: Object.keys(result.applicationCounts || {}).length,
      });

      return {
        totalApplications: result.totalApplications || 0,
        applicationsByJob: result.applicationCounts || {},
      };
    } catch (error) {
      console.error("Get application stats for employer error:", error);
      return {
        totalApplications: 0,
        applicationsByJob: {},
      };
    }
  }

  // Update job data với application counts
  async enrichJobsWithApplicationCounts(jobs, forceRefresh = false) {
    try {
      // Nếu không có jobs thì return ngay
      if (!Array.isArray(jobs) || jobs.length === 0) {
        return [];
      }

      console.log(`Enriching ${jobs.length} jobs with application counts`);

      const stats = await this.getApplicationStatsForEmployer(
        jobs,
        forceRefresh
      );

      const enrichedJobs = jobs.map((job) => ({
        ...job,
        applications: stats.applicationsByJob[job.id] || 0,
      }));

      console.log(
        " Enrichment completed. Application counts:",
        enrichedJobs.map((job) => ({
          id: job.id,
          applications: job.applications,
        }))
      );

      return enrichedJobs;
    } catch (error) {
      console.error("Enrich jobs with application counts error:", error);

      // Kiểm tra nếu là rate limit error
      if (
        error.message?.includes("429") ||
        error.message?.includes("Too Many Requests")
      ) {
        console.warn(" Rate limited - returning jobs with 0 applications");
        throw error; // Re-throw để outer catch xử lý
      }

      // Return jobs with 0 applications if error
      return jobs.map((job) => ({
        ...job,
        applications: 0,
      }));
    }
  }

  // Lấy thống kê với unique candidates (không trùng lặp ứng viên)
  async getUniqueApplicationStatsForEmployer(jobs, forceRefresh = false) {
    try {
      if (!Array.isArray(jobs) || jobs.length === 0) {
        return {
          totalApplications: 0,
          totalUniqueCandidates: 0,
          applicationsByJob: {},
        };
      }

      // Lấy job IDs
      const jobIds = jobs.map((job) => job.id).filter(Boolean);

      if (jobIds.length === 0) {
        return {
          totalApplications: 0,
          totalUniqueCandidates: 0,
          applicationsByJob: {},
        };
      }

      // Lấy unique candidate counts
      const result = await this.repository.getUniqueCandidateCountByJobIds(
        jobIds,
        forceRefresh
      );

      return {
        totalApplications: result.totalApplications || 0,
        totalUniqueCandidates: result.totalUniqueCandidates || 0,
        applicationsByJob: result.applicationCounts || {},
        uniqueCandidateIds: result.uniqueCandidateIds || [],
      };
    } catch (error) {
      console.error("Get unique application stats for employer error:", error);
      return {
        totalApplications: 0,
        totalUniqueCandidates: 0,
        applicationsByJob: {},
        uniqueCandidateIds: [],
      };
    }
  }
}

export default new ApplicationBusinessService();

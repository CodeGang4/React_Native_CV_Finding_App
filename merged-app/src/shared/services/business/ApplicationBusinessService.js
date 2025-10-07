import applicationRepository from "../../repositories/ApplicationRepository.js";

/**
 * Application Business Service - Handles application business logic
 */
export class ApplicationBusinessService {
  constructor() {
    this.repository = applicationRepository;
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
  async updateCandidateStatus(applicationId, status, jobId) {
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
}

export default new ApplicationBusinessService();

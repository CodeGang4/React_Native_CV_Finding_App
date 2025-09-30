/**
 * Job Validator - Validation rules for job entities
 */

export class JobValidator {
  static validateJobData(jobData) {
    const errors = {};

    // Required fields
    if (!jobData.title || jobData.title.trim().length === 0) {
      errors.title = "Tiêu đề công việc không được để trống";
    } else if (jobData.title.length < 5) {
      errors.title = "Tiêu đề công việc phải có ít nhất 5 ký tự";
    } else if (jobData.title.length > 100) {
      errors.title = "Tiêu đề công việc không được vượt quá 100 ký tự";
    }

    if (!jobData.description || jobData.description.trim().length === 0) {
      errors.description = "Mô tả công việc không được để trống";
    } else if (jobData.description.length < 50) {
      errors.description = "Mô tả công việc phải có ít nhất 50 ký tự";
    }

    if (!jobData.location || jobData.location.trim().length === 0) {
      errors.location = "Địa điểm làm việc không được để trống";
    }

    if (!jobData.companyId) {
      errors.companyId = "Thông tin công ty không được để trống";
    }

    // Job type validation
    const validJobTypes = ["full-time", "part-time", "contract", "internship"];
    if (jobData.jobType && !validJobTypes.includes(jobData.jobType)) {
      errors.jobType = "Loại công việc không hợp lệ";
    }

    // Level validation
    const validLevels = ["junior", "mid", "senior", "all"];
    if (jobData.level && !validLevels.includes(jobData.level)) {
      errors.level = "Cấp độ công việc không hợp lệ";
    }

    // Salary validation
    if (jobData.salaryMin && jobData.salaryMax) {
      if (jobData.salaryMin >= jobData.salaryMax) {
        errors.salary = "Mức lương tối thiểu phải nhỏ hơn mức lương tối đa";
      }
      if (jobData.salaryMin < 0 || jobData.salaryMax < 0) {
        errors.salary = "Mức lương không được âm";
      }
    }

    // Deadline validation
    if (jobData.deadline) {
      const deadline = new Date(jobData.deadline);
      const today = new Date();
      if (deadline <= today) {
        errors.deadline = "Hạn ứng tuyển phải sau ngày hiện tại";
      }
    }

    // Skills validation
    if (jobData.skills && !Array.isArray(jobData.skills)) {
      errors.skills = "Kỹ năng phải là một danh sách";
    } else if (jobData.skills && jobData.skills.length === 0) {
      errors.skills = "Vui lòng thêm ít nhất 1 kỹ năng yêu cầu";
    }

    // Requirements validation
    if (jobData.requirements && !Array.isArray(jobData.requirements)) {
      errors.requirements = "Yêu cầu phải là một danh sách";
    }

    // Benefits validation
    if (jobData.benefits && !Array.isArray(jobData.benefits)) {
      errors.benefits = "Phúc lợi phải là một danh sách";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static validateJobUpdate(jobData, existingJob) {
    const validation = this.validateJobData(jobData);

    // Additional validation for updates
    if (existingJob && existingJob.applications > 0) {
      // Don't allow major changes if job has applications
      const majorFields = [
        "title",
        "location",
        "jobType",
        "salaryMin",
        "salaryMax",
      ];
      const warnings = {};

      majorFields.forEach((field) => {
        if (jobData[field] !== existingJob[field]) {
          warnings[field] =
            "Thay đổi thông tin này có thể ảnh hưởng đến ứng viên đã ứng tuyển";
        }
      });

      if (Object.keys(warnings).length > 0) {
        validation.warnings = warnings;
      }
    }

    return validation;
  }

  static validateJobStatus(status) {
    const validStatuses = ["active", "paused", "closed", "draft"];
    return validStatuses.includes(status);
  }

  static validateJobPriority(priority) {
    const validPriorities = ["normal", "urgent", "featured"];
    return validPriorities.includes(priority);
  }

  // Business rule validations
  static validateJobBusinessRules(jobData) {
    const warnings = {};

    // Warn if salary is too low for the level
    if (jobData.level && jobData.salaryMin) {
      const minSalaryByLevel = {
        junior: 5000000, // 5 triệu
        mid: 15000000, // 15 triệu
        senior: 25000000, // 25 triệu
      };

      const expectedMin = minSalaryByLevel[jobData.level];
      if (expectedMin && jobData.salaryMin < expectedMin) {
        warnings.salary = `Mức lương có thể thấp so với cấp độ ${jobData.level}`;
      }
    }

    // Warn if too many requirements for junior position
    if (
      jobData.level === "junior" &&
      jobData.requirements &&
      jobData.requirements.length > 5
    ) {
      warnings.requirements =
        "Quá nhiều yêu cầu có thể khó tìm được ứng viên junior phù hợp";
    }

    // Warn if deadline is too close
    if (jobData.deadline) {
      const deadline = new Date(jobData.deadline);
      const today = new Date();
      const daysUntilDeadline = Math.ceil(
        (deadline - today) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilDeadline < 7) {
        warnings.deadline =
          "Hạn ứng tuyển quá gần, có thể ít ứng viên quan tâm";
      }
    }

    return {
      hasWarnings: Object.keys(warnings).length > 0,
      warnings,
    };
  }
}

export default JobValidator;

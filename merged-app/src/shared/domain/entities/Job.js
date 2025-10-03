/**
 * Job Entity - Đại diện cho tin tuyển dụng
 */
export class Job {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || "";
    this.description = data.description || "";
    this.requirements = data.requirements || [];
    this.benefits = data.benefits || [];
    this.skills = data.skills || [];
    this.salary = data.salary || "";
    this.salaryMin = data.salaryMin || null;
    this.salaryMax = data.salaryMax || null;
    this.currency = data.currency || "VND";
    this.location = data.location || "";
    this.workLocation = data.workLocation || "";
    this.workTime = data.workTime || "";
    this.jobType = data.jobType || "full-time"; // 'full-time', 'part-time', 'contract', 'internship'
    this.level = data.level || "all"; // 'junior', 'mid', 'senior', 'all'
    this.experience = data.experience || "";
    this.education = data.education || "";
    this.deadline = data.deadline || null;
    this.status = data.status || "active"; // 'active', 'paused', 'closed', 'draft'
    this.priority = data.priority || "normal"; // 'normal', 'urgent', 'featured'
    this.companyId = data.companyId || null;
    this.company = data.company || "";
    this.employerId = data.employerId || null;
    this.views = data.views || 0;
    this.applications = data.applications || 0;
    this.shortlisted = data.shortlisted || 0;
    this.rejected = data.rejected || 0;
    this.pending = data.pending || 0;
    this.hired = data.hired || 0;
    this.postedDate = data.postedDate || new Date();
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Getters
  get isActive() {
    return this.status === "active";
  }

  get isPaused() {
    return this.status === "paused";
  }

  get isClosed() {
    return this.status === "closed";
  }

  get isDraft() {
    return this.status === "draft";
  }

  get isExpired() {
    if (!this.deadline) return false;
    return new Date() > new Date(this.deadline);
  }

  get isUrgent() {
    return this.priority === "urgent";
  }

  get isFeatured() {
    return this.priority === "featured";
  }

  get totalCandidates() {
    return this.applications + this.shortlisted + this.rejected + this.pending;
  }

  get applicationRate() {
    return this.views > 0
      ? ((this.applications / this.views) * 100).toFixed(1)
      : 0;
  }

  get displaySalary() {
    if (this.salaryMin && this.salaryMax) {
      return `${this.formatSalary(this.salaryMin)} - ${this.formatSalary(
        this.salaryMax
      )}`;
    }
    return this.salary || "Thỏa thuận";
  }

  get displayJobType() {
    const typeMap = {
      "full-time": "Toàn thời gian",
      "part-time": "Bán thời gian",
      contract: "Hợp đồng",
      internship: "Thực tập",
    };
    return typeMap[this.jobType] || this.jobType;
  }

  get displayLevel() {
    const levelMap = {
      junior: "Junior",
      mid: "Middle",
      senior: "Senior",
      all: "Tất cả cấp độ",
    };
    return levelMap[this.level] || this.level;
  }

  // Methods
  formatSalary(amount) {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} triệu`;
    }
    return amount.toLocaleString();
  }

  updateInfo(data) {
    Object.assign(this, {
      ...data,
      updatedAt: new Date(),
    });
  }

  addSkill(skill) {
    if (!this.skills.includes(skill)) {
      this.skills.push(skill);
    }
  }

  removeSkill(skill) {
    this.skills = this.skills.filter((s) => s !== skill);
  }

  addRequirement(requirement) {
    if (!this.requirements.includes(requirement)) {
      this.requirements.push(requirement);
    }
  }

  addBenefit(benefit) {
    if (!this.benefits.includes(benefit)) {
      this.benefits.push(benefit);
    }
  }

  incrementViews() {
    this.views += 1;
  }

  incrementApplications() {
    this.applications += 1;
  }

  changeStatus(newStatus) {
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  // Validation
  isValid() {
    return this.title && this.description && this.location && this.companyId;
  }

  // Serialization
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      requirements: this.requirements,
      benefits: this.benefits,
      skills: this.skills,
      salary: this.salary,
      salaryMin: this.salaryMin,
      salaryMax: this.salaryMax,
      currency: this.currency,
      location: this.location,
      workLocation: this.workLocation,
      workTime: this.workTime,
      jobType: this.jobType,
      level: this.level,
      experience: this.experience,
      education: this.education,
      deadline: this.deadline,
      status: this.status,
      priority: this.priority,
      companyId: this.companyId,
      company: this.company,
      employerId: this.employerId,
      views: this.views,
      applications: this.applications,
      shortlisted: this.shortlisted,
      rejected: this.rejected,
      pending: this.pending,
      hired: this.hired,
      postedDate: this.postedDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromJSON(data) {
    return new Job(data);
  }
}

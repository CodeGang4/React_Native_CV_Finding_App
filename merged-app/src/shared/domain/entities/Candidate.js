/**
 * Candidate Entity - Đại diện cho ứng viên
 */
export class Candidate {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || "";
    this.email = data.email || "";
    this.phone = data.phone || "";
    this.avatar = data.avatar || null;
    this.title = data.title || ""; // Job title/position
    this.summary = data.summary || "";
    this.level = data.level || "junior"; // 'junior', 'mid', 'senior'
    this.experience = data.experience || "";
    this.skills = data.skills || [];
    this.education = data.education || [];
    this.certifications = data.certifications || [];
    this.workHistory = data.workHistory || [];
    this.projects = data.projects || [];
    this.languages = data.languages || [];
    this.location = data.location || "";
    this.preferredLocations = data.preferredLocations || [];
    this.salaryExpectation = data.salaryExpectation || "";
    this.salaryMin = data.salaryMin || null;
    this.salaryMax = data.salaryMax || null;
    this.availableDate = data.availableDate || null;
    this.jobType = data.jobType || "full-time";
    this.cvUrl = data.cvUrl || data.cv || null;
    this.portfolioUrl = data.portfolioUrl || null;
    this.linkedinUrl = data.linkedinUrl || null;
    this.githubUrl = data.githubUrl || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.isAvailable = data.isAvailable !== undefined ? data.isAvailable : true;
    this.rating = data.rating || 0;
    this.reviewCount = data.reviewCount || 0;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();

    // AI scoring fields (temporary, from current implementation)
    this.__score = data.__score || 0;
    this.__reasons = data.__reasons || [];
    this.__sim = data.__sim || 0;
    this.__overlap = data.__overlap || [];
  }

  // Getters
  get displayName() {
    return this.name || this.email;
  }

  get displayLevel() {
    const levelMap = {
      junior: "Junior",
      mid: "Middle",
      senior: "Senior",
    };
    return levelMap[this.level] || this.level;
  }

  get displaySalary() {
    if (this.salaryMin && this.salaryMax) {
      return `${this.formatSalary(this.salaryMin)} - ${this.formatSalary(
        this.salaryMax
      )}`;
    }
    return this.salaryExpectation || "Thỏa thuận";
  }

  get yearsOfExperience() {
    // Extract years from experience string like "3 năm"
    const match = this.experience.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  get hasCV() {
    return !!this.cvUrl;
  }

  get hasPortfolio() {
    return !!this.portfolioUrl;
  }

  get topSkills() {
    return this.skills.slice(0, 5);
  }

  get averageRating() {
    return Math.round(this.rating * 10) / 10;
  }

  // Methods
  formatSalary(amount) {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} triệu`;
    }
    return amount.toLocaleString();
  }

  updateProfile(data) {
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

  addEducation(education) {
    this.education.push({
      id: Date.now(),
      ...education,
      createdAt: new Date(),
    });
  }

  addWorkHistory(work) {
    this.workHistory.push({
      id: Date.now(),
      ...work,
      createdAt: new Date(),
    });
  }

  addProject(project) {
    this.projects.push({
      id: Date.now(),
      ...project,
      createdAt: new Date(),
    });
  }

  // Skill matching utility
  hasSkill(skill) {
    return this.skills.some((s) =>
      s.toLowerCase().includes(skill.toLowerCase())
    );
  }

  matchesSkills(requiredSkills) {
    if (!requiredSkills || requiredSkills.length === 0) return true;
    return requiredSkills.some((skill) => this.hasSkill(skill));
  }

  // Level matching
  matchesLevel(requiredLevel) {
    if (!requiredLevel || requiredLevel === "all") return true;
    return this.level === requiredLevel;
  }

  // Location matching
  matchesLocation(requiredLocation) {
    if (!requiredLocation) return true;
    return (
      this.location.toLowerCase().includes(requiredLocation.toLowerCase()) ||
      this.preferredLocations.some((loc) =>
        loc.toLowerCase().includes(requiredLocation.toLowerCase())
      )
    );
  }

  // Validation
  isValid() {
    return this.name && this.email && this.title;
  }

  // Serialization
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      avatar: this.avatar,
      title: this.title,
      summary: this.summary,
      level: this.level,
      experience: this.experience,
      skills: this.skills,
      education: this.education,
      certifications: this.certifications,
      workHistory: this.workHistory,
      projects: this.projects,
      languages: this.languages,
      location: this.location,
      preferredLocations: this.preferredLocations,
      salaryExpectation: this.salaryExpectation,
      salaryMin: this.salaryMin,
      salaryMax: this.salaryMax,
      availableDate: this.availableDate,
      jobType: this.jobType,
      cvUrl: this.cvUrl,
      portfolioUrl: this.portfolioUrl,
      linkedinUrl: this.linkedinUrl,
      githubUrl: this.githubUrl,
      isActive: this.isActive,
      isAvailable: this.isAvailable,
      rating: this.rating,
      reviewCount: this.reviewCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromJSON(data) {
    if (!data) return new Candidate();

    // Map backend data structure to frontend entity
    const mappedData = {
      id: data.id,
      name: data.name || data.full_name || "",
      email: data.email || "",
      phone: data.phone || "",
      avatar: data.avatar || data.portfolio || null,
      title: data.title || "Developer", // Default title
      summary: data.summary || "",
      level: data.level || "junior",
      experience: data.experience || "",
      skills: Array.isArray(data.skills)
        ? data.skills
        : typeof data.skills === "string"
        ? data.skills.split(",").map((s) => s.trim())
        : [],
      education: Array.isArray(data.education)
        ? data.education
        : typeof data.education === "string"
        ? [data.education]
        : [],
      workHistory: data.work_history || data.workHistory || [],
      projects: data.projects || [],
      languages: data.languages || [],
      location: data.address || data.location || "",
      salaryExpectation:
        data.salary_expectation || data.salaryExpectation || "",
      availableDate: data.available_date || data.availableDate || null,
      jobType: data.job_type || data.jobType || "full-time",
      cvUrl: data.cv_url || data.cvUrl || null,
      portfolioUrl: data.portfolio || data.portfolioUrl || null,
      isActive: data.is_active !== undefined ? data.is_active : true,
      isAvailable: data.is_available !== undefined ? data.is_available : true,
      rating: data.rating || 0,
      createdAt: data.created_at || data.createdAt || new Date(),
      updatedAt: data.updated_at || data.updatedAt || new Date(),

      // Additional backend fields
      userId: data.user_id || data.userId,
      dateOfBirth: data.date_of_birth || data.dateOfBirth,
      gender: data.gender,
      jobPreferences: Array.isArray(data.job_preferences)
        ? data.job_preferences
        : typeof data.job_preferences === "string"
        ? data.job_preferences.split(",").map((s) => s.trim())
        : [],
    };

    return new Candidate(mappedData);
  }
}

/**
 * EmailTemplate Entity - Đại diện cho mẫu email
 */
export class EmailTemplate {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || "";
    this.type = data.type || "interview"; // 'interview', 'rejection', 'offer', 'reminder'
    this.subject = data.subject || "";
    this.content = data.content || "";
    this.variables = data.variables || [];
    this.isDefault = data.isDefault || false;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.employerId = data.employerId || null;
    this.companyId = data.companyId || null;
    this.category = data.category || "general";
    this.language = data.language || "vi";
    this.tags = data.tags || [];
    this.usageCount = data.usageCount || 0;
    this.lastUsed = data.lastUsed || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.uploadDate = data.uploadDate || this.createdAt; // For backward compatibility
  }

  // Getters
  get displayType() {
    const typeMap = {
      interview: "Mời phỏng vấn",
      rejection: "Từ chối ứng viên",
      offer: "Chào mời làm việc",
      reminder: "Nhắc nhở",
      general: "Tổng quát",
    };
    return typeMap[this.type] || this.type;
  }

  get isSystemTemplate() {
    return !this.employerId && !this.companyId;
  }

  get isCompanyTemplate() {
    return !!this.employerId || !!this.companyId;
  }

  get availableVariables() {
    // Default variables available for all templates
    const defaultVars = ["candidateName", "companyName", "jobTitle", "toEmail"];

    // Type-specific variables
    const typeVars = {
      interview: [
        "emailDateTime",
        "emailLocation",
        "emailDuration",
        "meetingUrl",
        "interviewType",
      ],
      offer: ["salary", "startDate", "position", "benefits"],
      rejection: ["applicationDate", "feedback"],
    };

    return [...defaultVars, ...(typeVars[this.type] || [])];
  }

  get previewText() {
    return (
      this.content.substring(0, 100) + (this.content.length > 100 ? "..." : "")
    );
  }

  // Methods
  updateContent(data) {
    Object.assign(this, {
      ...data,
      updatedAt: new Date(),
    });
  }

  processTemplate(variables = {}) {
    let processedSubject = this.subject;
    let processedContent = this.content;

    // Replace variables in both subject and content
    Object.keys(variables).forEach((key) => {
      const value = variables[key] || `{${key}}`;
      const regex = new RegExp(`\\{${key}\\}`, "g");
      processedSubject = processedSubject.replace(regex, value);
      processedContent = processedContent.replace(regex, value);
    });

    return {
      subject: processedSubject,
      content: processedContent,
    };
  }

  addVariable(variable) {
    if (!this.variables.includes(variable)) {
      this.variables.push(variable);
    }
  }

  removeVariable(variable) {
    this.variables = this.variables.filter((v) => v !== variable);
  }

  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  removeTag(tag) {
    this.tags = this.tags.filter((t) => t !== tag);
  }

  incrementUsage() {
    this.usageCount += 1;
    this.lastUsed = new Date();
    this.updatedAt = new Date();
  }

  activate() {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate() {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  clone(newName) {
    return new EmailTemplate({
      ...this.toJSON(),
      id: null,
      name: newName || `${this.name} (Copy)`,
      isDefault: false,
      usageCount: 0,
      lastUsed: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Validation
  isValid() {
    return this.name && this.subject && this.content && this.type;
  }

  hasRequiredVariables() {
    const requiredVars = ["candidateName", "companyName"];
    return requiredVars.every(
      (variable) =>
        this.content.includes(`{${variable}}`) ||
        this.subject.includes(`{${variable}}`)
    );
  }

  // Serialization
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      subject: this.subject,
      content: this.content,
      variables: this.variables,
      isDefault: this.isDefault,
      isActive: this.isActive,
      employerId: this.employerId,
      companyId: this.companyId,
      category: this.category,
      language: this.language,
      tags: this.tags,
      usageCount: this.usageCount,
      lastUsed: this.lastUsed,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      uploadDate: this.uploadDate,
    };
  }

  static fromJSON(data) {
    return new EmailTemplate(data);
  }

  // Static factory methods
  static createInterviewTemplate(companyName = "") {
    return new EmailTemplate({
      name: "Mẫu mời phỏng vấn",
      type: "interview",
      subject: "Thông báo lịch phỏng vấn - {jobTitle}",
      content: `Chào {candidateName},

Chúng tôi rất vui mừng thông báo rằng hồ sơ của bạn đã được chọn để tham gia vòng phỏng vấn cho vị trí {jobTitle} tại {companyName}.

Thông tin phỏng vấn:
- Thời gian: {emailDateTime}
- Địa điểm: {emailLocation}
- Thời lượng: {emailDuration}

Vui lòng xác nhận tham gia và chuẩn bị đầy đủ các tài liệu cần thiết.

Trân trọng,
{companyName}`,
      variables: [
        "candidateName",
        "jobTitle",
        "companyName",
        "emailDateTime",
        "emailLocation",
        "emailDuration",
      ],
    });
  }

  static createRejectionTemplate(companyName = "") {
    return new EmailTemplate({
      name: "Mẫu từ chối ứng viên",
      type: "rejection",
      subject: "Kết quả ứng tuyển - {jobTitle}",
      content: `Chào {candidateName},

Cảm ơn bạn đã quan tâm và ứng tuyển vị trí {jobTitle} tại {companyName}.

Sau khi xem xét kỹ lưỡng, chúng tôi rất tiếc phải thông báo rằng hồ sơ của bạn chưa phù hợp với yêu cầu của vị trí này tại thời điểm hiện tại.

Chúng tôi sẽ lưu giữ thông tin của bạn và liên hệ khi có cơ hội phù hợp trong tương lai.

Chúc bạn thành công!
{companyName}`,
      variables: ["candidateName", "jobTitle", "companyName"],
    });
  }
}

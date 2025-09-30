/**
 * Interview Entity - Đại diện cho cuộc phỏng vấn
 */
export class Interview {
  constructor(data = {}) {
    this.id = data.id || null;
    this.jobId = data.jobId || null;
    this.candidateId = data.candidateId || null;
    this.employerId = data.employerId || null;
    this.companyId = data.companyId || null;
    this.title = data.title || "";
    this.type = data.type || "online"; // 'online', 'offline', 'phone'
    this.status = data.status || "scheduled"; // 'scheduled', 'completed', 'cancelled', 'rescheduled'
    this.datetime = data.datetime || null;
    this.duration = data.duration || 60; // minutes
    this.location = data.location || "";
    this.meetingUrl = data.meetingUrl || "";
    this.description = data.description || "";
    this.notes = data.notes || "";
    this.interviewers = data.interviewers || [];
    this.questions = data.questions || [];
    this.feedback = data.feedback || null;
    this.rating = data.rating || null;
    this.result = data.result || null; // 'passed', 'failed', 'pending'
    this.nextSteps = data.nextSteps || "";
    this.attachments = data.attachments || [];
    this.reminders = data.reminders || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Getters
  get isScheduled() {
    return this.status === "scheduled";
  }

  get isCompleted() {
    return this.status === "completed";
  }

  get isCancelled() {
    return this.status === "cancelled";
  }

  get isRescheduled() {
    return this.status === "rescheduled";
  }

  get isOnline() {
    return this.type === "online";
  }

  get isOffline() {
    return this.type === "offline";
  }

  get displayType() {
    const typeMap = {
      online: "Trực tuyến",
      offline: "Tại văn phòng",
      phone: "Qua điện thoại",
    };
    return typeMap[this.type] || this.type;
  }

  get displayStatus() {
    const statusMap = {
      scheduled: "Đã lên lịch",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
      rescheduled: "Đã dời lịch",
    };
    return statusMap[this.status] || this.status;
  }

  get displayDuration() {
    if (this.duration >= 60) {
      const hours = Math.floor(this.duration / 60);
      const minutes = this.duration % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${this.duration}m`;
  }

  get formattedDateTime() {
    if (!this.datetime) return "";
    const date = new Date(this.datetime);
    return date.toLocaleString("vi-VN");
  }

  get isUpcoming() {
    if (!this.datetime) return false;
    return new Date(this.datetime) > new Date() && this.isScheduled;
  }

  get isPast() {
    if (!this.datetime) return false;
    return new Date(this.datetime) < new Date();
  }

  get isToday() {
    if (!this.datetime) return false;
    const today = new Date();
    const interviewDate = new Date(this.datetime);
    return today.toDateString() === interviewDate.toDateString();
  }

  get timeUntilInterview() {
    if (!this.datetime) return null;
    const now = new Date();
    const interviewTime = new Date(this.datetime);
    const diff = interviewTime - now;

    if (diff <= 0) return "Đã qua";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} ngày`;
    if (hours > 0) return `${hours} giờ`;
    return `${minutes} phút`;
  }

  // Methods
  updateInfo(data) {
    Object.assign(this, {
      ...data,
      updatedAt: new Date(),
    });
  }

  addInterviewer(interviewer) {
    if (!this.interviewers.find((i) => i.id === interviewer.id)) {
      this.interviewers.push(interviewer);
    }
  }

  removeInterviewer(interviewerId) {
    this.interviewers = this.interviewers.filter((i) => i.id !== interviewerId);
  }

  addQuestion(question) {
    this.questions.push({
      id: Date.now(),
      ...question,
      createdAt: new Date(),
    });
  }

  updateStatus(newStatus) {
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  reschedule(newDateTime, reason = "") {
    this.datetime = newDateTime;
    this.status = "rescheduled";
    this.notes += `\nDời lịch: ${reason}`;
    this.updatedAt = new Date();
  }

  cancel(reason = "") {
    this.status = "cancelled";
    this.notes += `\nHủy phỏng vấn: ${reason}`;
    this.updatedAt = new Date();
  }

  complete(feedback = null, rating = null, result = null) {
    this.status = "completed";
    if (feedback) this.feedback = feedback;
    if (rating) this.rating = rating;
    if (result) this.result = result;
    this.updatedAt = new Date();
  }

  addReminder(reminder) {
    this.reminders.push({
      id: Date.now(),
      ...reminder,
      createdAt: new Date(),
    });
  }

  // Validation
  isValid() {
    return this.jobId && this.candidateId && this.datetime && this.type;
  }

  // Serialization
  toJSON() {
    return {
      id: this.id,
      jobId: this.jobId,
      candidateId: this.candidateId,
      employerId: this.employerId,
      companyId: this.companyId,
      title: this.title,
      type: this.type,
      status: this.status,
      datetime: this.datetime,
      duration: this.duration,
      location: this.location,
      meetingUrl: this.meetingUrl,
      description: this.description,
      notes: this.notes,
      interviewers: this.interviewers,
      questions: this.questions,
      feedback: this.feedback,
      rating: this.rating,
      result: this.result,
      nextSteps: this.nextSteps,
      attachments: this.attachments,
      reminders: this.reminders,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromJSON(data) {
    return new Interview(data);
  }
}

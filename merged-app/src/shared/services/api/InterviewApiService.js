import apiClient from "./ApiClient.js";

/**
 * Interview API Service - Handles interview-related API calls
 */
export class InterviewApiService {
  static endpoint = "/interviews";

  // Get all interviews with pagination and filters
  static async getInterviews(params = {}) {
    const response = await apiClient.get(this.endpoint, { params });
    return response.data;
  }

  // Get interview by ID
  static async getInterviewById(interviewId) {
    const response = await apiClient.get(`${this.endpoint}/${interviewId}`);
    return response.data;
  }

  // Schedule new interview
  static async scheduleInterview(interviewData) {
    const response = await apiClient.post(this.endpoint, interviewData);
    return response.data;
  }

  // Update interview
  static async updateInterview(interviewId, interviewData) {
    const response = await apiClient.put(
      `${this.endpoint}/${interviewId}`,
      interviewData
    );
    return response.data;
  }

  // Cancel interview
  static async cancelInterview(interviewId, reason = "") {
    const response = await apiClient.delete(`${this.endpoint}/${interviewId}`, {
      data: { reason },
    });
    return response.data;
  }

  // Get interviews for a candidate
  static async getCandidateInterviews(candidateId, params = {}) {
    const response = await apiClient.get(
      `/candidates/${candidateId}/interviews`,
      { params }
    );
    return response.data;
  }

  // Get interviews for an employer
  static async getEmployerInterviews(employerId, params = {}) {
    const response = await apiClient.get(
      `/employers/${employerId}/interviews`,
      { params }
    );
    return response.data;
  }

  // Confirm interview attendance
  static async confirmInterview(interviewId) {
    const response = await apiClient.post(
      `${this.endpoint}/${interviewId}/confirm`
    );
    return response.data;
  }

  // Add interview feedback
  static async addInterviewFeedback(interviewId, feedbackData) {
    const response = await apiClient.post(
      `${this.endpoint}/${interviewId}/feedback`,
      feedbackData
    );
    return response.data;
  }

  // Get interview feedback
  static async getInterviewFeedback(interviewId) {
    const response = await apiClient.get(
      `${this.endpoint}/${interviewId}/feedback`
    );
    return response.data;
  }

  // Reschedule interview
  static async rescheduleInterview(interviewId, newDateTime, reason = "") {
    const response = await apiClient.put(
      `${this.endpoint}/${interviewId}/reschedule`,
      {
        dateTime: newDateTime,
        reason,
      }
    );
    return response.data;
  }

  // Get available time slots for interview
  static async getAvailableTimeSlots(employerId, date) {
    const response = await apiClient.get(
      `/employers/${employerId}/available-slots`,
      {
        params: { date },
      }
    );
    return response.data;
  }

  // Send interview reminder
  static async sendInterviewReminder(interviewId) {
    const response = await apiClient.post(
      `${this.endpoint}/${interviewId}/reminder`
    );
    return response.data;
  }

  // Get interview statistics
  static async getInterviewStats(params = {}) {
    const response = await apiClient.get(`${this.endpoint}/stats`, { params });
    return response.data;
  }

  // Start interview practice session
  static async startPracticeSession(practiceData) {
    const response = await apiClient.post(
      `${this.endpoint}/practice`,
      practiceData
    );
    return response.data;
  }

  // Submit practice session answers
  static async submitPracticeAnswers(sessionId, answers) {
    const response = await apiClient.post(
      `${this.endpoint}/practice/${sessionId}/submit`,
      {
        answers,
      }
    );
    return response.data;
  }
}

export default InterviewApiService;

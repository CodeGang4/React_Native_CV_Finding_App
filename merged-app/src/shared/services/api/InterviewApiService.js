import apiClient from "./ApiClient.js";

/**
 * Interview API Service - Handles interview-related API calls
 */
export class InterviewApiService {
  static endpoint = "/interview-schedule";

  // Get interviews by company/employer
  static async getInterviewsByEmployer(employerId, params = {}) {
    const response = await apiClient.get(`${this.endpoint}/${employerId}`, { params });
    return response.data;
  }

  // Get interviews by status for a company
  static async getInterviewsByStatus(companyId, status, params = {}) {
    const response = await apiClient.get(
      `${this.endpoint}/getSchedulesByStatus/${companyId}`,
      { params: { status, ...params } }
    );
    return response.data;
  }

  // Get interview detail by schedule ID
  static async getInterviewById(scheduleId) {
    const response = await apiClient.get(`${this.endpoint}/detail/${scheduleId}`);
    return response.data;
  }

  // Create new interview schedule
  static async scheduleInterview(interviewData) {
    const response = await apiClient.post(`${this.endpoint}/create`, interviewData);
    return response.data;
  }

  // Update interview schedule
  static async updateInterview(scheduleId, interviewData) {
    const response = await apiClient.patch(
      `${this.endpoint}/update/${scheduleId}`,
      interviewData
    );
    return response.data;
  }

  // Update interview status
  static async updateInterviewStatus(scheduleId, status) {
    const response = await apiClient.patch(
      `${this.endpoint}/update-status/${scheduleId}`,
      { status }
    );
    return response.data;
  }

  // Get interviews for a candidate (alias for getInterviewsByEmployer)
  static async getCandidateInterviews(candidateId, params = {}) {
    // May need separate endpoint for candidates
    return this.getInterviewsByEmployer(candidateId, params);
  }

  // Get interviews for an employer (alias)
  static async getEmployerInterviews(employerId, params = {}) {
    return this.getInterviewsByEmployer(employerId, params);
  }

  // Additional methods that would need backend implementation
  // These are placeholders for future features

  // Confirm interview attendance (not implemented in backend yet)
  static async confirmInterview(interviewId) {
    return this.updateInterviewStatus(interviewId, 'confirmed');
  }

  // Cancel interview (not implemented in backend yet)
  static async cancelInterview(interviewId, reason = "") {
    return this.updateInterviewStatus(interviewId, 'cancelled');
  }

  // Reschedule interview (would use update endpoint)
  static async rescheduleInterview(scheduleId, newDateTime, reason = "") {
    return this.updateInterview(scheduleId, {
      dateTime: newDateTime,
      reason,
    });
  }

  // Interview practice session (uses separate interview-practice router)
  static async startPracticeSession(practiceData) {
    const response = await apiClient.post('/client/interview-practice', practiceData);
    return response.data;
  }
}

export default InterviewApiService;

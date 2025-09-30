import BaseRepository from "./BaseRepository.js";
import { InterviewApiService } from "../services/api/InterviewApiService.js";

/**
 * Interview Repository - Handles interview data operations with caching
 */
export class InterviewRepository extends BaseRepository {
  constructor() {
    super("interview");
  }

  // Get all interviews with pagination and filters
  async getInterviews(params = {}, forceRefresh = false) {
    const cacheKey = `interviews_${JSON.stringify(params)}`;

    // Try cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const interviews = await InterviewApiService.getInterviews(params);

      // Cache the result
      this.setCache(cacheKey, interviews);

      // Cache individual interviews
      if (interviews.data) {
        interviews.data.forEach((interview) => {
          this.setCache(`interview_${interview.id}`, interview);
        });
      }

      return interviews;
    } catch (error) {
      console.error("Get interviews error:", error);
      throw error;
    }
  }

  // Get interview by ID
  async getInterviewById(interviewId, forceRefresh = false) {
    const cacheKey = `interview_${interviewId}`;

    // Try cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const interview = await InterviewApiService.getInterviewById(interviewId);

      // Cache the interview data
      this.setCache(cacheKey, interview);

      return interview;
    } catch (error) {
      console.error(`Get interview ${interviewId} error:`, error);
      throw error;
    }
  }

  // Schedule new interview
  async scheduleInterview(interviewData) {
    try {
      const result = await InterviewApiService.scheduleInterview(interviewData);

      // Cache the new interview
      this.setCache(`interview_${result.id}`, result);

      // Clear interviews list cache to force refresh
      this.clearCacheByPattern("interviews_");
      this.clearCacheByPattern("candidate_interviews_");
      this.clearCacheByPattern("employer_interviews_");

      return result;
    } catch (error) {
      console.error("Schedule interview error:", error);
      throw error;
    }
  }

  // Update interview
  async updateInterview(interviewId, interviewData) {
    try {
      const result = await InterviewApiService.updateInterview(
        interviewId,
        interviewData
      );

      // Update cache
      this.setCache(`interview_${interviewId}`, result);

      // Clear related caches
      this.clearCacheByPattern("interviews_");
      this.clearCacheByPattern("candidate_interviews_");
      this.clearCacheByPattern("employer_interviews_");

      return result;
    } catch (error) {
      console.error(`Update interview ${interviewId} error:`, error);
      throw error;
    }
  }

  // Cancel interview
  async cancelInterview(interviewId, reason = "") {
    try {
      const result = await InterviewApiService.cancelInterview(
        interviewId,
        reason
      );

      // Update interview status in cache
      const cachedInterview = this.getCache(`interview_${interviewId}`);
      if (cachedInterview) {
        cachedInterview.status = "cancelled";
        cachedInterview.cancellationReason = reason;
        this.setCache(`interview_${interviewId}`, cachedInterview);
      }

      // Clear related caches
      this.clearCacheByPattern("interviews_");
      this.clearCacheByPattern("candidate_interviews_");
      this.clearCacheByPattern("employer_interviews_");

      return result;
    } catch (error) {
      console.error(`Cancel interview ${interviewId} error:`, error);
      throw error;
    }
  }

  // Get interviews for a candidate
  async getCandidateInterviews(candidateId, params = {}, forceRefresh = false) {
    const cacheKey = `candidate_interviews_${candidateId}_${JSON.stringify(
      params
    )}`;

    // Try cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const interviews = await InterviewApiService.getCandidateInterviews(
        candidateId,
        params
      );

      // Cache the result
      this.setCache(cacheKey, interviews);

      // Cache individual interviews
      if (interviews.data) {
        interviews.data.forEach((interview) => {
          this.setCache(`interview_${interview.id}`, interview);
        });
      }

      return interviews;
    } catch (error) {
      console.error(`Get candidate ${candidateId} interviews error:`, error);
      throw error;
    }
  }

  // Get interviews for an employer
  async getEmployerInterviews(employerId, params = {}, forceRefresh = false) {
    const cacheKey = `employer_interviews_${employerId}_${JSON.stringify(
      params
    )}`;

    // Try cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const interviews = await InterviewApiService.getEmployerInterviews(
        employerId,
        params
      );

      // Cache the result
      this.setCache(cacheKey, interviews);

      // Cache individual interviews
      if (interviews.data) {
        interviews.data.forEach((interview) => {
          this.setCache(`interview_${interview.id}`, interview);
        });
      }

      return interviews;
    } catch (error) {
      console.error(`Get employer ${employerId} interviews error:`, error);
      throw error;
    }
  }

  // Confirm interview attendance
  async confirmInterview(interviewId) {
    try {
      const result = await InterviewApiService.confirmInterview(interviewId);

      // Update interview status in cache
      const cachedInterview = this.getCache(`interview_${interviewId}`);
      if (cachedInterview) {
        cachedInterview.status = "confirmed";
        this.setCache(`interview_${interviewId}`, cachedInterview);
      }

      return result;
    } catch (error) {
      console.error(`Confirm interview ${interviewId} error:`, error);
      throw error;
    }
  }

  // Add interview feedback
  async addInterviewFeedback(interviewId, feedbackData) {
    try {
      const result = await InterviewApiService.addInterviewFeedback(
        interviewId,
        feedbackData
      );

      // Update interview cache with feedback
      const cachedInterview = this.getCache(`interview_${interviewId}`);
      if (cachedInterview) {
        cachedInterview.feedback = result;
        this.setCache(`interview_${interviewId}`, cachedInterview);
      }

      // Clear feedback cache
      this.clearCache(`interview_${interviewId}_feedback`);

      return result;
    } catch (error) {
      console.error(`Add feedback for interview ${interviewId} error:`, error);
      throw error;
    }
  }

  // Get interview feedback
  async getInterviewFeedback(interviewId, forceRefresh = false) {
    const cacheKey = `interview_${interviewId}_feedback`;

    // Try cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const feedback = await InterviewApiService.getInterviewFeedback(
        interviewId
      );

      // Cache the feedback
      this.setCache(cacheKey, feedback);

      return feedback;
    } catch (error) {
      console.error(`Get feedback for interview ${interviewId} error:`, error);
      throw error;
    }
  }

  // Reschedule interview
  async rescheduleInterview(interviewId, newDateTime, reason = "") {
    try {
      const result = await InterviewApiService.rescheduleInterview(
        interviewId,
        newDateTime,
        reason
      );

      // Update interview in cache
      this.setCache(`interview_${interviewId}`, result);

      // Clear related caches
      this.clearCacheByPattern("interviews_");
      this.clearCacheByPattern("candidate_interviews_");
      this.clearCacheByPattern("employer_interviews_");

      return result;
    } catch (error) {
      console.error(`Reschedule interview ${interviewId} error:`, error);
      throw error;
    }
  }

  // Get available time slots for interview
  async getAvailableTimeSlots(employerId, date, forceRefresh = false) {
    const cacheKey = `available_slots_${employerId}_${date}`;

    // Try cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const slots = await InterviewApiService.getAvailableTimeSlots(
        employerId,
        date
      );

      // Cache with shorter TTL (30 minutes)
      this.setCache(cacheKey, slots, 30 * 60 * 1000);

      return slots;
    } catch (error) {
      console.error(
        `Get available slots for employer ${employerId} on ${date} error:`,
        error
      );
      throw error;
    }
  }

  // Send interview reminder
  async sendInterviewReminder(interviewId) {
    try {
      const result = await InterviewApiService.sendInterviewReminder(
        interviewId
      );

      // Update interview cache to mark reminder sent
      const cachedInterview = this.getCache(`interview_${interviewId}`);
      if (cachedInterview) {
        cachedInterview.reminderSent = true;
        cachedInterview.lastReminderAt = new Date().toISOString();
        this.setCache(`interview_${interviewId}`, cachedInterview);
      }

      return result;
    } catch (error) {
      console.error(`Send reminder for interview ${interviewId} error:`, error);
      throw error;
    }
  }

  // Get interview statistics
  async getInterviewStats(params = {}, forceRefresh = false) {
    const cacheKey = `interview_stats_${JSON.stringify(params)}`;

    // Try cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const stats = await InterviewApiService.getInterviewStats(params);

      // Cache with shorter TTL (10 minutes)
      this.setCache(cacheKey, stats, 10 * 60 * 1000);

      return stats;
    } catch (error) {
      console.error("Get interview stats error:", error);
      throw error;
    }
  }

  // Start interview practice session
  async startPracticeSession(practiceData) {
    try {
      const result = await InterviewApiService.startPracticeSession(
        practiceData
      );

      // Cache the practice session
      this.setCache(`practice_session_${result.sessionId}`, result);

      return result;
    } catch (error) {
      console.error("Start practice session error:", error);
      throw error;
    }
  }

  // Submit practice session answers
  async submitPracticeAnswers(sessionId, answers) {
    try {
      const result = await InterviewApiService.submitPracticeAnswers(
        sessionId,
        answers
      );

      // Update practice session cache
      const cachedSession = this.getCache(`practice_session_${sessionId}`);
      if (cachedSession) {
        cachedSession.answers = answers;
        cachedSession.result = result;
        cachedSession.completed = true;
        this.setCache(`practice_session_${sessionId}`, cachedSession);
      }

      return result;
    } catch (error) {
      console.error(
        `Submit practice answers for session ${sessionId} error:`,
        error
      );
      throw error;
    }
  }

  // Clear interview cache
  clearInterviewCache(interviewId) {
    this.clearCache(`interview_${interviewId}`);
    this.clearCache(`interview_${interviewId}_feedback`);
  }

  // Clear all interview caches
  clearAllInterviewCaches() {
    this.clearCacheByPattern("interviews_");
    this.clearCacheByPattern("interview_");
    this.clearCacheByPattern("candidate_interviews_");
    this.clearCacheByPattern("employer_interviews_");
    this.clearCacheByPattern("available_slots_");
    this.clearCacheByPattern("interview_stats_");
    this.clearCacheByPattern("practice_session_");
  }
}

export default InterviewRepository;

import { useState, useCallback } from "react";
import ApplicationApiService from "../services/api/ApplicationApiService";
import notificationTriggerService from "../services/business/NotificationTriggerService";
import { useAuth } from "../contexts/AuthContext";
import AutoNotificationService from "../services/AutoNotificationService";

export default function useApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, userRole } = useAuth();

  const getApplicationsByCandidate = useCallback(async (candidateId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApplicationApiService.getApplicationByCandidate(candidateId);
      setApplications(data);
      return data;
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const applyToJob = useCallback(async (candidateId, jobId, jobData = {}) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[useApplications] Applying to job:', jobId, 'by candidate:', candidateId);
      
      // Create application
      const data = await ApplicationApiService.createApplication({ 
        candidate_id: candidateId, 
        job_id: jobId 
      });
      
      setApplications((prev) => [...prev, data]);
      
      // AUTO: Send notification to employer
      if (jobData.employer_id) {
        await AutoNotificationService.notifyJobApplication({
          candidateId: candidateId,
          candidateName: user?.full_name || user?.name || user?.email || 'Ứng viên',
          employerId: jobData.employer_id,
          jobId: jobId,
          jobTitle: jobData.title || jobData.position || 'Công việc',
          applicationId: data.id
        });
        console.log('[useApplications]  Application notification sent');
      }
      
      return data;
    } catch (err) {
      console.error("Error applying to job:", err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateApplicationStatus = useCallback(async (applicationId, status) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await ApplicationApiService.updateApplicationStatus(applicationId, status);
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: updated.status } : app))
      );
      return updated;
    } catch (err) {
      console.error("Error updating application status:", err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCompetitionRate = useCallback(async (jobId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApplicationApiService.calculateCompetitionRate(jobId);
      return data;
    } catch (err) {
      console.error("Error calculating competition rate:", err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    applications,
    loading,
    error,
    getApplicationsByCandidate,
    applyToJob,
    updateApplicationStatus,
    getCompetitionRate,
    setApplications,
  };
}

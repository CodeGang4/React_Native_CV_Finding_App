import { useState, useCallback } from "react";
import ApplicationApiService from "../services/api/ApplicationApiService";

export default function useApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const applyToJob = useCallback(async (candidateId, jobId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApplicationApiService.createApplication({ candidate_id: candidateId, job_id: jobId });
      setApplications((prev) => [...prev, data]);
      return data;
    } catch (err) {
      console.error("Error applying to job:", err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

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

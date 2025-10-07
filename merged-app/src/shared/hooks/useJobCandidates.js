import { useState, useEffect, useCallback } from "react";
import applicationBusinessService from "../services/business/ApplicationBusinessService";

/**
 * Custom hook for managing job candidates/applicants
 */
export const useJobCandidates = (jobId) => {
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shortlisted: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch candidates data
  const fetchCandidates = useCallback(
    async (forceRefresh = false) => {
      if (!jobId) {
        setCandidates([]);
        setStats({ total: 0, pending: 0, shortlisted: 0, rejected: 0 });
        return;
      }

      const loadingState = forceRefresh ? setRefreshing : setLoading;

      loadingState(true);
      setError(null);

      try {
        const candidatesData =
          await applicationBusinessService.getCandidatesByJobId(
            jobId,
            forceRefresh
          );

        setCandidates(candidatesData || []);

        // Generate statistics
        const candidateStats =
          applicationBusinessService.generateCandidateStats(
            candidatesData || []
          );
        setStats(candidateStats);
      } catch (err) {
        console.error("Fetch candidates error:", err);
        setError(err.message || "Failed to fetch candidates");
        setCandidates([]);
        setStats({ total: 0, pending: 0, shortlisted: 0, rejected: 0 });
      } finally {
        loadingState(false);
      }
    },
    [jobId]
  );

  // Update candidate status
  const updateCandidateStatus = useCallback(
    async (applicationId, status) => {
      try {
        await applicationBusinessService.updateCandidateStatus(
          applicationId,
          status,
          jobId
        );

        // Refresh data after update
        await fetchCandidates(true);

        return { success: true };
      } catch (err) {
        console.error("Update candidate status error:", err);
        setError(err.message || "Failed to update candidate status");
        throw err;
      }
    },
    [jobId, fetchCandidates]
  );

  // Refresh candidates data
  const refreshCandidates = useCallback(() => {
    return fetchCandidates(true);
  }, [fetchCandidates]);

  // Load candidates when jobId changes
  useEffect(() => {
    if (jobId) {
      fetchCandidates();
    } else {
      setCandidates([]);
      setStats({ total: 0, pending: 0, shortlisted: 0, rejected: 0 });
      setError(null);
    }
  }, [fetchCandidates, jobId]);

  return {
    // Data
    candidates,
    stats,

    // States
    loading,
    refreshing,
    error,

    // Actions
    fetchCandidates,
    updateCandidateStatus,
    refreshCandidates,

    // Computed properties
    hasCandidates: candidates.length > 0,
    isEmpty: candidates.length === 0,
  };
};

export default useJobCandidates;

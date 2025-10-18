import { useState, useEffect, useCallback, useRef } from "react";
import { DeviceEventEmitter } from "react-native";
import { getJobStatusWithColor } from "../utils/jobStatusUtils.js";

/**
 * Job card statistics hook - ZERO HTTP 429 solution
 * Uses CentralizedCandidateManager with fallback to avoid crashes
 */
export const useJobCardStats = (job) => {
  const [candidatesCount, setCandidatesCount] = useState(0);
  const [views, setViews] = useState(job?.views || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);
  const managerRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const fallbackMode = useRef(false);

  // Lazy load CentralizedCandidateManager with comprehensive fallback
  const initializeManager = useCallback(async () => {
    if (!managerRef.current && !fallbackMode.current) {
      try {
        const CentralizedCandidateManager = await import(
          "../services/utils/CentralizedCandidateManager"
        )
          .then((module) => module.default)
          .catch((error) => {
            console.warn("CentralizedCandidateManager import failed:", error);
            fallbackMode.current = true;
            return null;
          });

        if (CentralizedCandidateManager && !fallbackMode.current) {
          managerRef.current = CentralizedCandidateManager.getInstance();
          console.log("✅ CentralizedCandidateManager initialized");
        } else {
          fallbackMode.current = true;
          console.log("⚠️ Using fallback mode for job card stats");
        }
      } catch (error) {
        console.error(
          "Failed to initialize CentralizedCandidateManager:",
          error
        );
        fallbackMode.current = true;
      }
    }
    return managerRef.current;
  }, []);

  // Fallback method to get candidate count using legacy approach
  const getFallbackCandidateCount = useCallback(
    async (jobId) => {
      try {
        // Try to use existing ApplicationRepository if available
        const applicationRepository = await import(
          "../repositories/ApplicationRepository"
        )
          .then((module) => module.default || module.ApplicationRepository)
          .catch(() => null);

        if (applicationRepository) {
          const candidates = await applicationRepository.getCandidatesByJobId(
            jobId
          );
          return Array.isArray(candidates) ? candidates.length : 0;
        }
      } catch (error) {
        console.error("Fallback candidate count failed:", error);
      }

      // Ultimate fallback: return job's existing candidate count if available
      return job?.applications?.length || job?.application_count || 0;
    },
    [job]
  );

  // Subscribe to centralized manager for real-time updates
  useEffect(() => {
    if (!job?.id) {
      setIsLoading(false);
      return;
    }

    const setupSubscription = async () => {
      setIsLoading(true);

      const manager = await initializeManager();

      if (!manager || fallbackMode.current) {
        // Fallback mode: get candidate count once
        try {
          const count = await getFallbackCandidateCount(job.id);
          if (mountedRef.current) {
            setCandidatesCount(count);
            setIsLoading(false);
            setError(null);
          }
        } catch (error) {
          if (mountedRef.current) {
            setError("Failed to load candidate data");
            setIsLoading(false);
          }
        }
        return;
      }

      // Normal mode: use CentralizedManager
      const handleCandidateUpdate = (candidateData) => {
        if (!mountedRef.current) return;

        const newCount = candidateData.total || 0;

        setCandidatesCount((prevCount) => {
          if (prevCount !== newCount) {
            console.log(
              `📈 Job ${job.id} candidates updated: ${prevCount} → ${newCount}`
            );
            return newCount;
          }
          return prevCount;
        });

        setIsLoading(false);
        setError(null);
      };

      try {
        unsubscribeRef.current = manager.subscribe(
          job.id,
          handleCandidateUpdate
        );

        // Get current data immediately if available
        const currentData = manager.getCurrentCounts(job.id);
        if (currentData.total > 0 || currentData.lastUpdated) {
          handleCandidateUpdate(currentData);
        }
      } catch (error) {
        console.error("Failed to subscribe to candidate updates:", error);
        // Fallback to legacy method
        try {
          const count = await getFallbackCandidateCount(job.id);
          if (mountedRef.current) {
            setCandidatesCount(count);
            setIsLoading(false);
            setError(null);
          }
        } catch (fallbackError) {
          if (mountedRef.current) {
            setError("Failed to load candidate data");
            setIsLoading(false);
          }
        }
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [job?.id, initializeManager, getFallbackCandidateCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Manual refresh function
  const fetchCandidatesCount = useCallback(async () => {
    if (!job?.id) return;

    if (fallbackMode.current) {
      // Fallback mode: direct fetch
      try {
        const count = await getFallbackCandidateCount(job.id);
        setCandidatesCount(count);
      } catch (error) {
        console.error(
          "Failed to refresh job candidates in fallback mode:",
          error
        );
      }
    } else {
      // Normal mode: use manager
      const manager = await initializeManager();
      if (manager) {
        try {
          manager.refreshJob(job.id);
        } catch (error) {
          console.error("Failed to refresh job candidates:", error);
        }
      }
    }
  }, [job?.id, initializeManager, getFallbackCandidateCount]);

  // Format deadline/expiry date
  const formatDeadline = useCallback((job) => {
    const deadlineField =
      job?.exprired_date ||
      job?.expired_date ||
      job?.deadline ||
      job?.expiry_date;

    if (!deadlineField) {
      return "Không giới hạn";
    }

    try {
      let deadlineDate;

      if (typeof deadlineField === "string" && deadlineField.includes("/")) {
        const parts = deadlineField.split("/");
        if (parts.length === 3) {
          deadlineDate = new Date(
            parseInt(parts[2]),
            parseInt(parts[1]) - 1,
            parseInt(parts[0])
          );
        } else if (parts.length === 2) {
          const currentYear = new Date().getFullYear();
          deadlineDate = new Date(
            currentYear,
            parseInt(parts[1]) - 1,
            parseInt(parts[0])
          );
        }
      } else {
        deadlineDate = new Date(deadlineField);
      }

      if (isNaN(deadlineDate.getTime())) {
        return "Ngày không hợp lệ";
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deadlineDate.setHours(0, 0, 0, 0);

      const diffTime = deadlineDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return "Đã hết hạn";
      } else if (diffDays === 0) {
        return "Hôm nay";
      } else if (diffDays === 1) {
        return "Ngày mai";
      } else if (diffDays <= 7) {
        return `${diffDays} ngày nữa`;
      } else {
        const day = deadlineDate.getDate().toString().padStart(2, "0");
        const month = (deadlineDate.getMonth() + 1).toString().padStart(2, "0");
        const year = deadlineDate.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch (error) {
      console.error("Error parsing deadline:", error);
      return "Ngày không hợp lệ";
    }
  }, []);

  // Get job status with color
  const getJobStatus = useCallback((job) => {
    return getJobStatusWithColor(job);
  }, []);

  // Update views when job data changes
  useEffect(() => {
    if (job?.views !== undefined && job.views !== views) {
      console.log(
        `📈 Views updated for job ${job.id}: ${views} → ${job.views}`
      );
      setViews(job.views);
    }
  }, [job?.views, views, job?.id]);

  return {
    // Data
    views: views,
    candidatesCount,
    deadline: formatDeadline(job),
    status: getJobStatus(job),

    // States
    isLoading,
    error,

    // Actions
    refreshCandidatesCount: () => fetchCandidatesCount(),
    forceRefresh: () => fetchCandidatesCount(),

    // Computed
    hasAutoRefresh: true,
  };
};

export default useJobCardStats;

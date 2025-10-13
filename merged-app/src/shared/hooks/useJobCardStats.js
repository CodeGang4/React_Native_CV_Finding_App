import { useState, useEffect, useCallback } from "react";
import { DeviceEventEmitter } from "react-native";
import applicationRepository from "../repositories/ApplicationRepository.js";
import { getJobStatusWithColor } from "../utils/jobStatusUtils.js";

/**
 * Custom hook for job card statistics (views, candidates, expiry)
 * Used in job lists where we don't want to increment views
 */
export const useJobCardStats = (job) => {
  const [candidatesCount, setCandidatesCount] = useState(0);
  const [views, setViews] = useState(job?.views || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Get candidates count for this job
  const fetchCandidatesCount = useCallback(
    async (isInitial = false) => {
      if (!job?.id) return;

      if (isInitial) {
        setIsLoading(true);
      }
      setError(null);

      try {
        // Use existing ApplicationRepository to get candidates (with cache)
        const candidates = await applicationRepository.getCandidatesByJobId(
          job.id,
          false
        ); // Use cache for performance
        const newCount = candidates?.length || 0;

        // Only update if count changed to prevent unnecessary re-renders
        setCandidatesCount((prevCount) => {
          if (prevCount !== newCount) {
            console.log(
              `📈 Job ${job.id} candidates updated: ${prevCount} → ${newCount}`
            );
            return newCount;
          }
          return prevCount;
        });
      } catch (err) {
        console.warn(
          `⚠️ Failed to get candidates count for job ${job.id}:`,
          err
        );
        setError(err.message);
        // Fallback to job data if available
        setCandidatesCount(job?.applications || job?.application_count || 0);
      } finally {
        if (isInitial) {
          setIsLoading(false);
        }
      }
    },
    [job?.id, job?.applications, job?.application_count]
  );

  // Format deadline/expiry date (similar to JobDetailHeader)
  const formatDeadline = useCallback((job) => {
    // Check all possible deadline fields from backend
    const deadlineField =
      job?.exprired_date ||
      job?.expired_date ||
      job?.deadline ||
      job?.expiry_date ||
      job?.exprired_date;

    console.log("🔍 Checking deadline fields for job:", job?.id, {
      exprired_date: job?.exprired_date,
      expired_date: job?.expired_date,
      deadline: job?.deadline,
      expiry_date: job?.expiry_date,
      selected: deadlineField,
    });

    if (!deadlineField) {
      console.log("⚠️ No deadline field found, returning default");
      return "Không giới hạn";
    }

    try {
      let deadlineDate;

      // Handle different date formats
      if (typeof deadlineField === "string" && deadlineField.includes("/")) {
        // Handle dd/mm/yyyy or dd/mm format (Vietnamese format)
        const parts = deadlineField.split("/");
        if (parts.length === 3) {
          // dd/mm/yyyy format
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
          const year = parseInt(parts[2], 10);
          deadlineDate = new Date(year, month, day);
        } else if (parts.length === 2) {
          // dd/mm format, assume current year
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
          const year = new Date().getFullYear();
          deadlineDate = new Date(year, month, day);
        } else {
          deadlineDate = new Date(deadlineField);
        }
      } else {
        // Try standard date parsing
        deadlineDate = new Date(deadlineField);
      }

      console.log("📅 Parsing deadline:", deadlineField, "→", deadlineDate);

      // Check if date is valid
      if (isNaN(deadlineDate.getTime())) {
        console.warn("❌ Invalid date:", deadlineField);
        return "Không giới hạn";
      }

      // Check if expired
      const now = new Date();
      const isExpired = deadlineDate < now;

      // Format similar to JobDetailHeader
      const dateStr = deadlineDate.toLocaleDateString("vi-VN");
      let formatted = dateStr;

      // Shorten format if too long (like JobDetailHeader)
      if (dateStr.includes("/")) {
        const parts = dateStr.split("/");
        if (parts.length === 3) {
          formatted = `${parts[0]}/${parts[1]}`; // Only show day/month
        }
      }

      console.log("✅ Formatted deadline:", {
        original: deadlineField,
        formatted,
        isExpired,
        fullDate: dateStr,
      });

      return {
        formatted,
        isExpired,
        date: deadlineDate,
        fullDate: dateStr,
      };
    } catch (error) {
      console.error("❌ Error parsing deadline:", error);
      return "Không giới hạn";
    }
  }, []);

  // Get job status based on expiry and other factors
  const getJobStatus = useCallback((job) => {
    return getJobStatusWithColor(job);
  }, []);

  // Fetch candidates count when job changes
  useEffect(() => {
    if (job?.id) {
      // Initial fetch with loading state
      fetchCandidatesCount(true);

      // Set up auto-refresh every 60 seconds for live updates (longer interval for better performance)
      const interval = setInterval(() => {
        fetchCandidatesCount(false); // Background refresh without loading state
      }, 60000); // 60 seconds

      setRefreshInterval(interval);

      return () => {
        if (interval) {
          clearInterval(interval);
          setRefreshInterval(null);
        }
      };
    } else {
      setCandidatesCount(0);
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [job?.id]); // Remove fetchCandidatesCount from deps to avoid recreation

  // Listen for refresh events (e.g., when returning from JobDetail)
  useEffect(() => {
    const handleRefreshEvent = () => {
      console.log("📢 Received refresh event for job:", job?.id);
      forceRefresh();
    };

    const subscription = DeviceEventEmitter.addListener(
      "refreshJobCards",
      handleRefreshEvent
    );

    return () => {
      subscription.remove();
    };
  }, [forceRefresh]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  // Fetch updated job data including views
  const fetchJobData = useCallback(async () => {
    if (!job?.id) return;

    try {
      // For now, we'll rely on job data refresh from parent component
      // In future, we could add a job detail API call here
      console.log("📊 Force refreshing job data for:", job.id);

      // Clear cache and fetch fresh candidates
      applicationRepository.clearJobCandidatesCache(job.id);
      await fetchCandidatesCount(true);

      // Views will be updated when parent component re-renders with fresh job data
    } catch (error) {
      console.error("Error refreshing job data:", error);
    }
  }, [job?.id, fetchCandidatesCount]);

  // Force refresh when returning from JobDetail (e.g., when views might have increased)
  const forceRefresh = useCallback(() => {
    fetchJobData();
  }, [fetchJobData]);

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
    refreshCandidatesCount: () => fetchCandidatesCount(true),
    forceRefresh,

    // Computed
    hasAutoRefresh: refreshInterval !== null,
  };
};

export default useJobCardStats;

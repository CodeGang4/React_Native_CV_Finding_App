/**
 * Virtual Job Loading System
 * Only loads candidate data for visible jobs, prevents API spam
 */

import { useState, useEffect, useRef, useCallback } from "react";
import smartStateManager from "../services/SmartStateManager";
import { isApplicationCountingEnabled } from "../config/featureFlags";

export const useVirtualJobLoading = (jobs = [], options = {}) => {
  const {
    viewportSize = 5, // Number of jobs to load at once
    preloadBuffer = 2, // Extra jobs to preload above/below viewport
    enableCandidateCounting = isApplicationCountingEnabled(),
    candidateCountTTL = 300000, // 5 minutes cache for candidate counts
  } = options;

  const [visibleJobs, setVisibleJobs] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});
  const [candidateCounts, setCandidateCounts] = useState({});
  const [virtualScrollData, setVirtualScrollData] = useState({
    startIndex: 0,
    endIndex: Math.min(viewportSize - 1, jobs.length - 1),
  });

  const loadingQueue = useRef(new Set());
  const visibilityMap = useRef(new Map());

  /**
   * Update visible range based on scroll position
   */
  const updateVisibleRange = useCallback(
    (startIndex, endIndex) => {
      const safeStartIndex = Math.max(0, startIndex - preloadBuffer);
      const safeEndIndex = Math.min(jobs.length - 1, endIndex + preloadBuffer);

      setVirtualScrollData({
        startIndex: safeStartIndex,
        endIndex: safeEndIndex,
      });

      // Update visible jobs
      const newVisibleJobs = jobs.slice(safeStartIndex, safeEndIndex + 1);
      setVisibleJobs(newVisibleJobs);

      // Load candidate counts for visible jobs
      loadCandidateCountsForVisible(newVisibleJobs);
    },
    [jobs, preloadBuffer]
  );

  /**
   * Load candidate counts only for visible jobs
   */
  const loadCandidateCountsForVisible = useCallback(
    async (jobsToLoad) => {
      if (!enableCandidateCounting || jobsToLoad.length === 0) return;

      // Filter out jobs that are already loading or loaded recently
      const jobsNeedingLoad = jobsToLoad.filter((job) => {
        const loadingKey = `candidates_${job.id}`;
        const isLoading = loadingQueue.current.has(loadingKey);
        const hasRecentData = smartStateManager.getFromCache(loadingKey);

        return !isLoading && !hasRecentData;
      });

      if (jobsNeedingLoad.length === 0) return;

      console.log(
        `📊 [VirtualLoading] Loading candidates for ${jobsNeedingLoad.length} visible jobs`
      );

      // Update loading states
      const newLoadingStates = {};
      jobsNeedingLoad.forEach((job) => {
        newLoadingStates[job.id] = true;
        loadingQueue.current.add(`candidates_${job.id}`);
      });

      setLoadingStates((prev) => ({ ...prev, ...newLoadingStates }));

      // Load candidate counts with smart state management
      const loadPromises = jobsNeedingLoad.map(async (job) => {
        const loadingKey = `candidates_${job.id}`;

        try {
          const count = await smartStateManager.get(
            loadingKey,
            async () => {
              // Your actual API call to get candidate count
              const response = await getCandidatesForJob(job.id);
              return response.length || 0;
            },
            {
              ttl: candidateCountTTL,
              fallbackValue: 0,
              enableOptimistic: false,
            }
          );

          // Update candidate count
          setCandidateCounts((prev) => ({
            ...prev,
            [job.id]: count,
          }));

          return { jobId: job.id, count, success: true };
        } catch (error) {
          console.warn(
            `⚠️ [VirtualLoading] Failed to load candidates for job ${job.id}:`,
            error.message
          );

          // Set fallback count
          setCandidateCounts((prev) => ({
            ...prev,
            [job.id]: 0,
          }));

          return {
            jobId: job.id,
            count: 0,
            success: false,
            error: error.message,
          };
        } finally {
          // Remove from loading queue
          loadingQueue.current.delete(loadingKey);

          // Update loading state
          setLoadingStates((prev) => {
            const updated = { ...prev };
            delete updated[job.id];
            return updated;
          });
        }
      });

      // Execute all loads with controlled concurrency
      const results = await executeWithConcurrencyLimit(loadPromises, 2);

      console.log(
        `✅ [VirtualLoading] Loaded candidates for ${
          results.filter((r) => r.success).length
        }/${results.length} jobs`
      );
    },
    [enableCandidateCounting, candidateCountTTL]
  );

  /**
   * Execute promises with concurrency limit
   */
  const executeWithConcurrencyLimit = async (promiseFactories, limit) => {
    const results = [];
    const executing = [];

    for (const promiseFactory of promiseFactories) {
      const promise = promiseFactory.then((result) => {
        executing.splice(executing.indexOf(promise), 1);
        return result;
      });

      results.push(promise);
      executing.push(promise);

      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }

    return Promise.all(results);
  };

  /**
   * Preload candidate counts for upcoming jobs
   */
  const preloadUpcoming = useCallback(
    async (direction = "down", count = 3) => {
      if (!enableCandidateCounting) return;

      const { startIndex, endIndex } = virtualScrollData;
      let jobsToPreload = [];

      if (direction === "down") {
        const nextStartIndex = endIndex + 1;
        const nextEndIndex = Math.min(
          jobs.length - 1,
          nextStartIndex + count - 1
        );
        jobsToPreload = jobs.slice(nextStartIndex, nextEndIndex + 1);
      } else {
        const prevEndIndex = startIndex - 1;
        const prevStartIndex = Math.max(0, prevEndIndex - count + 1);
        jobsToPreload = jobs.slice(prevStartIndex, prevEndIndex + 1);
      }

      if (jobsToPreload.length > 0) {
        console.log(
          `🔄 [VirtualLoading] Preloading ${count} jobs in ${direction} direction`
        );
        await loadCandidateCountsForVisible(jobsToPreload);
      }
    },
    [
      virtualScrollData,
      jobs,
      loadCandidateCountsForVisible,
      enableCandidateCounting,
    ]
  );

  /**
   * Get candidate count for specific job
   */
  const getCandidateCount = useCallback(
    (jobId) => {
      const count = candidateCounts[jobId];
      const isLoading = loadingStates[jobId];

      return {
        count: count !== undefined ? count : null,
        isLoading: !!isLoading,
        hasData: count !== undefined,
      };
    },
    [candidateCounts, loadingStates]
  );

  /**
   * Force refresh candidate count for specific job
   */
  const refreshJobCandidates = useCallback(
    async (jobId) => {
      const loadingKey = `candidates_${jobId}`;

      setLoadingStates((prev) => ({ ...prev, [jobId]: true }));

      try {
        const count = await smartStateManager.get(
          loadingKey,
          async () => {
            const response = await getCandidatesForJob(jobId);
            return response.length || 0;
          },
          {
            forceRefresh: true,
            ttl: candidateCountTTL,
            fallbackValue: candidateCounts[jobId] || 0,
          }
        );

        setCandidateCounts((prev) => ({
          ...prev,
          [jobId]: count,
        }));

        return count;
      } catch (error) {
        console.warn(
          `⚠️ [VirtualLoading] Failed to refresh candidates for job ${jobId}:`,
          error.message
        );
        throw error;
      } finally {
        setLoadingStates((prev) => {
          const updated = { ...prev };
          delete updated[jobId];
          return updated;
        });
      }
    },
    [candidateCountTTL, candidateCounts]
  );

  // Initialize with first batch
  useEffect(() => {
    if (jobs.length > 0) {
      updateVisibleRange(0, Math.min(viewportSize - 1, jobs.length - 1));
    }
  }, [jobs, viewportSize, updateVisibleRange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      loadingQueue.current.clear();
      visibilityMap.current.clear();
    };
  }, []);

  return {
    // Core data
    visibleJobs,
    virtualScrollData,

    // Candidate counts
    getCandidateCount,
    refreshJobCandidates,

    // Loading states
    isLoading: Object.keys(loadingStates).length > 0,
    loadingStates,

    // Controls
    updateVisibleRange,
    preloadUpcoming,

    // Stats
    stats: {
      totalJobs: jobs.length,
      visibleJobs: visibleJobs.length,
      loadedCandidateCounts: Object.keys(candidateCounts).length,
      loadingCount: Object.keys(loadingStates).length,
    },
  };
};

// Helper function placeholder - replace with your actual API call
const getCandidatesForJob = async (jobId) => {
  // This should be replaced with your actual API service call
  const { applicationApiService } = await import(
    "../services/api/ApplicationApiService"
  );
  return applicationApiService.getAllCandidates(jobId);
};

export default useVirtualJobLoading;

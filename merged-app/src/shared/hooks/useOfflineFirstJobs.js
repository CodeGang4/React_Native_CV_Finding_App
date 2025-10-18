/**
 * Offline-First Job Hook - Always works, even during rate limiting
 * Provides instant responses with smart caching and background sync
 */

import { useState, useEffect, useCallback, useRef } from "react";
import smartStateManager from "../services/SmartStateManager";
import { requestQueue } from "../services/utils/RequestQueue";
import useVirtualJobLoading from "./useVirtualJobLoading";
import { isApplicationCountingEnabled } from "../config/featureFlags";

export const useOfflineFirstJobs = (employerId, options = {}) => {
  const {
    enableVirtualLoading = true,
    enableCandidateCounting = isApplicationCountingEnabled(),
    refreshInterval = 60000, // 1 minute background refresh
    offlineTimeout = 5000, // Max wait time before using cache
    maxRetries = 3,
  } = options;

  // Core state
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  // Refs for cleanup and state management
  const mounted = useRef(true);
  const backgroundSyncTimer = useRef(null);
  const retryAttempts = useRef(0);

  // Virtual loading hook (only if enabled)
  const virtualLoading = useVirtualJobLoading(jobs, {
    enabled: enableVirtualLoading,
    viewportSize: 8,
    preloadBuffer: 3,
    enableCandidateCounting,
  });

  /**
   * Main fetch function with offline-first approach
   */
  const fetchJobs = useCallback(
    async (options = {}) => {
      const { forceRefresh = false, silent = false, useCache = true } = options;

      if (!silent) setLoading(true);
      setError(null);

      const jobsKey = `jobs_${employerId}`;

      try {
        // Get jobs with smart state management
        const jobsData = await smartStateManager.get(
          jobsKey,
          async () => {
            // Your actual API call
            const { employerJobBusinessService } = await import(
              "../services/business/EmployerJobBusinessService"
            );
            return employerJobBusinessService.getAllJobsForEmployer(employerId);
          },
          {
            ttl: 300000, // 5 minutes
            forceRefresh,
            enableOptimistic: true,
            fallbackValue: jobs.length > 0 ? jobs : [],
          }
        );

        if (mounted.current) {
          setJobs(jobsData || []);
          setLastSync(new Date());
          setIsOffline(false);
          retryAttempts.current = 0;
        }

        console.log(
          `✅ [OfflineFirstJobs] Loaded ${
            jobsData?.length || 0
          } jobs for employer ${employerId}`
        );
        return jobsData;
      } catch (error) {
        console.warn(`⚠️ [OfflineFirstJobs] Fetch failed:`, error.message);

        if (mounted.current) {
          setIsOffline(true);
          retryAttempts.current++;

          // Use cached data if available
          const cachedJobs = await getCachedJobs(jobsKey);
          if (cachedJobs.length > 0) {
            console.log(
              `📦 [OfflineFirstJobs] Using cached data: ${cachedJobs.length} jobs`
            );
            setJobs(cachedJobs);
            setError({
              message: "Using cached data due to network issues",
              type: "warning",
              canRetry: true,
            });
          } else {
            setError({
              message: error.message,
              type: "error",
              canRetry: true,
            });
          }
        }

        throw error;
      } finally {
        if (!silent && mounted.current) {
          setLoading(false);
        }
      }
    },
    [employerId, jobs]
  );

  /**
   * Get cached jobs from multiple sources
   */
  const getCachedJobs = useCallback(async (jobsKey) => {
    try {
      // Try smart state manager first
      const smartCached = smartStateManager.getFromCache(jobsKey);
      if (smartCached) return smartCached.data;

      // Try request queue cache
      const queueCached = requestQueue.cache.get(jobsKey);
      if (queueCached && Date.now() - queueCached.timestamp < 600000) {
        // 10 minutes
        return queueCached.data;
      }

      return [];
    } catch (error) {
      console.warn("Failed to get cached jobs:", error.message);
      return [];
    }
  }, []);

  /**
   * Create new job with optimistic updates
   */
  const createJob = useCallback(
    async (jobData) => {
      const tempId = `temp_${Date.now()}`;
      const optimisticJob = {
        ...jobData,
        id: tempId,
        created_at: new Date().toISOString(),
        status: "active",
        _isOptimistic: true,
      };

      try {
        console.log(
          "🚀 [OfflineFirstJobs] Creating job with optimistic update"
        );

        // Optimistic update
        const updatedJobs = [optimisticJob, ...jobs];
        setJobs(updatedJobs);

        // Cache optimistically updated data
        const jobsKey = `jobs_${employerId}`;
        smartStateManager.setCache(jobsKey, updatedJobs, 300000);

        // Actual API call
        const { employerJobBusinessService } = await import(
          "../services/business/EmployerJobBusinessService"
        );
        const newJob = await requestQueue.addUrgent(
          () => employerJobBusinessService.createJobOptimized(jobData),
          {
            cacheKey: `create_job_${tempId}`,
            timeout: 15000,
            retries: 2,
          }
        );

        if (mounted.current) {
          // Replace optimistic job with real job
          const finalJobs = updatedJobs.map((job) =>
            job.id === tempId ? { ...newJob, _isNew: true } : job
          );
          setJobs(finalJobs);

          // Update cache with real data
          smartStateManager.setCache(jobsKey, finalJobs, 300000);
        }

        console.log("✅ [OfflineFirstJobs] Job created successfully");
        return newJob;
      } catch (error) {
        console.error(
          "❌ [OfflineFirstJobs] Failed to create job:",
          error.message
        );

        if (mounted.current) {
          // Remove optimistic job on error
          setJobs(jobs.filter((job) => job.id !== tempId));
          setError({
            message: `Failed to create job: ${error.message}`,
            type: "error",
            action: "create",
          });
        }

        throw error;
      }
    },
    [jobs, employerId]
  );

  /**
   * Update job with optimistic updates
   */
  const updateJob = useCallback(
    async (jobId, updates) => {
      const originalJobs = [...jobs];

      try {
        console.log(
          `🔄 [OfflineFirstJobs] Updating job ${jobId} with optimistic update`
        );

        // Optimistic update
        const updatedJobs = jobs.map((job) =>
          job.id === jobId ? { ...job, ...updates, _isUpdating: true } : job
        );
        setJobs(updatedJobs);

        // Cache optimistically updated data
        const jobsKey = `jobs_${employerId}`;
        smartStateManager.setCache(jobsKey, updatedJobs, 300000);

        // Actual API call
        const { employerJobBusinessService } = await import(
          "../services/business/EmployerJobBusinessService"
        );
        const updatedJob = await requestQueue.addUrgent(
          () => employerJobBusinessService.updateJob(jobId, updates),
          {
            cacheKey: `update_job_${jobId}`,
            timeout: 10000,
            retries: 2,
          }
        );

        if (mounted.current) {
          // Update with server response
          const finalJobs = jobs.map((job) =>
            job.id === jobId ? { ...updatedJob, _isUpdated: true } : job
          );
          setJobs(finalJobs);

          // Update cache with real data
          smartStateManager.setCache(jobsKey, finalJobs, 300000);
        }

        console.log("✅ [OfflineFirstJobs] Job updated successfully");
        return updatedJob;
      } catch (error) {
        console.error(
          `❌ [OfflineFirstJobs] Failed to update job ${jobId}:`,
          error.message
        );

        if (mounted.current) {
          // Rollback on error
          setJobs(originalJobs);
          setError({
            message: `Failed to update job: ${error.message}`,
            type: "error",
            action: "update",
          });
        }

        throw error;
      }
    },
    [jobs, employerId]
  );

  /**
   * Delete job with optimistic updates
   */
  const deleteJob = useCallback(
    async (jobId) => {
      const jobToDelete = jobs.find((job) => job.id === jobId);
      if (!jobToDelete) return;

      try {
        console.log(
          `🗑️ [OfflineFirstJobs] Deleting job ${jobId} with optimistic update`
        );

        // Optimistic removal
        const updatedJobs = jobs.filter((job) => job.id !== jobId);
        setJobs(updatedJobs);

        // Cache updated data
        const jobsKey = `jobs_${employerId}`;
        smartStateManager.setCache(jobsKey, updatedJobs, 300000);

        // Actual API call
        const { employerJobBusinessService } = await import(
          "../services/business/EmployerJobBusinessService"
        );
        await requestQueue.addUrgent(
          () => employerJobBusinessService.deleteJob(jobId),
          {
            cacheKey: `delete_job_${jobId}`,
            timeout: 10000,
            retries: 2,
          }
        );

        console.log("✅ [OfflineFirstJobs] Job deleted successfully");
      } catch (error) {
        console.error(
          `❌ [OfflineFirstJobs] Failed to delete job ${jobId}:`,
          error.message
        );

        if (mounted.current) {
          // Rollback - add job back
          setJobs([...jobs, jobToDelete]);
          setError({
            message: `Failed to delete job: ${error.message}`,
            type: "error",
            action: "delete",
          });
        }

        throw error;
      }
    },
    [jobs, employerId]
  );

  /**
   * Refresh data (user-initiated)
   */
  const refresh = useCallback(async () => {
    try {
      await fetchJobs({ forceRefresh: true, silent: false });
    } catch (error) {
      // Error already handled in fetchJobs
    }
  }, [fetchJobs]);

  /**
   * Background sync
   */
  const startBackgroundSync = useCallback(() => {
    if (backgroundSyncTimer.current) {
      clearInterval(backgroundSyncTimer.current);
    }

    backgroundSyncTimer.current = setInterval(() => {
      if (!isOffline && retryAttempts.current < maxRetries) {
        fetchJobs({ silent: true, useCache: true }).catch(() => {
          // Silent failure for background sync
        });
      }
    }, refreshInterval);
  }, [fetchJobs, isOffline, refreshInterval, maxRetries]);

  /**
   * Retry failed operations
   */
  const retry = useCallback(() => {
    retryAttempts.current = 0;
    setError(null);
    fetchJobs({ forceRefresh: true });
  }, [fetchJobs]);

  // Initial load
  useEffect(() => {
    if (employerId) {
      fetchJobs();
    }
  }, [employerId, fetchJobs]);

  // Background sync
  useEffect(() => {
    startBackgroundSync();
    return () => {
      if (backgroundSyncTimer.current) {
        clearInterval(backgroundSyncTimer.current);
      }
    };
  }, [startBackgroundSync]);

  // Cleanup
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (backgroundSyncTimer.current) {
        clearInterval(backgroundSyncTimer.current);
      }
    };
  }, []);

  return {
    // Core data
    jobs,
    loading,
    error,
    isOffline,
    lastSync,

    // Virtual loading (if enabled)
    ...(enableVirtualLoading ? virtualLoading : {}),

    // Actions
    createJob,
    updateJob,
    deleteJob,
    refresh,
    retry,

    // Stats and monitoring
    stats: {
      totalJobs: jobs.length,
      retryAttempts: retryAttempts.current,
      cacheAge: lastSync ? Date.now() - lastSync.getTime() : null,
      queueStats: requestQueue.getStats(),
      smartStateStats: smartStateManager.getStats(),
    },
  };
};

export default useOfflineFirstJobs;

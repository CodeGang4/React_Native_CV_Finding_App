import React, { createContext, useContext, useEffect, useRef } from "react";
import CentralizedCandidateManager from "../services/utils/CentralizedCandidateManager";

/**
 * ⚡ Global Job Data Provider
 * Khởi tạo và quản lý CentralizedCandidateManager ở app level
 * Đảm bảo ZERO HTTP 429 errors
 */

const JobDataContext = createContext(null);

export const JobDataProvider = ({ children }) => {
  const managerRef = useRef(null);

  useEffect(() => {
    // Initialize centralized manager
    managerRef.current = CentralizedCandidateManager.getInstance();
    console.log("🚀 JobDataProvider: CentralizedCandidateManager initialized");

    // Cleanup on unmount
    return () => {
      if (managerRef.current) {
        managerRef.current.clearCache();
        console.log("🧹 JobDataProvider: Cleanup completed");
      }
    };
  }, []);

  const contextValue = {
    candidateManager: managerRef.current,

    // Helper methods for components
    subscribeToCandidateUpdates: (jobId, callback) => {
      if (managerRef.current) {
        return managerRef.current.subscribe(jobId, callback);
      }
      return () => {}; // noop unsubscribe
    },

    refreshJobCandidates: (jobId) => {
      if (managerRef.current) {
        managerRef.current.refreshJob(jobId);
      }
    },

    getCurrentCandidateCount: (jobId) => {
      if (managerRef.current) {
        return managerRef.current.getCurrentCounts(jobId);
      }
      return { total: 0, submitted: 0, reviewed: 0, interviewing: 0, hired: 0 };
    },

    getManagerStats: () => {
      if (managerRef.current) {
        return managerRef.current.getStats();
      }
      return {
        cachedJobs: 0,
        activeSubscribers: 0,
        pendingUpdates: 0,
        isUpdating: false,
      };
    },
  };

  return (
    <JobDataContext.Provider value={contextValue}>
      {children}
    </JobDataContext.Provider>
  );
};

/**
 * Hook để sử dụng JobDataContext
 */
export const useJobData = () => {
  const context = useContext(JobDataContext);
  if (!context) {
    console.warn("useJobData must be used within JobDataProvider");
    return {
      candidateManager: null,
      subscribeToCandidateUpdates: () => () => {},
      refreshJobCandidates: () => {},
      getCurrentCandidateCount: () => ({
        total: 0,
        submitted: 0,
        reviewed: 0,
        interviewing: 0,
        hired: 0,
      }),
      getManagerStats: () => ({
        cachedJobs: 0,
        activeSubscribers: 0,
        pendingUpdates: 0,
        isUpdating: false,
      }),
    };
  }
  return context;
};

export default JobDataProvider;

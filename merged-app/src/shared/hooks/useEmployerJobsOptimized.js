import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import employerJobBusinessService from "../services/business/EmployerJobBusinessService";
import JobNotificationHelper from "../utils/JobNotificationHelper";
import {
  registerCallbacks,
  getCallbacks,
} from "../services/utils/callbackRegistry";
import { useJobData } from "../contexts/JobDataContext";

/**
 * Enhanced Employer Jobs Hook - ZERO HTTP 429 solution
 * Integrated with CentralizedCandidateManager for optimal performance
 */
export const useEmployerJobsOptimized = () => {
  const { user } = useAuth();
  const {
    candidateManager,
    subscribeToCandidateUpdates,
    refreshJobCandidates,
  } = useJobData();

  const [jobs, setJobs] = useState([]);
  const [jobStats, setJobStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalViews: 0,
    pendingApproval: 0,
  });
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Enhanced stats với real-time candidate counts
  const [enhancedStats, setEnhancedStats] = useState({});

  // Lấy jobs từ API - optimized version
  const fetchJobs = useCallback(
    async (forceRefresh = false) => {
      if (!user?.id) {
        setError("User not logged in");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const jobsData = await employerJobBusinessService.getCompanyJobs(
          user.id,
          forceRefresh
        );

        setJobs(jobsData || []);

        // Generate basic statistics
        const stats = employerJobBusinessService.generateJobStats(
          jobsData || []
        );
        setJobStats(stats);

        // Subscribe all jobs to centralized candidate manager
        if (candidateManager && jobsData?.length > 0) {
          jobsData.forEach((job) => {
            if (job.id) {
              subscribeToCandidateUpdates(job.id, (candidateData) => {
                setEnhancedStats((prev) => ({
                  ...prev,
                  [job.id]: candidateData,
                }));
              });
            }
          });
        }
      } catch (err) {
        console.error("Fetch jobs error:", err);
        setError(err.message || "Failed to fetch jobs");
        setJobs([]);
        setJobStats({
          totalJobs: 0,
          activeJobs: 0,
          totalApplications: 0,
          totalViews: 0,
          pendingApproval: 0,
        });
      } finally {
        setLoading(false);
      }
    },
    [user?.id, candidateManager, subscribeToCandidateUpdates]
  );

  // Tạo job mới
  const createJob = useCallback(
    async (jobData) => {
      if (!user?.id) {
        throw new Error("User not logged in");
      }

      setCreating(true);
      setError(null);

      try {
        const newJob = await employerJobBusinessService.createJob(
          user.id,
          jobData
        );

        if (newJob) {
          // Thêm job mới vào đầu danh sách
          setJobs((prevJobs) => [newJob, ...prevJobs]);

          // Cập nhật stats
          const updatedJobs = [newJob, ...jobs];
          const stats =
            employerJobBusinessService.generateJobStats(updatedJobs);
          setJobStats(stats);

          // AUTO: Gửi notification cho candidates khi có job mới
          JobNotificationHelper.autoNotifyJobPosted(newJob, user.id);

          // Subscribe job mới với candidate manager
          if (candidateManager && newJob.id) {
            subscribeToCandidateUpdates(newJob.id, (candidateData) => {
              setEnhancedStats((prev) => ({
                ...prev,
                [newJob.id]: candidateData,
              }));
            });
          }

          // Đồng bộ với các trang khác
          const callbacks = getCallbacks("jobSyncCallbacks");
          if (callbacks.onJobCreated) {
            callbacks.onJobCreated(newJob);
          }
        }

        return newJob;
      } catch (err) {
        console.error("Create job error:", err);
        setError(err.message || "Failed to create job");
        throw err;
      } finally {
        setCreating(false);
      }
    },
    [user?.id, jobs, candidateManager, subscribeToCandidateUpdates]
  );

  // Tạo job với feedback
  const createJobWithFeedback = useCallback(
    async (jobData) => {
      try {
        const result = await createJob(jobData);
        Alert.alert("Thành công", "Tin tuyển dụng đã được tạo");
        return result;
      } catch (err) {
        Alert.alert("Lỗi", err.message || "Không thể tạo tin tuyển dụng");
        throw err;
      }
    },
    [createJob]
  );

  // Cập nhật job
  const updateJob = useCallback(
    async (jobId, jobData) => {
      if (!user?.id) {
        throw new Error("User not logged in");
      }

      setUpdating(true);
      setError(null);

      try {
        const updatedJob = await employerJobBusinessService.updateJob(
          jobId,
          jobData,
          user.id
        );

        if (updatedJob) {
          // Cập nhật job trong danh sách
          setJobs((prevJobs) =>
            prevJobs.map((job) => (job.id === jobId ? updatedJob : job))
          );

          // Refresh candidate data for updated job
          if (candidateManager) {
            refreshJobCandidates(jobId);
          }

          // Đồng bộ với các trang khác
          const callbacks = getCallbacks("jobSyncCallbacks");
          if (callbacks.onJobUpdated) {
            callbacks.onJobUpdated(updatedJob);
          }
        }

        return updatedJob;
      } catch (err) {
        console.error("Update job error:", err);
        setError(err.message || "Failed to update job");
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    [user?.id, candidateManager, refreshJobCandidates]
  );

  // Cập nhật job với feedback
  const updateJobWithFeedback = useCallback(
    async (jobId, jobData) => {
      try {
        const result = await updateJob(jobId, jobData);
        Alert.alert("Thành công", "Tin tuyển dụng đã được cập nhật");
        return result;
      } catch (err) {
        Alert.alert("Lỗi", err.message || "Không thể cập nhật tin tuyển dụng");
        throw err;
      }
    },
    [updateJob]
  );

  // Xóa job
  const deleteJob = useCallback(
    async (jobId) => {
      if (!user?.id) {
        throw new Error("User not logged in");
      }

      setDeleting(true);
      setError(null);

      try {
        await employerJobBusinessService.deleteJob(jobId, user.id);

        // Force refresh danh sách jobs từ server để đảm bảo consistency
        await fetchJobs(true);

        // Remove from enhanced stats
        setEnhancedStats((prev) => {
          const newStats = { ...prev };
          delete newStats[jobId];
          return newStats;
        });

        // Đồng bộ với các trang khác
        const callbacks = getCallbacks("jobSyncCallbacks");
        if (callbacks.onJobDeleted) {
          callbacks.onJobDeleted(jobId);
        }

        return true;
      } catch (err) {
        console.error("Delete job error:", err);
        setError(err.message || "Failed to delete job");
        throw err;
      } finally {
        setDeleting(false);
      }
    },
    [user?.id, fetchJobs]
  );

  // Xóa job với confirmation
  const deleteJobWithConfirmation = useCallback(
    async (jobId, jobTitle = "tin tuyển dụng") => {
      return new Promise((resolve) => {
        Alert.alert("Xác nhận xóa", `Bạn có chắc muốn xóa ${jobTitle}?`, [
          {
            text: "Hủy",
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: "Xóa",
            style: "destructive",
            onPress: async () => {
              resolve(true);
              try {
                await deleteJob(jobId);
                Alert.alert("Thành công", "Tin tuyển dụng đã được xóa");
              } catch (err) {
                Alert.alert(
                  "Lỗi",
                  err.message || "Không thể xóa tin tuyển dụng"
                );
                console.error("Delete job error after navigation:", err);
              }
            },
          },
        ]);
      });
    },
    [deleteJob]
  );

  // Refresh jobs
  const refreshJobs = useCallback(() => {
    return fetchJobs(true);
  }, [fetchJobs]);

  // Get enhanced candidate count for a specific job
  const getJobCandidateCount = useCallback(
    (jobId) => {
      return enhancedStats[jobId]?.total || 0;
    },
    [enhancedStats]
  );

  // Get all enhanced stats
  const getAllEnhancedStats = useCallback(() => {
    return enhancedStats;
  }, [enhancedStats]);

  // Load jobs khi component mount hoặc user thay đổi
  useEffect(() => {
    if (user?.id) {
      fetchJobs();
    } else {
      setJobs([]);
      setJobStats({
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        totalViews: 0,
        pendingApproval: 0,
      });
      setEnhancedStats({});
      setError(null);
    }
  }, [user?.id, fetchJobs]);

  return {
    // Data
    jobs,
    jobStats,
    enhancedStats,

    // States
    loading,
    creating,
    updating,
    deleting,
    error,

    // Actions
    fetchJobs,
    createJob,
    createJobWithFeedback,
    updateJob,
    updateJobWithFeedback,
    deleteJob,
    deleteJobWithConfirmation,
    refreshJobs,

    // Enhanced features
    getJobCandidateCount,
    getAllEnhancedStats,

    // Computed properties
    hasJobs: jobs.length > 0,
    isEmpty: jobs.length === 0,
  };
};

export default useEmployerJobsOptimized;

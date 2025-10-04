import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import employerJobBusinessService from "../services/business/EmployerJobBusinessService";

/**
 * Custom hook for managing employer jobs
 */
export const useEmployerJobs = () => {
  const { user } = useAuth();
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

  // Lấy jobs từ API
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

        // Generate statistics
        const stats = employerJobBusinessService.generateJobStats(
          jobsData || []
        );
        setJobStats(stats);
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
    [user?.id]
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
    [user?.id, jobs]
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
          jobData
        );

        if (updatedJob) {
          // Cập nhật job trong danh sách
          setJobs((prevJobs) =>
            prevJobs.map((job) => (job.id === jobId ? updatedJob : job))
          );

          // Cập nhật stats
          const updatedJobs = jobs.map((job) =>
            job.id === jobId ? updatedJob : job
          );
          const stats =
            employerJobBusinessService.generateJobStats(updatedJobs);
          setJobStats(stats);
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
    [user?.id, jobs]
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

        return { success: true };
      } catch (err) {
        console.error("Delete job error:", err);
        setError(err.message || "Failed to delete job");
        throw err;
      } finally {
        setDeleting(false);
      }
    },
    [user?.id, jobs]
  );

  // Xóa job với confirmation và feedback
  const deleteJobWithConfirmation = useCallback(
    async (jobId, jobTitle = "tin tuyển dụng này") => {
      return new Promise((resolve, reject) => {
        Alert.alert("Xác nhận xóa", `Bạn có chắc chắn muốn xóa ${jobTitle}?`, [
          {
            text: "Hủy",
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: "Xóa",
            style: "destructive",
            onPress: async () => {
              // Resolve ngay lập tức để parent component có thể navigate
              resolve(true);

              try {
                await deleteJob(jobId);
                Alert.alert("Thành công", "Tin tuyển dụng đã được xóa");
              } catch (err) {
                Alert.alert(
                  "Lỗi",
                  err.message || "Không thể xóa tin tuyển dụng"
                );
                // Note: Không reject ở đây vì đã resolve(true) rồi
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
      setError(null);
    }
  }, [fetchJobs]);

  return {
    // Data
    jobs,
    jobStats,

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

    // Computed properties
    hasJobs: jobs.length > 0,
    isEmpty: jobs.length === 0,
  };
};

export default useEmployerJobs;

import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import {
  handleSaveJob,
  handleUnsaveJob,
  getSavedJobs,
} from "../services/utils/saveJob.js";

/**
 Custom hook quản lý danh sách công việc đã lưu (saved jobs)
 */
export default function useSavedJobs() {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSavedJobs = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const saved = await getSavedJobs(user.id);
      const ids = saved
        .map((item) => item.job_id || item.jobs?.id)
        .filter(Boolean);
      setSavedJobs(ids);
      console.log("Saved jobs loaded:", ids);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const toggleSaveJob = useCallback(
    async (jobId) => {
      if (!user?.id) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập để lưu công việc.");
        return;
      }

      const isSaved = savedJobs.includes(jobId);
      try {
        if (isSaved) {
          await handleUnsaveJob(jobId, user.id);
          setSavedJobs((prev) => prev.filter((id) => id !== jobId));
          console.log(`Unsave job ${jobId}`);
        } else {
          await handleSaveJob(jobId, user.id);
          setSavedJobs((prev) => [...prev, jobId]);
          console.log(`Saved job ${jobId}`);
        }
      } catch (error) {
        console.error("toggleSaveJob error:", error);
        Alert.alert("Lỗi", "Không thể cập nhật trạng thái lưu công việc.");
      }
    },
    [savedJobs, user?.id]
  );

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  return { savedJobs, toggleSaveJob, fetchSavedJobs, loading };
}

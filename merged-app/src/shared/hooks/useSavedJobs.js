import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import {
  handleSaveJob,
  handleUnsaveJob,
  getSavedJobs,
} from "../services/utils/saveJob.js";

/**
 * Custom hook quản lý danh sách công việc đã lưu (saved jobs)
 * Dùng được cho nhiều màn hình (Home, Search, Detail, v.v)
 */
export default function useSavedJobs() {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSavedJobs = async () => {
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
      console.error("Lỗi khi lấy danh sách saved jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveJob = async (job) => {
    if (!user?.id) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để lưu công việc.");
      return;
    }

    const isSaved = savedJobs.includes(job.id);
    try {
      if (isSaved) {
        await handleUnsaveJob(job.id, user.id);
        setSavedJobs((prev) => prev.filter((id) => id !== job.id));
        console.log(`Unsave job ${job.id}`);
      } else {
        await handleSaveJob(job.id, user.id);
        setSavedJobs((prev) => [...prev, job.id]);
        console.log(`Saved job ${job.id}`);
      }
    } catch (error) {
      console.error("toggleSaveJob error:", error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái lưu công việc.");
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, [user?.id]);

  return { savedJobs, toggleSaveJob, fetchSavedJobs, loading };
}

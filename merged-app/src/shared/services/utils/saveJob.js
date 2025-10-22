import JobApiService from "../api/JobApiService";
import { Alert } from "react-native";

export async function handleSaveJob(jobId, candidateId) {
  try {
    const response = await JobApiService.saveJob(jobId, candidateId);
    console.log("SAVE JOB RESPONSE:", response);

    if (Array.isArray(response) && response.length > 0) {
      Alert.alert("Thành công", "Đã lưu công việc vào danh sách yêu thích!");
    } else {
      Alert.alert("Thông báo", "Không thể lưu công việc (phản hồi trống).");
    }
    return response;
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      "Không thể lưu công việc. Vui lòng thử lại sau.";
    Alert.alert("Lỗi", msg);
    throw error;
  }
}

export async function handleUnsaveJob(jobId, candidateId) {
  try {
    const response = await JobApiService.unsaveJob(jobId, candidateId);
    console.log("UNSAVE JOB RESPONSE:", response);

    if (response?.deleted_record) {
      Alert.alert("Thành công", "Đã xoá công việc khỏi danh sách yêu thích!");
    } else {
      Alert.alert("Thông báo", response?.message || "Không thể xoá công việc.");
    }
    return response;
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      "Không thể xoá công việc. Vui lòng thử lại sau.";
    Alert.alert("Lỗi", msg);
    throw error;
  }
}

export async function getSavedJobs(candidateId) {
  const response = await JobApiService.getSavedJobs(candidateId);
  if (!Array.isArray(response)) return [];

  return response.map((item) => ({
    job_id: item.job_id || item.jobs?.id,
  }));
}


import JobApiService from "../api/JobApiService";
import { Alert } from "react-native";

export async function handleSaveJob(job, candidateId) {
  try {
    const response = await JobApiService.saveJob(job.id, candidateId);
    if (response?.success) {
      Alert.alert("Thành công", "Đã lưu công việc vào danh sách yêu thích!");
    } else {
      Alert.alert("Thông báo", response?.message || "Công việc đã được lưu trước đó.");
    }
  } catch (error) {
    console.error("Lỗi khi lưu job:", error);
    Alert.alert("Lỗi", "Không thể lưu công việc. Vui lòng thử lại sau.");
  }
}

export async function handleUnsaveJob(job, candidateId) {
  try {
    const response = await JobApiService.unsaveJob(job.id, candidateId);
    if (response?.success) {
      Alert.alert("Thành công", "Đã xoá công việc khỏi danh sách yêu thích!");
    }
  } catch (error) {
    console.error("Lỗi khi xoá job:", error);
    Alert.alert("Lỗi", "Không thể xoá công việc. Vui lòng thử lại sau.");
  }
}

export async function getSavedJobs(candidateId) {
  try {
    const response = await JobApiService.getSavedJobs(candidateId);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error("Lỗi khi tải danh sách công việc đã lưu:", error);
    return [];
  }
}

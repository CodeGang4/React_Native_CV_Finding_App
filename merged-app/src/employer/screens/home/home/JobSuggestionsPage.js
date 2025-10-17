import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
  Alert,
} from "react-native";
import CommonHeader from "../../../components/common/CommonHeader";
import JobCard from "../../../components/home/cards/JobCard";
import { useHomeData } from "../../../../shared/services/HomeDataManager";
import { useAuth } from "../../../../shared/contexts/AuthContext";
import HomeApiService from "../../../../shared/services/api/HomeApiService";
import JobDetailScreen from "../../shared/JobDetailScreen";

const jobSuggestions = [
  {
    id: 1,
    title: "Java Developer",
    company: "Công ty TNHH Thu phí tự động VETC",
    salary: "Tới 1,600 USD",
    location: "Hà Nội",
    logo: "VETC",
    logoColor: "#00b14f",
    verified: true,
    backgroundColor: "#e8f5e8",
  },
  {
    id: 2,
    title:
      "Junior Android Developer – Hà Nội | Thu Nhập 15-25 Triệu|Phát Triể...",
    company: "Công ty Phát triển giải pháp và Công ng...",
    salary: "15 - 25 triệu",
    location: "Hà Nội",
    logo: "🔥",
    logoColor: "#ff4444",
    verified: false,
    backgroundColor: "#fff",
  },
  {
    id: 3,
    title: "Front End Developer (Typescript/ Vue/Javascript/Canvas HTML5/En...",
    company: "ROWBOAT SOFTWARE",
    salary: "500 - 800 USD",
    location: "Hồ Chí Minh",
    logo: "⚙️",
    logoColor: "#007acc",
    verified: false,
    backgroundColor: "#fff",
  },
  {
    id: 4,
    title: "ReactJs Developer",
    company: "Công ty Cổ phần Công nghệ Tài chính G...",
    salary: "$ Thỏa thuận",
    location: "Hà Nội",
    logo: "GO",
    logoColor: "#0066cc",
    verified: true,
    backgroundColor: "#e8f5e8",
  },
  {
    id: 5,
    title: "Software Developer",
    company: "GOOD FOOD CO., LTD",
    salary: "20 - 25 triệu",
    location: "Hồ Chí Minh",
    logo: "GF",
    logoColor: "#cc0000",
    verified: true,
    backgroundColor: "#fff",
  },
];

export default function JobSuggestionsPage({ onBack }) {
  const { user } = useAuth();
  const { data, loading, error } = useHomeData();
  const { jobs } = data;
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const handleBackPress = () => {
    if (onBack && typeof onBack === "function") {
      onBack();
    }
  };

  const handleJobPress = (job) => {
    console.log("[JobSuggestionsPage] Job pressed:", job.id);
    setSelectedJob(job);
    setShowJobDetail(true);
  };

  const handleJobDetailBack = () => {
    setShowJobDetail(false);
    setSelectedJob(null);
  };

  // Check if current user owns the job
  const isJobOwner = (job) => {
    return user && job && user.id === job.employer_id;
  };

  const handleJobEdit = async (updatedJob) => {
    try {
      if (!isJobOwner(selectedJob)) {
        Alert.alert("Lỗi", "Bạn không có quyền chỉnh sửa tin tuyển dụng này");
        return;
      }

      await HomeApiService.updateJob(updatedJob.id, updatedJob);
      setSelectedJob(updatedJob);
      Alert.alert("Thành công", "Đã cập nhật tin tuyển dụng");
    } catch (error) {
      console.error("[JobSuggestionsPage] Edit job error:", error);
      Alert.alert("Lỗi", error.message || "Không thể cập nhật tin tuyển dụng");
    }
  };

  const handleJobDelete = async (jobId) => {
    try {
      if (!isJobOwner(selectedJob)) {
        Alert.alert("Lỗi", "Bạn không có quyền xóa tin tuyển dụng này");
        return;
      }

      await HomeApiService.deleteJob(jobId);
      Alert.alert("Thành công", "Đã xóa tin tuyển dụng", [
        {
          text: "OK",
          onPress: () => {
            setShowJobDetail(false);
            setSelectedJob(null);
          },
        },
      ]);
    } catch (error) {
      console.error("[JobSuggestionsPage] Delete job error:", error);
      Alert.alert("Lỗi", error.message || "Không thể xóa tin tuyển dụng");
    }
  };

  // Show job detail screen if job is selected
  if (showJobDetail && selectedJob) {
    const canEdit = isJobOwner(selectedJob);

    return (
      <JobDetailScreen
        job={selectedJob}
        onBack={handleJobDetailBack}
        onEdit={canEdit ? handleJobEdit : null}
        onDelete={canEdit ? handleJobDelete : null}
        canViewCandidates={canEdit}
      />
    );
  }

  // Sử dụng toàn bộ jobs từ database, không trộn với topJobs để tránh duplicate
  const displayJobs = error.jobs ? jobSuggestions : jobs || [];

  return (
    <View style={styles.container}>
      <CommonHeader
        title="Gợi ý việc làm phù hợp"
        onBack={handleBackPress}
        showAI={false}
      />

      {loading.jobs ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00b14f" />
          <Text style={styles.loadingText}>Đang tải dữ liệu việc làm...</Text>
        </View>
      ) : (
        <ScrollView style={styles.jobList} showsVerticalScrollIndicator={false}>
          {error.jobs && (
            <Text style={styles.errorText}>
              Không thể tải dữ liệu từ server, hiển thị dữ liệu mẫu
            </Text>
          )}
          {displayJobs.map((job, index) => (
            <JobCard
              key={job.id || `fallback-${index}`}
              item={job}
              onPress={handleJobPress}
              showLogoColor={true}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  jobList: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    backgroundColor: "#fff3cd",
    color: "#856404",
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 8,
    textAlign: "center",
  },
});

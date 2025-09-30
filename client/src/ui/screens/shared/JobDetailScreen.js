import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import JobDetailHeader from "../../components/jobDetail/JobDetailHeader";
import JobOverviewSection from "../../components/jobDetail/JobOverviewSection";
import ApplicantsList from "../../components/jobDetail/ApplicantsList";
import InterviewNotificationModal from "../../components/modals/InterviewNotificationModal";
import EditJobModal from "../../components/jobs/EditJobModal";

// A shared Job Detail screen for both Account and JobPosting flows
// Props: { job, onBack, onEdit, onDelete, applicants? }
export default function JobDetailScreen({
  job,
  onBack,
  onEdit,
  onDelete,
  applicants: inputApplicants,
}) {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  const applicants = inputApplicants || [
    {
      id: 1,
      name: "Nguyễn Văn A",
      status: "pending",
      experience: "2 năm",
      rating: 4.5,
      avatar: "👤",
      appliedDate: "10/09/2025",
      email: "a@email.com",
      phone: "0123456789",
    },
    {
      id: 2,
      name: "Trần Thị B",
      status: "shortlisted",
      experience: "1.5 năm",
      rating: 4.2,
      avatar: "👤",
      appliedDate: "08/09/2025",
      email: "b@email.com",
      phone: "0987654321",
    },
    {
      id: 3,
      name: "Lê Văn C",
      status: "rejected",
      experience: "6 tháng",
      rating: 3.8,
      avatar: "👤",
      appliedDate: "07/09/2025",
      email: "c@email.com",
      phone: "0456789123",
    },
  ];

  const handleDelete = () => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa tin tuyển dụng này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => onDelete && onDelete(job.id),
        },
      ]
    );
  };

  const handleSubmitEdit = (updatedJob) => {
    onEdit && onEdit(updatedJob);
    setShowEditModal(false);
    Alert.alert("Thành công", "Đã cập nhật thông tin tin tuyển dụng!");
  };

  const TabButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {title}
      </Text>
      {isActive && <View style={styles.activeTabIndicator} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <JobDetailHeader job={job} onBack={onBack} />
      <View style={styles.tabContainer}>
        <TabButton
          title="Tổng quan"
          isActive={activeTab === "overview"}
          onPress={() => setActiveTab("overview")}
        />
        <TabButton
          title="Ứng viên"
          isActive={activeTab === "applicants"}
          onPress={() => setActiveTab("applicants")}
        />
      </View>
      <View style={styles.content}>
        {activeTab === "overview" ? (
          <JobOverviewSection
            job={job}
            onEdit={() => setShowEditModal(true)}
            onDelete={handleDelete}
          />
        ) : (
          <ApplicantsList
            applicants={applicants}
            onOpenInterview={() => setShowInterviewModal(true)}
            onPressCandidate={(cand) =>
              navigation.navigate("CandidateDetail", { candidate: cand })
            }
          />
        )}
      </View>
      <EditJobModal
        visible={showEditModal}
        job={job}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleSubmitEdit}
      />
      <InterviewNotificationModal
        visible={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        onSend={() => {
          setShowInterviewModal(false);
          Alert.alert("Thành công", "Đã gửi thông báo phỏng vấn!");
        }}
        applicants={applicants.filter(
          (a) => a.status === "pending" || a.status === "shortlisted"
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    position: "relative",
  },
  activeTabButton: { borderBottomWidth: 0 },
  tabText: { fontSize: 14, color: "#666", fontWeight: "500" },
  activeTabText: { color: "#4CAF50", fontWeight: "bold" },
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    width: "100%",
    backgroundColor: "#4CAF50",
  },
  content: { flex: 1 },
});

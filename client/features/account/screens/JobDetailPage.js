import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import InterviewNotificationModal from "../../../shared/components/modals/InterviewNotificationModal";
import JobDetailHeader from "../components/JobDetailHeader";
import JobOverviewSection from "../components/JobOverviewSection";
import ApplicantsList from "../components/ApplicantsList";
import EditJobModal from "../../jobPosting/components/EditJobModal";

export default function JobDetailPage({ job, onBack, onEdit, onDelete }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  const applicants = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      status: "pending",
      experience: "2 năm",
      rating: 4.5,
      avatar: "👤",
      appliedDate: "10/09/2025",
      email: "nguyenvana@email.com",
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
      email: "tranthib@email.com",
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
      email: "levanc@email.com",
      phone: "0456789123",
    },
    {
      id: 4,
      name: "Phạm Thị D",
      status: "pending",
      experience: "3 năm",
      rating: 4.7,
      avatar: "👤",
      appliedDate: "09/09/2025",
      email: "phamthid@email.com",
      phone: "0321654987",
    },
  ];

  const handleBackPress = () => onBack && onBack();

  const handleDeleteJob = () => {
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

  const renderOverviewTab = () => (
    <JobOverviewSection
      job={job}
      onEdit={() => setShowEditModal(true)}
      onDelete={handleDeleteJob}
    />
  );

  const renderApplicantsTab = () => (
    <ApplicantsList
      applicants={applicants}
      onOpenInterview={() => setShowInterviewModal(true)}
    />
  );

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
      <JobDetailHeader job={job} onBack={handleBackPress} />
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
        {activeTab === "overview" ? renderOverviewTab() : renderApplicantsTab()}
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

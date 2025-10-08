import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import JobDetailHeader from "../../components/jobDetail/JobDetailHeader";
import JobOverviewSection from "../../components/jobDetail/JobOverviewSection";
import ApplicantsList from "../../components/jobDetail/ApplicantsList";
import InterviewNotificationModal from "../../components/modals/InterviewNotificationModal";
import EditJobModal from "../../components/jobs/EditJobModal";
import { useJobCandidates } from "../../../shared/hooks/useJobCandidates";
import { useJobViews } from "../../../shared/hooks/useJobViews";

// A shared Job Detail screen for both Account and JobPosting flows
// Props: { job, onBack, onEdit, onDelete }
export default function JobDetailScreen({
  job,
  onBack,
  onEdit,
  onDelete,
  loading = false,
}) {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  // Use real candidates data from backend
  const {
    candidates: applicants,
    stats: candidatesStats,
    loading: candidatesLoading,
    refreshing: candidatesRefreshing,
    error: candidatesError,
    refreshCandidates,
  } = useJobCandidates(job?.id);

  // Handle job views increment
  const { views } = useJobViews(job?.id, job?.views);

  // Filter candidates for interview modal
  const interviewCandidates = applicants.filter(
    (a) => a.status === "pending" || a.status === "shortlisted"
  );

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

  const handleSubmitEdit = async (updatedJob) => {
    try {
      (await onEdit) && onEdit(updatedJob);
      setShowEditModal(false);
    } catch (error) {
      // Error được handle trong parent component
      console.error("Edit job error in JobDetailScreen:", error);
    }
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
            views={views}
            candidatesStats={candidatesStats}
            onEdit={() => setShowEditModal(true)}
            onDelete={handleDelete}
          />
        ) : (
          <ApplicantsList
            applicants={applicants}
            loading={candidatesLoading}
            refreshing={candidatesRefreshing}
            error={candidatesError}
            onOpenInterview={() => setShowInterviewModal(true)}
            onPressCandidate={(cand) =>
              navigation.navigate("CandidateDetail", { candidate: cand })
            }
            onRefresh={refreshCandidates}
          />
        )}
      </View>
      <EditJobModal
        visible={showEditModal}
        job={job}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleSubmitEdit}
        loading={loading}
      />
      <InterviewNotificationModal
        visible={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        onSend={() => {
          setShowInterviewModal(false);
          Alert.alert("Thành công", "Đã gửi thông báo phỏng vấn!");
        }}
        applicants={interviewCandidates}
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

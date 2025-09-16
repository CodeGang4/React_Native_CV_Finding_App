import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import InterviewNotificationModal from "./InterviewNotificationModal";

const { width } = Dimensions.get("window");

export default function JobDetailPage({ job, onBack, onEdit, onDelete }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    salary: "",
    location: "",
    experience: "",
    deadline: "",
    jobType: "",
    description: "",
    requirements: "",
    benefits: "",
    skills: "",
  });

  // Sample applicants data
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

  // Initialize edit form data
  const initializeEditForm = () => {
    setEditFormData({
      title: job.title,
      salary: job.salary,
      location: job.location,
      experience: job.experience,
      deadline: job.deadline,
      jobType: job.jobType,
      description: job.description,
      requirements: Array.isArray(job.requirements)
        ? job.requirements.join("\n")
        : "",
      benefits: Array.isArray(job.benefits) ? job.benefits.join("\n") : "",
      skills: Array.isArray(job.skills) ? job.skills.join(", ") : "",
    });
  };

  const handleBackPress = () => {
    if (onBack) onBack();
  };

  const handleEditJob = () => {
    initializeEditForm();
    setShowEditModal(true);
  };

  const handleSaveJob = () => {
    const updatedJob = {
      ...job,
      ...editFormData,
      requirements: editFormData.requirements
        .split("\n")
        .filter((req) => req.trim()),
      benefits: editFormData.benefits
        .split("\n")
        .filter((benefit) => benefit.trim()),
      skills: editFormData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill),
    };

    if (onEdit) onEdit(updatedJob);
    setShowEditModal(false);
    Alert.alert("Thành công", "Đã cập nhật thông tin tin tuyển dụng!");
  };

  const handleDeleteJob = () => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa tin tuyển dụng này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            if (onDelete) onDelete(job.id);
          },
        },
      ]
    );
  };

  const handleSendInterview = () => {
    setShowInterviewModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#FFA500";
      case "shortlisted":
        return "#4CAF50";
      case "rejected":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xét duyệt";
      case "shortlisted":
        return "Được chọn";
      case "rejected":
        return "Từ chối";
      default:
        return status;
    }
  };

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Job Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialIcons name="visibility" size={24} color="#2196F3" />
          <Text style={styles.statNumber}>{job.views}</Text>
          <Text style={styles.statLabel}>Lượt xem</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="people" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{job.applications}</Text>
          <Text style={styles.statLabel}>Ứng viên</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="star" size={24} color="#FF9800" />
          <Text style={styles.statNumber}>{job.shortlisted}</Text>
          <Text style={styles.statLabel}>Được chọn</Text>
        </View>
      </View>

      {/* Job Information */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Thông tin công việc</Text>

        <View style={styles.infoRow}>
          <MaterialIcons name="work" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Vị trí</Text>
            <Text style={styles.infoValue}>{job.title}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="attach-money" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Mức lương</Text>
            <Text style={styles.infoValue}>{job.salary}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Địa điểm</Text>
            <Text style={styles.infoValue}>{job.location}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="schedule" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Hạn nộp</Text>
            <Text style={styles.infoValue}>{job.deadline}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="business-center" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Kinh nghiệm</Text>
            <Text style={styles.infoValue}>{job.experience}</Text>
          </View>
        </View>
      </View>

      {/* Job Description */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Mô tả công việc</Text>
        <Text style={styles.descriptionText}>{job.description}</Text>
      </View>

      {/* Requirements */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Yêu cầu công việc</Text>
        {job.requirements &&
          job.requirements.map((req, index) => (
            <View key={index} style={styles.requirementItem}>
              <Text style={styles.requirementBullet}>•</Text>
              <Text style={styles.requirementText}>{req}</Text>
            </View>
          ))}
      </View>

      {/* Benefits */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Quyền lợi</Text>
        {job.benefits &&
          job.benefits.map((benefit, index) => (
            <View key={index} style={styles.requirementItem}>
              <Text style={styles.requirementBullet}>•</Text>
              <Text style={styles.requirementText}>{benefit}</Text>
            </View>
          ))}
      </View>

      {/* Skills */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Kỹ năng yêu cầu</Text>
        <View style={styles.skillsContainer}>
          {job.skills &&
            job.skills.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.editJobButton} onPress={handleEditJob}>
          <MaterialIcons name="edit" size={20} color="#fff" />
          <Text style={styles.editJobButtonText}>Chỉnh sửa tin</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteJobButton}
          onPress={handleDeleteJob}
        >
          <MaterialIcons name="delete" size={20} color="#fff" />
          <Text style={styles.deleteJobButtonText}>Xóa tin</Text>
        </TouchableOpacity>
      </View>

      {/* Thêm khoảng trắng cuối */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderApplicantsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>
        Danh sách ứng viên ({applicants.length})
      </Text>

      {applicants.map((applicant) => (
        <View key={applicant.id} style={styles.applicantCard}>
          <View style={styles.applicantHeader}>
            <View style={styles.applicantAvatar}>
              <Text style={styles.avatarText}>{applicant.avatar}</Text>
            </View>
            <View style={styles.applicantInfo}>
              <Text style={styles.applicantName}>{applicant.name}</Text>
              <Text style={styles.applicantExperience}>
                Kinh nghiệm: {applicant.experience}
              </Text>
              <Text style={styles.applicantDate}>
                Ứng tuyển: {applicant.appliedDate}
              </Text>
            </View>
            <View style={styles.applicantStatus}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(applicant.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {getStatusText(applicant.status)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.applicantActions}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="email" size={16} color="#4CAF50" />
              <Text style={styles.actionText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="phone" size={16} color="#2196F3" />
              <Text style={styles.actionText}>Gọi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSendInterview}
            >
              <MaterialIcons name="event" size={16} color="#FF9800" />
              <Text style={styles.actionText}>Phỏng vấn</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const TabButton = ({ id, title, isActive, onPress }) => (
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
      {/* Header - Bỏ nút Sửa và Xóa */}
      <LinearGradient colors={["#4CAF50", "#45a049"]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Thêm icon menu 3 chấm để có thể mở rộng sau này */}
          <TouchableOpacity style={styles.menuButton}>
            <MaterialIcons name="more-vert" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.jobHeaderInfo}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.companyName}>{job.company}</Text>

          <View style={styles.jobStats}>
            <View style={styles.statItem}>
              <MaterialIcons name="attach-money" size={20} color="#fff" />
              <Text style={styles.statValue}>{job.salary}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="location-on" size={20} color="#fff" />
              <Text style={styles.statValue}>{job.location}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="schedule" size={20} color="#fff" />
              <Text style={styles.statValue}>{job.deadline}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TabButton
          id="overview"
          title="Tổng quan"
          isActive={activeTab === "overview"}
          onPress={() => setActiveTab("overview")}
        />
        <TabButton
          id="applicants"
          title="Ứng viên"
          isActive={activeTab === "applicants"}
          onPress={() => setActiveTab("applicants")}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === "overview" ? renderOverviewTab() : renderApplicantsTab()}
      </View>

      {/* Edit Job Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa tin tuyển dụng</Text>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tên vị trí</Text>
                <TextInput
                  style={styles.textInput}
                  value={editFormData.title}
                  onChangeText={(text) =>
                    setEditFormData({ ...editFormData, title: text })
                  }
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Mức lương</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editFormData.salary}
                    onChangeText={(text) =>
                      setEditFormData({ ...editFormData, salary: text })
                    }
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                  <Text style={styles.inputLabel}>Địa điểm</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editFormData.location}
                    onChangeText={(text) =>
                      setEditFormData({ ...editFormData, location: text })
                    }
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Kinh nghiệm</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editFormData.experience}
                    onChangeText={(text) =>
                      setEditFormData({ ...editFormData, experience: text })
                    }
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                  <Text style={styles.inputLabel}>Hạn nộp</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editFormData.deadline}
                    onChangeText={(text) =>
                      setEditFormData({ ...editFormData, deadline: text })
                    }
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mô tả công việc</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={editFormData.description}
                  onChangeText={(text) =>
                    setEditFormData({ ...editFormData, description: text })
                  }
                  multiline
                  numberOfLines={5}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Yêu cầu (mỗi yêu cầu 1 dòng)
                </Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={editFormData.requirements}
                  onChangeText={(text) =>
                    setEditFormData({ ...editFormData, requirements: text })
                  }
                  multiline
                  numberOfLines={5}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Quyền lợi (mỗi quyền lợi 1 dòng)
                </Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={editFormData.benefits}
                  onChangeText={(text) =>
                    setEditFormData({ ...editFormData, benefits: text })
                  }
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Kỹ năng (phân tách bằng dấu phẩy)
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={editFormData.skills}
                  onChangeText={(text) =>
                    setEditFormData({ ...editFormData, skills: text })
                  }
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSaveJob}
              >
                <Text style={styles.submitButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Interview Notification Modal */}
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
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  jobHeaderInfo: {
    alignItems: "center",
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  companyName: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 16,
  },
  jobStats: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statValue: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 4,
    fontWeight: "500",
  },
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
  activeTabButton: {
    borderBottomWidth: 0,
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    width: "100%",
    backgroundColor: "#4CAF50",
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  infoSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  requirementBullet: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
    color: "#4CAF50",
  },
  requirementText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    flex: 1,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillTag: {
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  // Action Buttons - VỊ TRÍ MỚI CHO NÚT SỬA VÀ XÓA
  actionButtonsContainer: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 20,
    gap: 12,
  },
  editJobButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editJobButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  deleteJobButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F44336",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteJobButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  // Applicants Tab Styles
  applicantCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  applicantHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  applicantAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  applicantExperience: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  applicantDate: {
    fontSize: 12,
    color: "#999",
  },
  applicantStatus: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  applicantActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
  actionText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    fontWeight: "500",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: width - 32,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    maxHeight: 500,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: "row",
    marginBottom: 0,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
  },
});

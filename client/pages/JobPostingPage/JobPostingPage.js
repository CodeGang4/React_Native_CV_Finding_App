import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  Image,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";

export default function JobPostingPage() {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: "React Native Developer",
      status: "active",
      applications: 25,
      views: 150,
      createdDate: "15/09/2025",
      deadline: "30/09/2025",
      salary: "15-25 triệu",
      location: "Hà Nội",
    },
    {
      id: 2,
      title: "Senior PHP Developer",
      status: "expired",
      applications: 18,
      views: 89,
      createdDate: "10/09/2025",
      deadline: "25/09/2025",
      salary: "20-30 triệu",
      location: "TP.HCM",
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEmailTemplateModal, setShowEmailTemplateModal] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState([
    {
      id: 1,
      name: "Mẫu thông báo phỏng vấn",
      subject: "Thông báo lịch phỏng vấn - {position}",
      content: "Chào {candidate_name},\n\nChúng tôi rất vui mừng thông báo...",
      uploadDate: "15/09/2025",
    },
    {
      id: 2,
      name: "Mẫu chúc mừng trúng tuyển",
      subject: "Chúc mừng bạn đã trúng tuyển vị trí {position}",
      content: "Chào {candidate_name},\n\nChúc mừng bạn đã được chọn...",
      uploadDate: "12/09/2025",
    },
  ]);

  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    requirements: "",
    benefits: "",
    salary: "",
    location: "",
    experience: "",
    deadline: "",
    skills: "",
  });

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    content: "",
  });

  const handleCreateJob = () => {
    if (!newJob.title || !newJob.salary || !newJob.location) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const job = {
      id: Date.now(),
      ...newJob,
      status: "active",
      applications: 0,
      views: 0,
      createdDate: new Date().toLocaleDateString("vi-VN"),
    };

    setJobs([job, ...jobs]);
    setNewJob({
      title: "",
      description: "",
      requirements: "",
      benefits: "",
      salary: "",
      location: "",
      experience: "",
      deadline: "",
      skills: "",
    });
    setShowCreateModal(false);
    Alert.alert("Thành công", "Đã đăng tin tuyển dụng mới!");
  };

  const handleUploadTemplate = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        Alert.alert("Thành công", "Đã tải lên mẫu email thành công!");
        // Simulate adding template
        const template = {
          id: Date.now(),
          name: result.assets[0].name,
          subject: "Subject từ file",
          content: "Nội dung từ file...",
          uploadDate: new Date().toLocaleDateString("vi-VN"),
        };
        setEmailTemplates([template, ...emailTemplates]);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải lên file");
    }
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin mẫu email");
      return;
    }

    const template = {
      id: Date.now(),
      ...newTemplate,
      uploadDate: new Date().toLocaleDateString("vi-VN"),
    };

    setEmailTemplates([template, ...emailTemplates]);
    setNewTemplate({ name: "", subject: "", content: "" });
    Alert.alert("Thành công", "Đã tạo mẫu email mới!");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#4CAF50";
      case "expired":
        return "#F44336";
      case "draft":
        return "#FF9800";
      default:
        return "#666";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Đang tuyển";
      case "expired":
        return "Hết hạn";
      case "draft":
        return "Bản nháp";
      default:
        return status;
    }
  };

  const renderJobItem = ({ item }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <View style={styles.jobMeta}>
            <Text style={styles.jobMetaText}>{item.salary}</Text>
            <Text style={styles.jobMetaDot}>•</Text>
            <Text style={styles.jobMetaText}>{item.location}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.jobStats}>
        <View style={styles.statItem}>
          <MaterialIcons name="visibility" size={16} color="#666" />
          <Text style={styles.statText}>{item.views} lượt xem</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="people" size={16} color="#666" />
          <Text style={styles.statText}>{item.applications} ứng viên</Text>
        </View>
      </View>

      <View style={styles.jobFooter}>
        <Text style={styles.jobDate}>Đăng: {item.createdDate}</Text>
        <Text style={styles.jobDeadline}>Hạn: {item.deadline}</Text>
      </View>

      <View style={styles.jobActions}>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="edit" size={16} color="#4CAF50" />
          <Text style={styles.actionText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="people" size={16} color="#2196F3" />
          <Text style={styles.actionText}>Ứng viên</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="bar-chart" size={16} color="#FF9800" />
          <Text style={styles.actionText}>Thống kê</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTemplateItem = ({ item }) => (
    <View style={styles.templateCard}>
      <View style={styles.templateHeader}>
        <MaterialIcons name="email" size={24} color="#4CAF50" />
        <View style={styles.templateInfo}>
          <Text style={styles.templateName}>{item.name}</Text>
          <Text style={styles.templateSubject}>{item.subject}</Text>
          <Text style={styles.templateDate}>Tạo: {item.uploadDate}</Text>
        </View>
        <TouchableOpacity style={styles.templateAction}>
          <MaterialIcons name="more-vert" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      <Text style={styles.templateContent} numberOfLines={3}>
        {item.content}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#4CAF50", "#45a049"]} style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý tuyển dụng</Text>
        <Text style={styles.headerSubtitle}>Đăng tin và quản lý email mẫu</Text>
      </LinearGradient>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialIcons name="work" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{jobs.length}</Text>
          <Text style={styles.statLabel}>Tin đăng</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="people" size={24} color="#2196F3" />
          <Text style={styles.statNumber}>
            {jobs.reduce((sum, job) => sum + job.applications, 0)}
          </Text>
          <Text style={styles.statLabel}>Ứng viên</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="email" size={24} color="#FF9800" />
          <Text style={styles.statNumber}>{emailTemplates.length}</Text>
          <Text style={styles.statLabel}>Mẫu email</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setShowCreateModal(true)}
        >
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Đăng tin mới</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setShowEmailTemplateModal(true)}
        >
          <MaterialIcons name="email" size={20} color="#4CAF50" />
          <Text style={styles.secondaryButtonText}>Quản lý email mẫu</Text>
        </TouchableOpacity>
      </View>

      {/* Jobs List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tin tuyển dụng gần đây</Text>
        <FlatList
          data={jobs}
          renderItem={renderJobItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.jobsList}
        />
      </View>

      {/* Create Job Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đăng tin tuyển dụng mới</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tên vị trí *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newJob.title}
                  onChangeText={(text) => setNewJob({ ...newJob, title: text })}
                  placeholder="VD: React Native Developer"
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Mức lương *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newJob.salary}
                    onChangeText={(text) =>
                      setNewJob({ ...newJob, salary: text })
                    }
                    placeholder="VD: 15-25 triệu"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                  <Text style={styles.inputLabel}>Địa điểm *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newJob.location}
                    onChangeText={(text) =>
                      setNewJob({ ...newJob, location: text })
                    }
                    placeholder="VD: Hà Nội"
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Kinh nghiệm</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newJob.experience}
                    onChangeText={(text) =>
                      setNewJob({ ...newJob, experience: text })
                    }
                    placeholder="VD: 2-3 năm"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                  <Text style={styles.inputLabel}>Hạn nộp</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newJob.deadline}
                    onChangeText={(text) =>
                      setNewJob({ ...newJob, deadline: text })
                    }
                    placeholder="VD: 30/09/2025"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mô tả công việc</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={newJob.description}
                  onChangeText={(text) =>
                    setNewJob({ ...newJob, description: text })
                  }
                  placeholder="Nhập mô tả chi tiết về công việc..."
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Yêu cầu công việc</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={newJob.requirements}
                  onChangeText={(text) =>
                    setNewJob({ ...newJob, requirements: text })
                  }
                  placeholder="Nhập các yêu cầu đối với ứng viên..."
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quyền lợi</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={newJob.benefits}
                  onChangeText={(text) =>
                    setNewJob({ ...newJob, benefits: text })
                  }
                  placeholder="Nhập các quyền lợi..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Kỹ năng yêu cầu</Text>
                <TextInput
                  style={styles.textInput}
                  value={newJob.skills}
                  onChangeText={(text) =>
                    setNewJob({ ...newJob, skills: text })
                  }
                  placeholder="VD: React Native, JavaScript, API..."
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateJob}
              >
                <Text style={styles.submitButtonText}>Đăng tin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Email Template Modal */}
      <Modal
        visible={showEmailTemplateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEmailTemplateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quản lý email mẫu</Text>
              <TouchableOpacity
                onPress={() => setShowEmailTemplateModal(false)}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.templateActions}>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleUploadTemplate}
              >
                <MaterialIcons name="upload-file" size={20} color="#4CAF50" />
                <Text style={styles.uploadButtonText}>Tải lên file</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton}>
                <MaterialIcons name="add" size={20} color="#fff" />
                <Text style={styles.createButtonText}>Tạo mới</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={emailTemplates}
              renderItem={renderTemplateItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.templatesList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
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
  actionContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  section: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  jobsList: {
    paddingBottom: 20,
  },
  jobCard: {
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
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  jobMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  jobMetaText: {
    fontSize: 14,
    color: "#666",
  },
  jobMetaDot: {
    fontSize: 14,
    color: "#666",
    marginHorizontal: 8,
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
  jobStats: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  jobFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  jobDate: {
    fontSize: 12,
    color: "#999",
  },
  jobDeadline: {
    fontSize: 12,
    color: "#F44336",
    fontWeight: "500",
  },
  jobActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
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
  // Template Styles
  templateCard: {
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
  templateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  templateInfo: {
    flex: 1,
    marginLeft: 12,
  },
  templateName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  templateSubject: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  templateDate: {
    fontSize: 12,
    color: "#999",
  },
  templateAction: {
    padding: 4,
  },
  templateContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  templateActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  uploadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  createButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  templatesList: {
    paddingHorizontal: 20,
    maxHeight: 400,
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
    width: "90%",
    maxHeight: "85%",
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
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: "row",
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
    height: 80,
    textAlignVertical: "top",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    alignItems: "center",
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

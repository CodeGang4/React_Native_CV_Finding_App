import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import CommonHeader from "../../../../shared/components/common/CommonHeader";
import { TAB_BAR_PADDING } from "../../../../shared/constants/layout";
import InterviewNotificationModal from "../../../../shared/components/modals/InterviewNotificationModal";
import EditJobModal from "../../components/EditJobModal";

export default function JobDetailPage({ route, navigation }) {
  const jobParam = route?.params?.job || null;
  const onEdit = route?.params?.onEdit;
  const onDelete = route?.params?.onDelete;
  const [job, setJob] = useState(jobParam);
  const [activeTab, setActiveTab] = useState("overview");
  const [showInterview, setShowInterview] = useState(false);
  const [interviewApplicant, setInterviewApplicant] = useState("");
  const [showEdit, setShowEdit] = useState(false);

  const onBack = () => {
    if (navigation && navigation.canGoBack()) navigation.goBack();
  };

  // Applicants mẫu với status
  const applicants = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      status: "pending",
      experience: "2 năm",
      appliedDate: "10/09/2025",
    },
    {
      id: 2,
      name: "Trần Thị B",
      status: "shortlisted",
      experience: "1.5 năm",
      appliedDate: "08/09/2025",
    },
    {
      id: 3,
      name: "Lê Văn C",
      status: "rejected",
      experience: "6 tháng",
      appliedDate: "07/09/2025",
    },
  ];

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

  const handleDeleteJob = () => {
    Alert.alert("Xác nhận xoá", "Bạn có chắc chắn muốn xoá tin này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: () => {
          onDelete && job?.id && onDelete(job.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleInterview = (name) => {
    setInterviewApplicant(name);
    setShowInterview(true);
  };

  const handleSaveEdit = (updatedJob) => {
    setJob(updatedJob);
    onEdit && onEdit(updatedJob);
  };

  const shortlistedCount = applicants.filter(
    (a) => a.status === "shortlisted"
  ).length;

  const renderOverview = () => (
    <View>
      {!job ? (
        <Text style={styles.empty}>Không tìm thấy dữ liệu tin tuyển dụng.</Text>
      ) : (
        <View>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.meta}>
            {job.salary || "—"} • {job.location || "—"}
          </Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <MaterialIcons name="visibility" size={18} color="#2196F3" />
              <Text style={styles.statNumber}>{job.views ?? 0}</Text>
              <Text style={styles.statLabel}>Lượt xem</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="people" size={18} color="#4CAF50" />
              <Text style={styles.statNumber}>{job.applications ?? 0}</Text>
              <Text style={styles.statLabel}>Ứng viên</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="star" size={18} color="#FF9800" />
              <Text style={styles.statNumber}>{shortlistedCount}</Text>
              <Text style={styles.statLabel}>Được chọn</Text>
            </View>
          </View>

          {/* Thông tin cơ bản */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin</Text>
            {job.deadline ? (
              <Text style={styles.infoRow}>Hạn nộp: {job.deadline}</Text>
            ) : null}
            {job.experience ? (
              <Text style={styles.infoRow}>Kinh nghiệm: {job.experience}</Text>
            ) : null}
            {job.createdDate ? (
              <Text style={styles.infoRow}>Ngày đăng: {job.createdDate}</Text>
            ) : null}
          </View>

          {/* Mô tả */}
          {job.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mô tả công việc</Text>
              <Text style={styles.paragraph}>{job.description}</Text>
            </View>
          ) : null}

          {/* Yêu cầu */}
          {Array.isArray(job.requirements) && job.requirements.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Yêu cầu công việc</Text>
              {job.requirements.map((req, idx) => (
                <Text key={idx} style={styles.bullet}>
                  • {req}
                </Text>
              ))}
            </View>
          ) : null}

          {/* Quyền lợi */}
          {Array.isArray(job.benefits) && job.benefits.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quyền lợi</Text>
              {job.benefits.map((b, idx) => (
                <Text key={idx} style={styles.bullet}>
                  • {b}
                </Text>
              ))}
            </View>
          ) : null}

          {/* Kỹ năng */}
          {Array.isArray(job.skills) && job.skills.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kỹ năng</Text>
              <View style={styles.tags}>
                {job.skills.map((s, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Hành động cơ bản */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => setShowEdit(true)}
            >
              <Text style={styles.btnPrimaryText}>Chỉnh sửa tin</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnDanger]}
              onPress={handleDeleteJob}
            >
              <Text style={styles.btnDangerText}>Xoá tin</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderApplicants = () => (
    <View>
      <Text style={styles.sectionTitle}>
        Danh sách ứng viên ({applicants.length})
        <LinearGradient colors={["#4CAF50", "#45a049"]} style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={{ width: 40, height: 40 }} />
          </View>
          <View style={styles.jobHeaderInfo}>
            <Text style={styles.jobTitle}>
              {job?.title || "Chi tiết tuyển dụng"}
            </Text>
            {!!job?.company && (
              <Text style={styles.companyName}>{job.company}</Text>
            )}
            <View style={styles.jobStats}>
              <View style={styles.statItem}>
                <MaterialIcons name="attach-money" size={20} color="#fff" />
                <Text style={styles.statValue}>{job?.salary || "—"}</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="location-on" size={20} color="#fff" />
                <Text style={styles.statValue}>{job?.location || "—"}</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="schedule" size={20} color="#fff" />
                <Text style={styles.statValue}>{job?.deadline || "—"}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Text>
      {applicants.map((a) => (
        <View key={a.id} style={styles.applicantCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.applicantName}>{a.name}</Text>
            <Text style={styles.applicantMeta}>
              Kinh nghiệm: {a.experience} • Ứng tuyển: {a.appliedDate}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(a.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(a.status)}</Text>
          </View>
          <View style={styles.applicantActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert("Email", "Mở form gửi email")}
            >
              <MaterialIcons name="email" size={16} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert("Gọi", "Gọi điện cho ứng viên")}
            >
              <MaterialIcons name="phone" size={16} color="#2196F3" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleInterview(a.name)}
            >
              <MaterialIcons name="event" size={16} color="#FF9800" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <CommonHeader
        title="Chi tiết tuyển dụng"
        onBack={onBack}
        showAI={false}
      />
      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={TAB_BAR_PADDING}
      >
        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            onPress={() => setActiveTab("overview")}
            style={[
              styles.tabBtn,
              activeTab === "overview" && styles.tabBtnActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "overview" && styles.tabTextActive,
              ]}
            >
              Tổng quan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("applicants")}
            style={[
              styles.tabBtn,
              activeTab === "applicants" && styles.tabBtnActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "applicants" && styles.tabTextActive,
              ]}
            >
              Ứng viên
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "overview" ? renderOverview() : renderApplicants()}
      </ScrollView>

      <InterviewNotificationModal
        visible={showInterview}
        onClose={() => setShowInterview(false)}
        applicantName={interviewApplicant}
      />
      <EditJobModal
        visible={showEdit}
        onClose={() => setShowEdit(false)}
        job={job}
        onSubmit={handleSaveEdit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  empty: { color: "#666", fontStyle: "italic" },
  title: { fontSize: 18, fontWeight: "700", color: "#333" },
  meta: { fontSize: 12, color: "#666", marginTop: 4 },
  section: { marginTop: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
  },
  infoRow: { fontSize: 13, color: "#444", marginBottom: 4 },
  paragraph: { fontSize: 13, color: "#444", lineHeight: 20 },
  bullet: { fontSize: 13, color: "#444", marginBottom: 4 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: "#eaf6ef",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: { color: "#00b14f", fontWeight: "600" },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  btn: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 8 },
  btnPrimary: { backgroundColor: "#00b14f" },
  btnPrimaryText: { color: "#fff", fontWeight: "700" },
  btnDanger: { backgroundColor: "#F44336" },
  btnDangerText: { color: "#fff", fontWeight: "700" },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 4,
    gap: 4,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabBtnActive: { backgroundColor: "#eaf6ef" },
  tabText: { color: "#666", fontWeight: "600" },
  tabTextActive: { color: "#00b14f" },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  statNumber: { fontSize: 16, fontWeight: "700", color: "#333", marginTop: 4 },
  statLabel: { fontSize: 12, color: "#666", marginTop: 2 },
  applicantCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    gap: 10,
  },
  applicantName: { fontSize: 14, fontWeight: "700", color: "#333" },
  applicantMeta: { fontSize: 12, color: "#666", marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  applicantActions: { flexDirection: "row", marginLeft: 6, gap: 6 },
  actionButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: "#eee",
  },
});

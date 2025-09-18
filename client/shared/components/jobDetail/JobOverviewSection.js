import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

// Shared Overview Section
// Props: { job, onEdit: () => void, onDelete: () => void }
export default function JobOverviewSection({ job, onEdit, onDelete }) {
  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialIcons name="visibility" size={24} color="#2196F3" />
          <Text style={styles.statNumber}>{job?.views ?? 0}</Text>
          <Text style={styles.statLabel}>Lượt xem</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="people" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{job?.applications ?? 0}</Text>
          <Text style={styles.statLabel}>Ứng viên</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="star" size={24} color="#FF9800" />
          <Text style={styles.statNumber}>{job?.shortlisted ?? 0}</Text>
          <Text style={styles.statLabel}>Được chọn</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Thông tin công việc</Text>
        <InfoRow icon="work" label="Vị trí" value={job?.title || "—"} />
        <InfoRow
          icon="attach-money"
          label="Mức lương"
          value={job?.salary || "—"}
        />
        <InfoRow
          icon="location-on"
          label="Địa điểm"
          value={job?.location || "—"}
        />
        <InfoRow icon="schedule" label="Hạn nộp" value={job?.deadline || "—"} />
        <InfoRow
          icon="business-center"
          label="Kinh nghiệm"
          value={job?.experience || "—"}
        />
      </View>

      {job?.description ? (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Mô tả công việc</Text>
          <Text style={styles.descriptionText}>{job.description}</Text>
        </View>
      ) : null}

      <BulletedSection title="Yêu cầu công việc" data={job?.requirements} />
      <BulletedSection title="Quyền lợi" data={job?.benefits} />

      {Array.isArray(job?.skills) && job.skills.length > 0 ? (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Kỹ năng yêu cầu</Text>
          <View style={styles.skillsContainer}>
            {job.skills.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.editJobButton} onPress={onEdit}>
          <MaterialIcons name="edit" size={20} color="#fff" />
          <Text style={styles.editJobButtonText}>Chỉnh sửa tin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteJobButton} onPress={onDelete}>
          <MaterialIcons name="delete" size={20} color="#fff" />
          <Text style={styles.deleteJobButtonText}>Xóa tin</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <MaterialIcons name={icon} size={20} color="#666" />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function BulletedSection({ title, data }) {
  if (!Array.isArray(data) || data.length === 0) return null;
  return (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {data.map((item, index) => (
        <View key={index} style={styles.requirementItem}>
          <Text style={styles.requirementBullet}>•</Text>
          <Text style={styles.requirementText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContent: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },
  statsContainer: { flexDirection: "row", marginBottom: 20, gap: 12 },
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
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#333", marginTop: 8 },
  statLabel: { fontSize: 12, color: "#666", marginTop: 4 },
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
  infoRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  infoContent: { flex: 1, marginLeft: 12 },
  infoLabel: { fontSize: 12, color: "#666", marginBottom: 4 },
  infoValue: { fontSize: 14, color: "#333", fontWeight: "500" },
  descriptionText: { fontSize: 14, color: "#666", lineHeight: 22 },
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
  requirementText: { fontSize: 14, color: "#666", lineHeight: 20, flex: 1 },
  skillsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillTag: {
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillText: { fontSize: 12, color: "#666", fontWeight: "500" },
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
});

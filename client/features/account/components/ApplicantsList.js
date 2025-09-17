import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

function getStatusColor(status) {
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
}

function getStatusText(status) {
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
}

export default function ApplicantsList({ applicants, onOpenInterview }) {
  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>
        Danh sách ứng viên ({applicants.length})
      </Text>
      {applicants.map((a) => (
        <View key={a.id} style={styles.applicantCard}>
          <View style={styles.applicantHeader}>
            <View style={styles.applicantAvatar}>
              <Text style={styles.avatarText}>{a.avatar}</Text>
            </View>
            <View style={styles.applicantInfo}>
              <Text style={styles.applicantName}>{a.name}</Text>
              <Text style={styles.applicantExperience}>
                Kinh nghiệm: {a.experience}
              </Text>
              <Text style={styles.applicantDate}>
                Ứng tuyển: {a.appliedDate}
              </Text>
            </View>
            <View style={styles.applicantStatus}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(a.status) },
                ]}
              >
                <Text style={styles.statusText}>{getStatusText(a.status)}</Text>
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
              onPress={onOpenInterview}
            >
              <MaterialIcons name="event" size={16} color="#FF9800" />
              <Text style={styles.actionText}>Phỏng vấn</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabContent: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
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
  avatarText: { fontSize: 20 },
  applicantInfo: { flex: 1 },
  applicantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  applicantExperience: { fontSize: 14, color: "#666", marginBottom: 2 },
  applicantDate: { fontSize: 12, color: "#999" },
  applicantStatus: { alignItems: "flex-end" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "600" },
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
  actionText: { fontSize: 12, color: "#666", marginLeft: 4, fontWeight: "500" },
});

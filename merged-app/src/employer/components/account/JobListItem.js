import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

// Helper function to format data from API
const formatJobData = (job) => {
  // Format salary
  const formatSalary = (salary) => {
    if (!salary) return "Thỏa thuận";
    if (typeof salary === "string") return salary;
    return `${salary.toLocaleString()} VND`;
  };

  // Format location
  const formatLocation = (location) => {
    return location || "Chưa cập nhật";
  };

  // Format deadline
  const formatDeadline = (deadline) => {
    if (!deadline) return "Không giới hạn";
    const deadlineDate = new Date(deadline);
    return deadlineDate.toLocaleDateString("vi-VN");
  };

  // Format status
  const formatStatus = (status) => {
    const statusMap = {
      active: "Đang tuyển",
      inactive: "Tạm dừng",
      closed: "Đã đóng",
      draft: "Bản nháp",
    };
    return statusMap[status] || status || "Không xác định";
  };

  return {
    ...job,
    salary: formatSalary(job.salary),
    location: formatLocation(job.location),
    deadline: formatDeadline(job.deadline || job.expiry_date),
    status: formatStatus(job.status),
    views: job.views || 0,
    applications: job.application_count || job.applications || 0,
  };
};

export default function JobListItem({ job, onPress }) {
  const formattedJob = formatJobData(job);
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Đang tuyển":
        return "#4CAF50";
      case "Tạm dừng":
        return "#FF9800";
      case "Đã đóng":
        return "#757575";
      case "Bản nháp":
        return "#2196F3";
      default:
        return "#757575";
    }
  };

  return (
    <TouchableOpacity style={styles.jobCard} onPress={() => onPress?.(job)}>
      <View style={styles.jobCardHeader}>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {formattedJob.title || "Chưa có tiêu đề"}
          </Text>
          <Text style={styles.jobSalary}>{formattedJob.salary}</Text>
          <Text style={styles.jobLocation} numberOfLines={1}>
            {formattedJob.location}
          </Text>
        </View>
        <View style={styles.jobStatus}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(formattedJob.status) },
            ]}
          >
            <Text style={styles.statusText}>{formattedJob.status}</Text>
          </View>
        </View>
      </View>
      <View style={styles.jobCardStats}>
        <View style={styles.jobStat}>
          <MaterialIcons name="visibility" size={16} color="#666" />
          <Text style={styles.jobStatText}>{formattedJob.views} lượt xem</Text>
        </View>
        <View style={styles.jobStat}>
          <MaterialIcons name="people" size={16} color="#666" />
          <Text style={styles.jobStatText}>
            {formattedJob.applications} ứng viên
          </Text>
        </View>
        <View style={styles.jobStat}>
          <MaterialIcons name="schedule" size={16} color="#666" />
          <Text style={styles.jobStatText} numberOfLines={1}>
            Hết hạn: {formattedJob.deadline}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  jobCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 12,
  },
  jobCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  jobInfo: { flex: 1 },
  jobTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  jobSalary: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
    marginBottom: 2,
  },
  jobLocation: { fontSize: 14, color: "#666" },
  jobStatus: { alignItems: "flex-end" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { color: "white", fontSize: 12, fontWeight: "600" },
  jobCardStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  jobStat: { flexDirection: "row", alignItems: "center", flex: 1 },
  jobStatText: { fontSize: 12, color: "#666", marginLeft: 4 },
});

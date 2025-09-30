import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function JobListItem({ job, onPress }) {
  return (
    <TouchableOpacity style={styles.jobCard} onPress={() => onPress?.(job)}>
      <View style={styles.jobCardHeader}>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.jobSalary}>{job.salary}</Text>
          <Text style={styles.jobLocation}>{job.location}</Text>
        </View>
        <View style={styles.jobStatus}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  job.status === "Đang tuyển" ? "#4CAF50" : "#757575",
              },
            ]}
          >
            <Text style={styles.statusText}>{job.status}</Text>
          </View>
        </View>
      </View>
      <View style={styles.jobCardStats}>
        <View style={styles.jobStat}>
          <MaterialIcons name="visibility" size={16} color="#666" />
          <Text style={styles.jobStatText}>{job.views} lượt xem</Text>
        </View>
        <View style={styles.jobStat}>
          <MaterialIcons name="people" size={16} color="#666" />
          <Text style={styles.jobStatText}>{job.applications} ứng viên</Text>
        </View>
        <View style={styles.jobStat}>
          <MaterialIcons name="schedule" size={16} color="#666" />
          <Text style={styles.jobStatText}>Hết hạn: {job.deadline}</Text>
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

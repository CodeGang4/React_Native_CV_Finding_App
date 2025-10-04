import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import JobsStatsRow from "./JobsStatsRow";
import JobListItem from "./JobListItem";

export default function JobsTabSection({
  jobs,
  jobStats = null,
  loading = false,
  creating = false,
  onCreatePress,
  onJobPress,
}) {
  // Sử dụng jobStats từ props hoặc tính toán từ jobs
  const stats = jobStats || {
    totalApplications: jobs.reduce((sum, j) => sum + (j.applications || 0), 0),
    activeJobs: jobs.filter((j) => j.status === "Đang tuyển").length,
    totalJobs: jobs.length,
  };

  return (
    <View style={styles.container}>
      <JobsStatsRow
        totalJobs={stats.totalJobs}
        totalApplications={stats.totalApplications}
        activeJobs={stats.activeJobs}
        loading={loading}
      />

      <TouchableOpacity
        style={[styles.createJobButton, creating && styles.disabledButton]}
        onPress={onCreatePress}
        disabled={creating}
      >
        {creating ? (
          <>
            <ActivityIndicator size={20} color="#fff" />
            <Text style={styles.createJobButtonText}>Đang tạo...</Text>
          </>
        ) : (
          <>
            <MaterialIcons name="add" size={24} color="#fff" />
            <Text style={styles.createJobButtonText}>
              Đăng tin tuyển dụng mới
            </Text>
          </>
        )}
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Đang tải tin tuyển dụng...</Text>
        </View>
      ) : jobs.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="work-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có tin tuyển dụng nào</Text>
          <Text style={styles.emptySubText}>
            Hãy đăng tin tuyển dụng đầu tiên của bạn
          </Text>
        </View>
      ) : (
        <View style={styles.jobsList}>
          {jobs.map((job) => (
            <JobListItem key={job.id} job={job} onPress={onJobPress} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  createJobButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  createJobButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  jobsList: { gap: 12 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: { fontSize: 16, color: "#999", marginTop: 10 },
  emptySubText: { fontSize: 14, color: "#ccc", marginTop: 5 },
});

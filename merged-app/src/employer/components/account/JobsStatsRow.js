import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function JobsStatsRow({
  totalJobs = 0,
  totalApplications = 0,
  activeJobs = 0,
  loading = false,
}) {
  const renderStatValue = (value) => {
    if (loading) return "-";
    return value.toString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.statCard}>
        <MaterialIcons name="work" size={24} color="#4CAF50" />
        <Text style={styles.statNumber}>{renderStatValue(totalJobs)}</Text>
        <Text style={styles.statLabel}>Tin đã đăng</Text>
      </View>
      <View style={styles.statCard}>
        <MaterialIcons name="people" size={24} color="#2196F3" />
        <Text style={styles.statNumber}>
          {renderStatValue(totalApplications)}
        </Text>
        <Text style={styles.statLabel}>Ứng viên nhận</Text>
      </View>
      <View style={styles.statCard}>
        <MaterialIcons name="trending-up" size={24} color="#FF9800" />
        <Text style={styles.statNumber}>{renderStatValue(activeJobs)}</Text>
        <Text style={styles.statLabel}>Tin đang tuyển</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", marginBottom: 20, gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: "white",
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
  statLabel: { fontSize: 12, color: "#666", marginTop: 4, textAlign: "center" },
});

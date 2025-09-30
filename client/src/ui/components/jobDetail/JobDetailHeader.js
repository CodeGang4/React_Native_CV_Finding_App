import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

// Shared Job Detail Header
// Props: { job: { title, company, salary, location, deadline }, onBack: () => void }
export default function JobDetailHeader({ job, onBack }) {
  return (
    <LinearGradient colors={["#4CAF50", "#45a049"]} style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.menuButton}>
          <MaterialIcons name="more-vert" size={24} color="#fff" />
        </View>
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
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 40, paddingBottom: 20, paddingHorizontal: 16 },
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
  jobHeaderInfo: { alignItems: "center" },
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
  jobStats: { flexDirection: "row", justifyContent: "center", gap: 20 },
  statItem: { flexDirection: "row", alignItems: "center" },
  statValue: { color: "#fff", fontSize: 14, marginLeft: 4, fontWeight: "500" },
});

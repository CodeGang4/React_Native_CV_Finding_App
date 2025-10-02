import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function JobItem({ job, onPress }) {
  if (!job) return null;
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress && onPress(job)}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.meta}>
          {job.salary} • {job.location}
        </Text>
      </View>
      <Text
        style={[styles.badge, job.status === "Hết hạn" && styles.badgeExpired]}
      >
        {job.status}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 14, fontWeight: "600", color: "#333" },
  meta: { fontSize: 12, color: "#666", marginTop: 2 },
  badge: {
    fontSize: 12,
    color: "#fff",
    backgroundColor: "#4CAF50",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  badgeExpired: { backgroundColor: "#F44336" },
});
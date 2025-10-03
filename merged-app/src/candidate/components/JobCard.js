import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function JobCard({ job, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(job)}>
      <Text style={styles.title}>{job.title}</Text>
      <Text style={styles.company}>{job.position}</Text>
      <Text style={styles.location}>{job.location}</Text>
      <Text style={styles.salary}>{job.salary}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {job.description}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: { fontSize: 16, fontWeight: "bold", color: "#333" },
  company: { fontSize: 14, color: "#666", marginTop: 4 },
  location: { fontSize: 13, color: "#444", marginTop: 2 },
  salary: { fontSize: 13, color: "#00b14f", marginTop: 2 },
  description: { fontSize: 12, color: "#777", marginTop: 6 },
});

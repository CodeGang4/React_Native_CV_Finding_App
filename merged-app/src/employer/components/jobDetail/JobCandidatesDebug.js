import React, { useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useJobCandidates } from "../../../shared/hooks/useJobCandidates";

// Debug component để test API
export default function JobCandidatesDebug({ jobId }) {
  const { candidates, stats, loading, error, fetchCandidates } =
    useJobCandidates(jobId);

  useEffect(() => {
    if (jobId) {
      console.log("🔍 JobCandidatesDebug: Testing with jobId:", jobId);
    }
  }, [jobId]);

  useEffect(() => {
    if (candidates && candidates.length > 0) {
      console.log("✅ JobCandidatesDebug: Candidates loaded:", candidates);
    }
  }, [candidates]);

  useEffect(() => {
    if (error) {
      console.log("❌ JobCandidatesDebug: Error:", error);
      Alert.alert("Debug Error", error);
    }
  }, [error]);

  if (!jobId) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🔍 Debug: No Job ID</Text>
        <Text style={styles.text}>Job ID is required to fetch candidates</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Candidates Debug</Text>
      <Text style={styles.text}>Job ID: {jobId}</Text>
      <Text style={styles.text}>Loading: {loading ? "Yes" : "No"}</Text>
      <Text style={styles.text}>Error: {error || "None"}</Text>
      <Text style={styles.text}>Candidates Count: {candidates.length}</Text>

      <Text style={styles.subtitle}>Stats:</Text>
      <Text style={styles.text}>Total: {stats.total}</Text>
      <Text style={styles.text}>Pending: {stats.pending}</Text>
      <Text style={styles.text}>Shortlisted: {stats.shortlisted}</Text>
      <Text style={styles.text}>Rejected: {stats.rejected}</Text>

      {candidates.length > 0 && (
        <>
          <Text style={styles.subtitle}>First Candidate:</Text>
          <Text style={styles.text}>Name: {candidates[0].name}</Text>
          <Text style={styles.text}>Email: {candidates[0].email}</Text>
          <Text style={styles.text}>Status: {candidates[0].status}</Text>
          <Text style={styles.text}>Applied: {candidates[0].appliedDate}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f0f0f0",
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
    color: "#666",
  },
  text: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
});

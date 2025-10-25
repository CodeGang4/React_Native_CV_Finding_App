import React from "react";
import { View, FlatList, Text, Image, StyleSheet, RefreshControl, ActivityIndicator } from "react-native";
import useAppliedJobs from "../../../shared/hooks/useAppliedJobs";

export default function AppliedJobs() {
  const { jobs, loading, refreshing, handleRefresh } = useAppliedJobs();

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        {item.companyLogo ? (
          <Image source={{ uri: item.companyLogo }} style={styles.logo} resizeMode="cover" />
        ) : (
          <View style={[styles.logo, { backgroundColor: "#ccc" }]} />
        )}
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.company}>{item.companyName}</Text>
          <Text style={styles.location}>{item.location}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.salary}>{item.salary}</Text>
        <Text
          style={[styles.status, item.status === "pending" ? styles.pending : styles.other]}
        >
          {item.status.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00b14f" />
        <Text>Đang tải danh sách...</Text>
      </View>
    );
  }

  if (!jobs.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text>Bạn chưa ứng tuyển việc làm nào.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={jobs}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContainer: { padding: 15 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  logo: { width: 50, height: 50, borderRadius: 8 },
  title: { fontSize: 16, fontWeight: "bold", color: "#333" },
  company: { fontSize: 14, color: "#666" },
  location: { fontSize: 13, color: "#888" },

  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  salary: { fontSize: 14, fontWeight: "bold", color: "#00b14f" },
  status: { fontSize: 12, fontWeight: "bold", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  pending: { backgroundColor: "#f0ad4e", color: "#fff" },
  other: { backgroundColor: "#ccc", color: "#fff" },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useAuth } from "../../../shared/contexts/AuthContext";
import ApplicationApiService from "../../../shared/services/api/ApplicationApiService";
import HomeApiService from "../../../shared/services/api/HomeApiService";

export default function AppliedJobs() {
  const { user } = useAuth();
  const isFocused = useIsFocused();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false); 

  const fetchAppliedJobs = async (force = false) => {
    if (!user?.id) return;

    if (hasLoaded && !force) return;

    setLoading(true);
    try {
      const applications = await ApplicationApiService.getApplicationByCandidate(user.id);
      const allJobs = await HomeApiService.getJobs();

      const jobsWithDetails = await Promise.all(
        applications.map(async (app) => {
          const jobDetail = allJobs.find((job) => job.id === app.job_id) || {};
          const company = await HomeApiService.getCompanyByEmployerId(app.employer_id);
          return {
            id: app.id,
            title: jobDetail.title || "N/A",
            salary: jobDetail.salary || "N/A",
            location: jobDetail.location || "N/A",
            companyName: company?.company_name || "N/A",
            companyLogo: company?.company_logo || null,
            status: app.status,
          };
        })
      );

      setJobs(jobsWithDetails);
      setHasLoaded(true);
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
      Alert.alert("Lỗi", "Không thể lấy danh sách việc làm đã ứng tuyển.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) fetchAppliedJobs(false);
  }, [isFocused]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAppliedJobs(true);
  };

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
          style={[
            styles.status,
            item.status === "pending" ? styles.pending : styles.other,
          ]}
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

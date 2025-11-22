import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../../shared/contexts/AuthContext";

import useVerifiedCompanies from "../../../shared/hooks/useVerifiedCompanies";
import { useAllPodcasts } from "../../../shared/hooks/useAllPodcasts";
import useJobs from "../../../shared/hooks/useJobs";

import JobListSection from "../../components/JobListSection";
import CompanyListSection from "../../components/CompanyListSection";
import PodcastListSection from "../../components/PodcastListSection";
import RateLimitMonitor from "../../../components/debug/RateLimitMonitor";

export default function CandidateHomeScreen({ navigation }) {
  const { user } = useAuth(); 

  const { jobs, loading: jobsLoading, loadJobs } = useJobs();

  const savedJobs = user?.savedJobs || [];

  const {
    filteredCompanies,
    loading: companyLoading,
    error: companyError,
    search: searchCompanies,
  } = useVerifiedCompanies();

  const {
    podcasts,
    loading: podcastLoading,
    error: podcastError,
  } = useAllPodcasts();

  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        await searchCompanies("");
      } catch (err) {
        console.error("Error fetching initial data:", err);
      } finally {
        setInitialLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  const quickAccessButtons = [
    {
      label: "Việc làm",
      icon: "work",
      color: "#65cb93",
      route: "JobSearchScreen",
    },
    {
      label: "Công ty",
      icon: "business",
      color: "#65cb93",
      route: "CompanyScreen",
    },
    { label: "CV", icon: "description", color: "#65cb93", route: "CVScreen" },
    { label: "Podcast", icon: "radio", color: "#65cb93", route: "Podcast" },
  ];

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.searchBarContainer}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate("JobSearchScreen")}
        >
          <Ionicons name="search-outline" size={22} color="#888" />
          <Text style={styles.searchPlaceholder}>Tìm kiếm việc làm...</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.iconRowContainer}>
        {quickAccessButtons.map((btn) => (
          <TouchableOpacity
            key={btn.label}
            style={styles.iconButton}
            onPress={() => navigation.navigate(btn.route)}
          >
            <View style={[styles.circle, { backgroundColor: btn.color }]}>
              <MaterialIcons name={btn.icon} size={28} color="#fff" />
            </View>
            <Text style={styles.iconLabel}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.nearbyButtonContainer}>
        <TouchableOpacity
          style={styles.nearbyButton}
          onPress={() => navigation.navigate("Nearby")}
        >
          <MaterialIcons name="location-on" size={22} color="#fff" />
          <Text style={styles.nearbyButtonText}>Khám phá việc làm gần bạn</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (initialLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00b14f" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <>
            {renderHeader()}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Việc làm hấp dẫn</Text>
                <TouchableOpacity
                  style={styles.seeMoreButton}
                  onPress={() => navigation.navigate("JobSearchScreen")}
                >
                  <Text style={styles.seeMoreText}>Xem thêm</Text>
                  <Ionicons name="chevron-forward" size={16} color="#00b14f" />
                </TouchableOpacity>
              </View>
              <View style={{ paddingHorizontal: 16 }}>
                <JobListSection scrollEnabled={false} limit={3} />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Công ty hàng đầu</Text>
                <TouchableOpacity
                  style={styles.seeMoreButton}
                  onPress={() => navigation.navigate("CompanyScreen")}
                >
                  <Text style={styles.seeMoreText}>Xem thêm</Text>
                  <Ionicons name="chevron-forward" size={16} color="#00b14f" />
                </TouchableOpacity>
              </View>
              <CompanyListSection limit={2} />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Podcast nổi bật</Text>
                <TouchableOpacity
                  style={styles.seeMoreButton}
                  onPress={() => navigation.navigate("Podcast")}
                >
                  <Text style={styles.seeMoreText}>Xem thêm</Text>
                  <Ionicons name="chevron-forward" size={16} color="#00b14f" />
                </TouchableOpacity>
              </View>
              <PodcastListSection limit={3} />
            </View>
          </>
        }
        ListFooterComponent={__DEV__ && <RateLimitMonitor enabled />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  contentContainer: { paddingBottom: 40 },
  headerContainer: { backgroundColor: "#16c765" },
  searchBarContainer: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 16,
    elevation: 3,
  },
  searchPlaceholder: { fontSize: 16, color: "#888", marginLeft: 8 },
  iconRowContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
  },
  iconButton: { alignItems: "center" },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  iconLabel: { color: "#fff", fontSize: 14 },
  nearbyButtonContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  nearbyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    paddingVertical: 12,
  },
  nearbyButtonText: { color: "#fff", fontWeight: "500", fontSize: 16 },
  section: { backgroundColor: "#fff", paddingVertical: 10, marginTop: 10 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  seeMoreButton: { flexDirection: "row", alignItems: "center" },
  seeMoreText: { fontSize: 14, color: "#00b14f", marginRight: 4 },
  errorText: {
    textAlign: "center",
    color: "red",
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: "#666",
    fontSize: 14,
  },
});

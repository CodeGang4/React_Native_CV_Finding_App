import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../../shared/contexts/AuthContext";
import JobListSection from "../../components/JobListSection";
import RateLimitMonitor from "../../../components/debug/RateLimitMonitor";
import CompanyListSection from "../../components/CompanyListSection";
import PodcastListSection from "../../components/PodcastListSection";

export default function CandidateHomeScreen({ navigation }) {
  const { user } = useAuth();

  const quickAccessButtons = [
    {
      label: "Việc làm",
      icon: "work",
      color: "#65cb93ff",
      route: "JobSearchScreen",
    },
    {
      label: "Công ty",
      icon: "business",
      color: "#65cb93ff",
      route: "CompanyScreen",
    },
    { label: "CV", icon: "description", color: "#65cb93ff", route: "CVScreen" },
    { label: "Podcast", icon: "radio", color: "#65cb93ff", route: "Podcast" },
  ];

  const sections = [
    { type: 'header', id: 'header' },
    { type: 'quickAccess', id: 'quickAccess' },
    { type: 'jobsTitle', id: 'jobsTitle' },
    { type: 'jobs', id: 'jobs' },
    { type: 'companiesTitle', id: 'companiesTitle' },
    { type: 'companies', id: 'companies' },
    { type: 'podcastsTitle', id: 'podcastsTitle' },
    { type: 'podcasts', id: 'podcasts' },
  ];

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'header':
        return (
          <View style={styles.searchBarContainer}>
            <TouchableOpacity
              style={styles.searchBar}
              onPress={() => navigation.navigate("JobSearchScreen")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="search-outline"
                size={22}
                color="#888"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.searchPlaceholder}>Tìm kiếm việc làm...</Text>
            </TouchableOpacity>
          </View>
        );

      case 'quickAccess':
        return (
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
        );

      case 'jobsTitle':
        return (
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
        );

      case 'jobs':
        return <JobListSection navigation={navigation} limit={3} scrollEnabled={false} />;

      case 'companiesTitle':
        return (
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
        );

      case 'companies':
        return <CompanyListSection limit={2} />;

      case 'podcastsTitle':
        return (
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
        );

      case 'podcasts':
        return <PodcastListSection limit={3} />;

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListFooterComponent={
          __DEV__ ? <RateLimitMonitor enabled={true} /> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  searchBarContainer: {
    backgroundColor: "#16c765ff",
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
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchPlaceholder: { fontSize: 16, color: "#888" },
  iconRowContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#16c765ff",
    paddingVertical: 20,
    marginBottom: 10,
  },
  iconButton: {
    alignItems: "center",
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  iconLabel: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  seeMoreText: {
    fontSize: 14,
    color: "#00b14f",
    fontWeight: "500",
    marginRight: 4,
  },
});

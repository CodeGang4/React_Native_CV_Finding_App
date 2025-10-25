import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../../shared/contexts/AuthContext";
import JobListSection from "../../components/JobListSection";
import RateLimitMonitor from "../../../components/debug/RateLimitMonitor";

export default function CandidateHomeScreen({ navigation }) {
  const { user } = useAuth();

  const quickAccessButtons = [
    { label: "Việc làm", icon: "work", color: "#00b14f", route: "JobSearchScreen" },
    { label: "Công ty", icon: "business", color: "#007bff", route: "CompanyScreen" },
    { label: "CV", icon: "description", color: "#ffb400", route: "CVScreen" },
    { label: "Podcast", icon: "radio", color: "#ff4444", route: "Podcast" },
  ];

  return (
    <View style={styles.container}>
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

      <JobListSection navigation={navigation} />
      
      {/* Rate Limit Monitor - Only visible in development */}
      <RateLimitMonitor enabled={__DEV__} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  searchBarContainer: {
    backgroundColor: "#00b14f",
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
    backgroundColor: "#fff",
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
    color: "black",
    fontSize: 14,
    textAlign: "center",
  },
});

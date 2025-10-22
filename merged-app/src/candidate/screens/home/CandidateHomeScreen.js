import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../shared/contexts/AuthContext";
import JobListSection from "../../components/JobListSection";

export default function CandidateHomeScreen({ navigation }) {
  const { user } = useAuth();

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

      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>
          Xin chào, {user?.username || "Bạn"}!
        </Text>
        <Text style={styles.subtitle}>Sẵn sàng tìm công việc mơ ước?</Text>
      </View>

      <JobListSection navigation={navigation} />
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
  greetingContainer: {
    backgroundColor: "#00b14f",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  subtitle: { fontSize: 16, color: "#fff", opacity: 0.9 },
});

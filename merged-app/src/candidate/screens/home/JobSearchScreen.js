import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import JobListSection from "../../components/JobListSection";

export default function JobSearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0);

  const handleSearch = () => {
    setSearchTrigger((prev) => prev + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <View style={styles.searchInput}>
          <MaterialIcons name="search" size={20} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Tìm kiếm công việc hoặc công ty..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.searchInput}>
          <MaterialIcons name="location-on" size={20} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Địa điểm..."
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Tìm kiếm</Text>
        </TouchableOpacity>
      </View>

      <JobListSection
        searchQuery={searchQuery}
        location={location}
        searchTrigger={searchTrigger}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  searchSection: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    height: 45,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  searchButton: {
    backgroundColor: "#00b14f",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  searchButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

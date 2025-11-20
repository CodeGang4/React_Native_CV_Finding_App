import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from "@expo/vector-icons";
import JobListSection from "../../components/JobListSection";
import processCV from "../../components/ScanCV";

export default function JobSearchScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const initialQuery = route.params?.searchQuery || "";

  // Tách biệt giá trị input và giá trị tìm kiếm
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [locationInput, setLocationInput] = useState("");
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [location, setLocation] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [loadingAI, setLoadingAI] = useState(false);

  const { analyzeAndUpdateCV } = processCV();

  useEffect(() => {
    if (isFocused && initialQuery) {
      setSearchInput(initialQuery);
      setSearchQuery(initialQuery);
      setSearchTrigger((prev) => prev + 1);
    }
  }, [initialQuery, isFocused]);

  const handleSearch = () => {
    if (!searchInput.trim() && !locationInput.trim()) {
      Alert.alert("Vui lòng nhập từ khoá hoặc địa điểm để tìm kiếm.");
      return;
    }
    
    // Chỉ cập nhật giá trị tìm kiếm khi bấm nút
    setSearchQuery(searchInput);
    setLocation(locationInput);
    setSearchTrigger((prev) => prev + 1);
  };

  const handleAISuggestion = async () => {
    try {
      setLoadingAI(true);
      const aiResult = await analyzeAndUpdateCV();

      if (!aiResult) {
        Alert.alert("Không thể gợi ý công việc", "AI chưa phân tích được CV của bạn.");
        return;
      }

      const aiKeywords = Array.isArray(aiResult.job_preferences)
        ? aiResult.job_preferences.join(" ")
        : aiResult.job_preferences || "";

      if (!aiKeywords) {
        Alert.alert("AI chưa tìm thấy vị trí mong muốn trong CV của bạn.");
        return;
      }

      // Cập nhật cả input và search query khi dùng AI
      setSearchInput(aiKeywords);
      setSearchQuery(aiKeywords);
      setSearchTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Lỗi AI gợi ý:", err);
      Alert.alert("Lỗi", "Không thể kết nối AI gợi ý công việc.");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.searchSection}>
        <View style={styles.searchInput}>
          <MaterialIcons name="search" size={20} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Tìm kiếm công việc hoặc công ty..."
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearch}
          />
        </View>

        <View style={styles.searchInput}>
          <MaterialIcons name="location-on" size={20} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Địa điểm..."
            value={locationInput}
            onChangeText={setLocationInput}
            onSubmitEditing={handleSearch}
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.aiButton]}
            onPress={handleAISuggestion}
            disabled={loadingAI}
          >
            {loadingAI ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <MaterialIcons name="psychology" size={20} color="#fff" />
                <Text style={styles.buttonText}>AI Gợi ý</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.searchButton]}
            onPress={handleSearch}
          >
            <View style={styles.buttonContent}>
              <MaterialIcons name="search" size={20} color="#fff" />
              <Text style={styles.buttonText}>Tìm kiếm</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.jobListContainer}>
        <JobListSection
          searchQuery={searchQuery}
          location={location}
          searchTrigger={searchTrigger}
          navigation={navigation}
          scrollEnabled={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5" 
  },
  jobListContainer: {
    width: "100%",
    paddingHorizontal: 0,
  },
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  aiButton: {
    backgroundColor: "#007AFF",
  },
  searchButton: {
    backgroundColor: "#00b14f",
  },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
});
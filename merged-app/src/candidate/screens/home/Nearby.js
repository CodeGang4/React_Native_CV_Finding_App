import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import JobListSection from "../../components/JobListSection";
import NearbyApiService from "../../../shared/services/api/NearbyApiService";
import * as Location from "expo-location";

export default function NearbyScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [radius, setRadius] = useState("5");
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const [nearbyJobs, setNearbyJobs] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [searchInfo, setSearchInfo] = useState(null);

  const radiusOptions = [1, 2, 5, 10, 15, 20];

  const formatJobData = (job) => ({
    ...job,
    company_logo: job.employer?.company_logo || job.employers?.company_logo || null,
    company_name: job.employer?.company_name || job.employers?.company_name || "Công ty chưa đặt tên",
    company_address: job.location || "Địa chỉ chưa xác định",
  });

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    setNearbyJobs([]);
    setSearchInfo(null);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Quyền truy cập vị trí", 
          "Ứng dụng cần quyền truy cập vị trí để tìm việc làm gần bạn."
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000,
      });
      
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setUserLocation(coords);

      const result = await NearbyApiService.searchNearbyJobs(
        coords.latitude,
        coords.longitude,
        radius
      );

      const jobs = result.jobs ? result.jobs.map(formatJobData) : [];

      setNearbyJobs(jobs);
      setSearchInfo({
        count: result.count || jobs.length,
        radius: result.radius || radius,
        userLocation: coords
      });
      setSearchTrigger((prev) => prev + 1);

      if (jobs.length === 0) {
        Alert.alert(
          "Thông báo", 
          `Không tìm thấy việc làm nào trong bán kính ${radius}km.`
        );
      }

    } catch (error) {
      console.error("[NearbyScreen] Search error:", error);
      Alert.alert("Lỗi tìm kiếm", error.message || "Không thể tìm kiếm việc làm gần đây");
      setNearbyJobs([]);
      setSearchInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRadiusSelect = (selectedRadius) => setRadius(selectedRadius.toString());
  const handleClearSearch = () => { setNearbyJobs([]); setSearchInfo(null); setUserLocation(null); };
  const handleJobPress = (job) => navigation.navigate("JobDetail", { job, company: { company_name: job.company_name, company_logo: job.company_logo, company_address: job.company_address } });

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.searchSection}>
        <View style={styles.radiusSection}>
          <Text style={styles.radiusLabel}>Phạm vi tìm kiếm:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.radiusOptions}>
            {radiusOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.radiusButton, radius === option.toString() && styles.radiusButtonSelected]}
                onPress={() => handleRadiusSelect(option)}
              >
                <Text style={[styles.radiusButtonText, radius === option.toString() && styles.radiusButtonTextSelected]}>
                  {option} km
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {searchInfo && (
          <View style={styles.searchInfo}>
            <Text style={styles.searchInfoText}>
              Tìm thấy {searchInfo.count} việc làm trong bán kính {searchInfo.radius} km
            </Text>
            <Text style={styles.searchInfoSubtext}>
              Vị trí hiện tại của bạn
            </Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={handleClearSearch}
            disabled={loading || nearbyJobs.length === 0}
          >
            <MaterialIcons name="clear-all" size={16} color="#666" />
            <Text style={styles.clearButtonText}>Xóa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.useLocationButton, loading && styles.buttonDisabled, styles.mainButton]} 
            onPress={handleUseCurrentLocation}
            disabled={loading}
          >
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <>
              <MaterialIcons name="my-location" size={24} color="#fff" />
              <Text style={styles.buttonText}>Dùng vị trí hiện tại</Text>
            </>}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.jobListContainer}>
        <JobListSection
          searchQuery=""
          location={userLocation ? "Vị trí hiện tại" : ""}
          searchTrigger={searchTrigger}
          navigation={navigation}
          scrollEnabled
          radius={radius}
          jobs={nearbyJobs}
          loading={loading}
          showSavedOnly={false}
          onJobPress={handleJobPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  searchSection: { backgroundColor: "#fff", padding: 20, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" },
  radiusSection: { marginBottom: 16 },
  radiusLabel: { fontSize: 16, fontWeight: "600", marginBottom: 12, color: "#333" },
  radiusOptions: { flexDirection: "row", gap: 8, paddingRight: 8 },
  radiusButton: { paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1.5, borderColor: "#00b14f", borderRadius: 20, backgroundColor: "#fff", minWidth: 60, alignItems: "center" },
  radiusButtonSelected: { backgroundColor: "#00b14f" },
  radiusButtonText: { color: "#00b14f", fontWeight: "600", fontSize: 14 },
  radiusButtonTextSelected: { color: "#fff" },
  searchInfo: { backgroundColor: "#e8f5e8", padding: 12, borderRadius: 8, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: "#00b14f" },
  searchInfoText: { fontSize: 14, fontWeight: "600", color: "#2e7d32", marginBottom: 4 },
  searchInfoSubtext: { fontSize: 12, color: "#666" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  button: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 10, gap: 8 }, // Bỏ flex: 1 ở đây
  
  clearButton: { flex: 0.3, backgroundColor: "#f5f5f5", borderWidth: 1, borderColor: "#ddd", paddingVertical: 10 }, 
  clearButtonText: { color: "#666", fontWeight: "500", fontSize: 14 },
  
  useLocationButton: { flex: 0.7, backgroundColor: "#00b14f" },
  
  buttonDisabled: { backgroundColor: "#cccccc" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  jobListContainer: { flex: 1, width: "100%" },
});
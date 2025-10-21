import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import JobList from "../../components/JobList";
import { useNavigation } from "@react-navigation/native";

import HomeApiService from "../../../shared/services/api/HomeApiService";
import {
  handleSaveJob,
  handleUnsaveJob,
  getSavedJobs,
} from "../../../shared/services/utils/saveJob.js";
import { useAuth } from "../../../shared/contexts/AuthContext";

export default function JobSearchScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  const removeVietnameseTones = (str = "") =>
    str
      ?.normalize("NFD")
      ?.replace(/[\u0300-\u036f]/g, "")
      ?.replace(/đ/g, "d")
      ?.replace(/Đ/g, "D")
      ?.toLowerCase() || "";

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await HomeApiService.getJobs();
        const jobsData = Array.isArray(data) ? data : data.jobs || [];

        const jobsWithCompany = await Promise.all(
          jobsData.map(async (job) => {
            try {
              const companyData = await HomeApiService.getCompanyByEmployerId(
                job.employer_id
              );

              return {
                ...job,
                company_name: companyData.company_name || "Không rõ công ty",
                company_logo: companyData.company_logo || null,
                normalized_location: removeVietnameseTones(job.location || ""),
              };
            } catch {

              return {
                ...job,
                company_name: "Không rõ công ty",
                company_logo: null,
                normalized_location: removeVietnameseTones(job.location || ""),
              };
            }
          })
        );

        setJobs(jobsWithCompany);
        setFilteredJobs(jobsWithCompany);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        Alert.alert("Lỗi", "Không thể tải danh sách công việc");
      } finally {
        setLoading(false);
      }
    };

    const fetchSaved = async () => {
      if (user?.id) {
        try {
          const saved = await getSavedJobs(user.id);
          setSavedJobs(saved.map((item) => item.job_id));
        } catch (error) {
          console.error("Error fetching saved jobs:", error);
        }
      }
    };

    fetchJobs();
    fetchSaved();
  }, []);

  const handleSearch = () => {
    const query = removeVietnameseTones(searchQuery);
    const locationQuery = removeVietnameseTones(location);

    const results = jobs.filter((job) => {
      const titleMatch = removeVietnameseTones(job.title || "").includes(query);
      const companyMatch = removeVietnameseTones(
        job.company_name || ""
      ).includes(query);
      const locationMatch =
        !locationQuery || job.normalized_location.includes(locationQuery);

      return (titleMatch || companyMatch) && locationMatch;
    });

    setFilteredJobs(results);
  };

  const handleJobPress = (job) => navigation.navigate("JobDetail", { job });

  const handleFavoritePress = async (job) => {
    if (!user?.id) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để lưu công việc.");
      return;
    }

    const isSaved = savedJobs.includes(job.id);
    if (isSaved) {
      await handleUnsaveJob(job, user.id);
      setSavedJobs((prev) => prev.filter((id) => id !== job.id));
    } else {
      await handleSaveJob(job, user.id);
      setSavedJobs((prev) => [...prev, job.id]);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00b14f" />
        <Text style={{ marginTop: 10, color: "#666" }}>
          Đang tải danh sách việc làm...
        </Text>
      </View>
    );
  }

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

      <View style={{ flex: 1 }}>
        <Text style={styles.resultText}>
          Tìm thấy {filteredJobs.length} công việc
        </Text>

        <JobList
          jobs={filteredJobs}
          onJobPress={handleJobPress}
          onFavoritePress={handleFavoritePress}
          savedJobs={savedJobs}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  resultText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginVertical: 10,
    marginLeft: 20,
  },
});

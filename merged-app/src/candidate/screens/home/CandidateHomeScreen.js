import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../shared/contexts/AuthContext";
import JobList from "../../components/JobList";
import HomeApiService from "../../../shared/services/api/HomeApiService";
import {
  handleSaveJob,
  handleUnsaveJob,
  getSavedJobs,
} from "../../../shared/services/utils/saveJob.js";

export default function CandidateHomeScreen({ navigation }) {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    if (!user?.id) return;
    const saved = await getSavedJobs(user.id);
    console.log("Saved jobs API response:", saved);

    setSavedJobs(saved.map((item) => item.job_id));
  };

  const onFavoritePress = async (job) => {
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

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobList = await HomeApiService.getJobs();

        const jobsWithCompany = await Promise.all(
          jobList.map(async (job) => {
            try {
              const companyData = await HomeApiService.getCompanyByEmployerId(
                job.employer_id
              );
              return {
                ...job,
                company_name: companyData.company_name || "Không rõ công ty",
                company_logo: companyData.company_logo || null,
              };
            } catch {
              return {
                ...job,
                company_name: "Không rõ công ty",
                company_logo: null,
              };
            }
          })
        );

        setJobs(jobsWithCompany);
      } catch (error) {
        console.error("Error loading jobs:", error);
        Alert.alert("Lỗi", "Không thể tải danh sách công việc");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
    fetchSavedJobs(); 
  }, []);

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#00b14f"
        style={{ marginTop: 20 }}
      />
    );
  }

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

      <JobList
        jobs={jobs}
        onJobPress={(job) => navigation.navigate("JobDetail", { job })}
        onFavoritePress={onFavoritePress}
        savedJobs={savedJobs}
      />
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

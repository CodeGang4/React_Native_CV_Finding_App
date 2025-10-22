import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useAuth } from "../../shared/contexts/AuthContext";
import JobList from "./JobList";
import HomeApiService from "../../shared/services/api/HomeApiService";
import useSavedJobs from "../../shared/hooks/useSavedJobs";

export default function JobListSection({
  navigation,
  searchQuery = "",
  location = "",
  searchTrigger = 0,
}) {
  const { user } = useAuth();
  const { savedJobs, toggleSaveJob, fetchSavedJobs } = useSavedJobs();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const removeVietnameseTones = (str = "") =>
    str
      ?.normalize("NFD")
      ?.replace(/[\u0300-\u036f]/g, "")
      ?.replace(/đ/g, "d")
      ?.replace(/Đ/g, "D")
      ?.toLowerCase() || "";

  const isJobExpired = (job) => {
    if (job.is_expired) return true;
    if (job.expired_date) {
      const now = new Date();
      const expireDate = new Date(job.expired_date);
      return expireDate < now;
    }
    return false;
  };

  const loadJobs = async () => {
    try {
      const jobList = await HomeApiService.getJobs();
      if (!jobList || jobList.length === 0) {
        setJobs([]);
        return;
      }

      const validJobs = jobList.filter((job) => !isJobExpired(job));

      const uniqueEmployerIds = [...new Set(validJobs.map((job) => job.employer_id))];
      const companyMap = {};

      for (const id of uniqueEmployerIds) {
        try {
          const company = await HomeApiService.getCompanyByEmployerId(id);
          companyMap[id] = company;
        } catch {
          companyMap[id] = { company_name: "Không rõ công ty", company_logo: null };
        }
      }

      const jobsWithCompany = validJobs.map((job) => ({
        ...job,
        company_name:
          companyMap[job.employer_id]?.company_name || "Không rõ công ty",
        company_logo: companyMap[job.employer_id]?.company_logo || null,
      }));

      setJobs(jobsWithCompany);
      setFilteredJobs(jobsWithCompany);
    } catch (error) {
      console.error("❌ Error loading jobs:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách công việc");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTrigger === 0) return;

    const query = removeVietnameseTones(searchQuery);
    const loc = removeVietnameseTones(location);

    const filtered = jobs.filter((job) => {
      const titleMatch = removeVietnameseTones(job.title || "").includes(query);
      const companyMatch = removeVietnameseTones(job.company_name || "").includes(query);
      const locationMatch =
        !loc || removeVietnameseTones(job.location || "").includes(loc);
      return (titleMatch || companyMatch) && locationMatch;
    });

    setFilteredJobs(filtered);
  }, [searchTrigger]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadJobs(), fetchSavedJobs()]);
      setLoading(false);
    };
    if (isFocused) init();
  }, [isFocused]);

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
    <View style={{ flex: 1 }}>
      <JobList
        jobs={filteredJobs}
        onJobPress={(job) => navigation.navigate("JobDetail", { job })}
        onFavoritePress={toggleSaveJob}
        savedJobs={savedJobs}
      />
    </View>
  );
}

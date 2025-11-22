import React from "react";
import { View, ActivityIndicator, RefreshControl, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../shared/contexts/AuthContext";
import JobList from "./JobList";
import useSavedJobs from "../../shared/hooks/useSavedJobs";
import useJobs from "../../shared/hooks/useJobs";
import useJobFilter from "../../shared/hooks/useJobFilter";
import useRefresh from "../../shared/hooks/useRefresh";

export default function JobListSection({
  searchQuery = "",
  location = "",
  searchTrigger = 0,
  jobs: externalJobs = null,
  savedJobs: externalSavedJobs = null,
  refreshSavedJobs = null,
  scrollEnabled = true,
  limit = null,
  showSavedOnly = false, 
}) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { savedJobs, toggleSaveJob, fetchSavedJobs } = useSavedJobs();
  const { jobs, loading, loadJobs } = useJobs();
  const filteredJobs = useJobFilter(jobs, searchQuery, location, searchTrigger);
  const { refreshing, handleRefresh } = useRefresh([loadJobs, fetchSavedJobs]);

  const finalJobs = externalJobs || filteredJobs;
  const finalSavedJobs = externalSavedJobs || savedJobs;

  const filteredJobsBySave = showSavedOnly 
    ? finalJobs.filter(job => finalSavedJobs.includes(job.id))
    : finalJobs;

  const limitedJobs = limit ? filteredJobsBySave.slice(0, limit) : filteredJobsBySave;

  if (loading && !externalJobs) {
    return (
      <ActivityIndicator
        size="large"
        color="#00b14f"
        style={{ marginTop: 20 }}
      />
    );
  }

  if (showSavedOnly && filteredJobsBySave.length === 0 && !loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
          {loading ? "Đang tải..." : "Bạn chưa lưu công việc nào"}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ width: "100%"}}>
      <JobList
        jobs={limitedJobs} 
        onJobPress={(job) => {
          navigation.navigate("JobDetail", {
            job,
            company: {
              company_name: job.company_name,
              company_logo: job.company_logo,
              company_address: job.company_address,
            },
          });
        }}
        onFavoritePress={(job) => toggleSaveJob(job.id)}
        savedJobs={finalSavedJobs}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        scrollEnabled={scrollEnabled}
      />
    </View>
  );
}
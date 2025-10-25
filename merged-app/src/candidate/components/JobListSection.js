import React from "react";
import { View, ActivityIndicator, RefreshControl } from "react-native";
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
}) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { savedJobs, toggleSaveJob, fetchSavedJobs } = useSavedJobs();
  const { jobs, loading, loadJobs } = useJobs();
  const filteredJobs = useJobFilter(jobs, searchQuery, location, searchTrigger);
  const { refreshing, handleRefresh } = useRefresh([loadJobs, fetchSavedJobs]);

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
        onFavoritePress={(job) => toggleSaveJob(job.id)}
        savedJobs={savedJobs}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
}

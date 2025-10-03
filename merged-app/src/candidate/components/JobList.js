import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import JobCard from "./JobCard";
import JobApiService from "../../shared/services/api/JobApiService";

export default function JobList({ onJobPress }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await JobApiService.getAllJobs();
        console.log("Job data:", data);
        const jobsArray = Array.isArray(data) ? data : [data];
        setJobs(jobsArray);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
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

  if (!jobs || jobs.length === 0) {
    return (
      <Text style={{ textAlign: "center", marginTop: 20 }}>
        Không có job nào
      </Text>
    );
  }

  return (
    <FlatList
      data={jobs}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <JobCard job={item} onPress={onJobPress} />}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}

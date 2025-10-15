import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "../../shared/contexts/AuthContext";
import { useHomeData } from "../../shared/services/HomeDataManager";
import JobList from "../components/JobList";

export default function CandidateHomeScreen({ navigation }) {
  const { user } = useAuth();
  const { data, loading } = useHomeData();
  const { jobs } = data;

  const transformedJobs = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    company_name: job.company,
    salary: job.salary,
    location: job.location,
    logo: job.logo,
    company_logo: job.logo,
  }));

  if (loading.jobs) {
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
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Xin chào, {user?.username || "Bạn"}!
        </Text>
        <Text style={styles.subtitle}>Sẵn sàng tìm công việc mơ ước?</Text>
      </View>

      <JobList
        jobs={transformedJobs}
        onJobPress={(job) => navigation.navigate("JobDetail", { job })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { backgroundColor: "#00b14f", padding: 20, paddingTop: 40 },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: { fontSize: 16, color: "#fff", opacity: 0.9 },
});

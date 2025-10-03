import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../../shared/contexts/AuthContext";
import JobList from "../components/JobList";

export default function CandidateHomeScreen({ navigation }) {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Xin chào, {user?.username || "Bạn"}!</Text>
        <Text style={styles.subtitle}>Sẵn sàng tìm công việc mơ ước?</Text>
      </View>

      <JobList
        onJobPress={(job) =>
          navigation.navigate("JobDetail", { jobId: job.id })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { backgroundColor: "#00b14f", padding: 20, paddingTop: 40 },
  greeting: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 5 },
  subtitle: { fontSize: 16, color: "#fff", opacity: 0.9 },
});

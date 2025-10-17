import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useAuth } from "../../shared/contexts/AuthContext";
import { useJobActions } from "../../shared/hooks";
import JobList from "../components/JobList";

export default function CandidateHomeScreen({ navigation }) {
  const { user } = useAuth();
  const { saveJobWithNotification, loading: jobActionLoading } = useJobActions();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleSaveJob = async (job) => {
    console.log('🏠 CandidateHomeScreen: handleSaveJob called');
    console.log('📝 Job object:', JSON.stringify(job, null, 2));
    
    if (!job.id || !job.employer_id) {
      console.error('❌ Missing job info:', { jobId: job.id, employerId: job.employer_id });
      Alert.alert('Error', 'Thông tin job không đầy đủ');
      return;
    }

    const jobData = {
      title: job.title,
      company_name: job.company_name
    };

    console.log('📧 Calling saveJobWithNotification with:', {
      jobId: job.id,
      jobData,
      employerId: job.employer_id
    });

    const result = await saveJobWithNotification(job.id, jobData, job.employer_id);
    
    console.log('📬 SaveJob result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      Alert.alert('Success', 'Đã lưu job và gửi thông báo!');
    } else {
      Alert.alert('Error', result.error || 'Không thể lưu job');
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("http://192.168.1.3:3000/job/getJobs");
        const data = await response.json();
        console.log("Job API response:", data);

        let jobsData = Array.isArray(data) ? data : data.jobs || [];

        const jobsWithCompany = await Promise.all(
          jobsData.map(async (job) => {
            try {
              const res = await fetch(
                `http://192.168.1.3:3000/employer/getCompanyInfo/${job.employer_id}`
              );
              const companyData = await res.json();

              return {
                ...job,
                company_name: companyData.company_name || "Không rõ công ty",
                company_logo: companyData.company_logo || null,
              };
            } catch (err) {
              console.error("Lỗi fetch company info:", err);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Xin chào, {user?.username || "Bạn"}!
        </Text>
        <Text style={styles.subtitle}>Sẵn sàng tìm công việc mơ ước?</Text>
      </View>

      <JobList
        jobs={jobs}
        onJobPress={(job) => navigation.navigate("JobDetail", { job })}
        onFavoritePress={handleSaveJob}
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

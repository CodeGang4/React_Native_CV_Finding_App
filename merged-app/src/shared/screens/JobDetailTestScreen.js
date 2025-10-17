import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import JobOverviewSection from "../employer/components/jobDetail/JobOverviewSection";

// Sample job data for testing
const sampleJob = {
  id: "test-job-1",
  title: "Senior React Native Developer",
  description:
    "Chúng tôi đang tìm kiếm một Senior React Native Developer có kinh nghiệm phát triển ứng dụng mobile. Bạn sẽ làm việc trong một môi trường năng động và sáng tạo.",
  requirements:
    "- Có ít nhất 3 năm kinh nghiệm với React Native\n- Thành thạo JavaScript, TypeScript\n- Hiểu biết về Redux, Context API\n- Kinh nghiệm làm việc với REST API",
  benefits:
    "- Lương cạnh tranh từ 20-30 triệu\n- Bảo hiểm sức khỏe toàn diện\n- Du lịch công ty hàng năm\n- Cơ hội thăng tiến rõ ràng",
  salary: "20 - 30 triệu VNĐ",
  location: "Hà Nội",
  deadline: "2025-11-15",
  experience: "3+ năm kinh nghiệm",
  views: 150,
  applications: 25,
  shortlisted: 5,
  skills: ["React Native", "JavaScript", "TypeScript", "Redux"],
};

export default function JobDetailTestScreen() {
  const handleEdit = () => {
    console.log("Edit job pressed");
  };

  const handleDelete = () => {
    console.log("Delete job pressed");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Job Detail Test Screen</Text>
        <Text style={styles.headerSubtitle}>
          Testing JobOverviewSection component
        </Text>
      </View>

      <JobOverviewSection
        job={sampleJob}
        views={sampleJob.views}
        candidatesStats={{
          total: sampleJob.applications,
          shortlisted: sampleJob.shortlisted,
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#00b14f",
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
  },
});

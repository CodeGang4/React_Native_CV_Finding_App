import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CommonHeader from "../../../../shared/components/common/CommonHeader";
import { TAB_BAR_PADDING } from "../../../../shared/constants/layout";
import StatsBar from "../../components/StatsBar";
import ActionsBar from "../../components/ActionsBar";
import JobItem from "../../components/JobItem";
import CreateJobModal from "../../components/CreateJobModal";
import ManageTemplatesModal from "../../components/ManageTemplatesModal";

export default function JobPostingPage() {
  const navigation = useNavigation();
  const [showCreate, setShowCreate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Seed data adapted from legacy page (status mapped to VI labels)
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: "React Native Developer",
      status: "Đang tuyển",
      applications: 25,
      views: 150,
      createdDate: "15/09/2025",
      deadline: "30/09/2025",
      salary: "15-25 triệu",
      location: "Hà Nội",
    },
    {
      id: 2,
      title: "Senior PHP Developer",
      status: "Hết hạn",
      applications: 18,
      views: 89,
      createdDate: "10/09/2025",
      deadline: "25/09/2025",
      salary: "20-30 triệu",
      location: "TP.HCM",
    },
  ]);

  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "Mẫu thông báo phỏng vấn",
      subject: "Thông báo lịch phỏng vấn - {position}",
      content: "Chào {candidate_name},\n\nChúng tôi rất vui mừng thông báo...",
      uploadDate: "15/09/2025",
    },
    {
      id: 2,
      name: "Mẫu chúc mừng trúng tuyển",
      subject: "Chúc mừng bạn đã trúng tuyển vị trí {position}",
      content: "Chào {candidate_name},\n\nChúc mừng bạn đã được chọn...",
      uploadDate: "12/09/2025",
    },
  ]);

  const handleCreatePress = () => setShowCreate(true);
  const handleManageTemplatesPress = () => setShowTemplates(true);

  const handleSubmitJob = (jobData) => {
    const newJob = {
      id: Date.now(),
      title: jobData.title,
      salary: jobData.salary,
      location: jobData.location,
      experience: jobData.experience,
      deadline: jobData.deadline,
      jobType: jobData.jobType,
      description: jobData.description,
      requirements: jobData.requirements,
      benefits: jobData.benefits,
      skills: jobData.skills,
      status: "Đang tuyển",
      applications: 0,
      views: 0,
      createdDate: new Date().toLocaleDateString("vi-VN"),
    };
    setJobs((prev) => [newJob, ...prev]);
    setShowCreate(false);
    Alert.alert("Thành công", "Đã đăng tin tuyển dụng mới!");
  };

  const handleEditJob = (updatedJob) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === updatedJob.id ? { ...j, ...updatedJob } : j))
    );
    Alert.alert("Thành công", "Đã cập nhật tin tuyển dụng!");
  };

  const handleDeleteJob = (jobId) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    Alert.alert("Đã xoá", "Tin tuyển dụng đã được xoá");
  };

  const handleCreateTemplate = (tpl) => {
    setTemplates((prev) => [tpl, ...prev]);
  };

  const handleUploadTemplate = (tpl) => {
    setTemplates((prev) => [tpl, ...prev]);
  };

  const totalApplications = jobs.reduce(
    (sum, j) => sum + (j.applications || 0),
    0
  );

  return (
    <View style={styles.container}>
      <CommonHeader
        title="Quản lý tuyển dụng"
        onBack={() => {}}
        showAI={false}
      />
      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={TAB_BAR_PADDING}
      >
        <StatsBar
          jobs={jobs.length}
          applications={totalApplications}
          templates={templates.length}
        />
        <ActionsBar
          onCreatePress={handleCreatePress}
          onManageTemplatesPress={handleManageTemplatesPress}
        />
        <Text style={styles.sectionTitle}>Tin tuyển dụng gần đây</Text>
        <View>
          {jobs.map((job) => (
            <JobItem
              key={job.id}
              job={job}
              onPress={(j) =>
                navigation.navigate("JobDetail", {
                  job: j,
                  onEdit: handleEditJob,
                  onDelete: handleDeleteJob,
                })
              }
            />
          ))}
        </View>
      </ScrollView>
      <CreateJobModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleSubmitJob}
      />
      <ManageTemplatesModal
        visible={showTemplates}
        onClose={() => setShowTemplates(false)}
        templates={templates}
        onCreate={handleCreateTemplate}
        onUpload={handleUploadTemplate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
});

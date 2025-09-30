import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  registerCallbacks,
  unregisterCallbacks,
} from "../../../../services/utils/callbackRegistry";
import CommonHeader from "../../../components/common/CommonHeader";
import { TAB_BAR_PADDING } from "../../../styles/layout";
import StatsBar from "../../../components/jobs/StatsBar";
import JobFiltersBar from "../../../components/jobs/JobFiltersBar";
import ActionsBar from "../../../components/jobs/ActionsBar";
import JobItem from "../../../components/jobs/JobItem";
import CreateJobModal from "../../../components/jobs/CreateJobModal";
import ManageTemplatesModal from "../../../components/jobs/ManageTemplatesModal";

export default function JobPostingPage() {
  const navigation = useNavigation();
  const [showCreate, setShowCreate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: "Senior React Native Developer",
      company: "Công ty Cổ phần TCC & Partners",
      salary: "15 - 25 triệu",
      location: "Hà Nội",
      experience: "2-3 năm",
      deadline: "30/09/2025",
      postedDate: "10/09/2025",
      status: "Đang tuyển",
      views: 156,
      applications: 8,
      shortlisted: 2,
      rejected: 3,
      pending: 3,
      jobType: "Toàn thời gian",
      description:
        "Chúng tôi đang tìm kiếm một Senior React Native Developer có kinh nghiệm để tham gia phát triển các ứng dụng mobile chất lượng cao...",
      requirements: [
        "Có ít nhất 2 năm kinh nghiệm với React Native",
        "Thành thạo JavaScript, TypeScript",
        "Kinh nghiệm với Redux, Context API",
        "Hiểu biết về Native Modules",
        "Kỹ năng giao tiếp tốt",
      ],
      benefits: [
        "Mức lương cạnh tranh 15-25 triệu",
        "Thưởng hiệu suất hàng quý",
        "Bảo hiểm đầy đủ theo quy định",
        "Môi trường làm việc năng động",
        "Cơ hội học hỏi và phát triển",
      ],
      skills: ["React Native", "JavaScript", "TypeScript", "Redux"],
      workLocation: "Tầng 12, Tòa nhà ABC, 123 Đường XYZ, Hà Nội",
      workTime: "Thứ 2 - Thứ 6: 8:00 - 17:30",
    },
    {
      id: 2,
      title: "Junior PHP Developer",
      company: "Công ty Cổ phần TCC & Partners",
      salary: "8 - 12 triệu",
      location: "Hà Nội",
      experience: "Không yêu cầu",
      deadline: "25/09/2025",
      postedDate: "05/09/2025",
      status: "Đang tuyển",
      views: 247,
      applications: 12,
      shortlisted: 3,
      rejected: 7,
      pending: 2,
      jobType: "Toàn thời gian",
      description:
        "Chúng tôi đang tìm kiếm một PHP Developer để tham gia vào team phát triển sản phẩm...",
      requirements: [
        "Hiểu biết về PHP, MySQL, HTML, CSS, Javascript",
        "Khả năng làm việc nhóm tốt",
        "Chịu được áp lực công việc",
      ],
      benefits: [
        "Mức lương cạnh tranh 8-12 triệu",
        "Thưởng hiệu suất hàng quý",
        "Bảo hiểm đầy đủ theo quy định",
        "Môi trường làm việc năng động",
        "Cơ hội học hỏi và phát triển",
      ],
      skills: ["PHP", "MySQL", "HTML", "CSS", "Javascript"],
      workLocation: "Tầng 12, Tòa nhà ABC, 123 Đường XYZ, Hà Nội",
      workTime: "Thứ 2 - Thứ 6: 8:00 - 17:30",
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

  const filteredJobs = jobs.filter((j) => {
    const matchStatus =
      statusFilter === "all" ? true : (j.status || "").trim() === statusFilter;
    const q = searchText.trim().toLowerCase();
    const matchQuery =
      q.length === 0 ||
      (j.title || "").toLowerCase().includes(q) ||
      (j.company || "").toLowerCase().includes(q) ||
      (j.location || "").toLowerCase().includes(q);
    return matchStatus && matchQuery;
  });

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
        <JobFiltersBar
          searchText={searchText}
          onChangeSearch={setSearchText}
          status={statusFilter}
          onChangeStatus={setStatusFilter}
        />
        <Text style={styles.sectionTitle}>Tin tuyển dụng gần đây</Text>
        <View>
          {filteredJobs.map((job) => (
            <JobItem
              key={job.id}
              job={job}
              onPress={(j) => {
                const cbKey = `jobdetail:${j.id}`;
                registerCallbacks(cbKey, {
                  onEdit: handleEditJob,
                  onDelete: handleDeleteJob,
                });
                navigation.navigate("JobDetail", { job: j, cbKey });
              }}
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

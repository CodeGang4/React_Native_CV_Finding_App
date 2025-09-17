import React, { useState, useRef } from "react";
import { View, StyleSheet, Animated, Alert } from "react-native";
import JobDetailPage from "./JobDetailPage";
import CreateJobModal from "../../jobPosting/components/CreateJobModal";
import AccountTabs from "../components/AccountTabs";
import CompanyProfileCard from "../components/CompanyProfileCard";
import CompanyTabSection from "../components/CompanyTabSection";
import JobsTabSection from "../components/JobsTabSection";
import AccountSettingsSection from "../components/AccountSettingsSection";
import EditCompanyModal from "../components/EditCompanyModal";

const EmployerAccountPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isRecruiting, setIsRecruiting] = useState(true);
  const [allowContactFromCandidates, setAllowContactFromCandidates] =
    useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedCompanyInfo, setEditedCompanyInfo] = useState(null);

  // Job-related states
  const [currentPage, setCurrentPage] = useState("main"); // main, jobDetail
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  // const [showEditJobModal, setShowEditJobModal] = useState(false); // not used
  const [jobsList, setJobsList] = useState([
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

  const scrollY = useRef(new Animated.Value(0)).current;

  const cardTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -35],
    extrapolate: "clamp",
  });

  const greenBackgroundOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  const greenBackgroundScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const tabs = ["Công ty", "Tin tuyển dụng", "Cài đặt"];

  const companyInfo = {
    name: "Công ty Cổ phần TCC & Partners",
    code: "NTD123456",
    employees: "25-99 nhân viên",
    logo: "https://via.placeholder.com/80x80/cccccc/666666?text=TCC",
    address: "Số 132 Nguyễn Thái Học, phường Điện Biên, quận Ba Đình, Hà Nội",
    website: "https://tcc-agency.com/",
    description:
      "TCC & Partners là đơn vị Marketing thuê ngoài độc lập chuyên cung cấp giải pháp chiến lược và triển khai hoạt động Marketing nhằm tối ưu hóa chi phí và hiệu quả hoạt động cho các đơn vị đối tác.",
  };

  const handleEditCompany = () => {
    setEditedCompanyInfo({ ...companyInfo });
    setShowEditModal(true);
  };

  const handleSaveCompany = () => {
    setShowEditModal(false);
  };

  const handleJobPress = (job) => {
    setSelectedJob(job);
    setCurrentPage("jobDetail");
  };

  const handleCreateJobPress = () => {
    setShowCreateJobModal(true);
  };

  const handleJobSubmit = (newJob) => {
    const job = {
      ...newJob,
      id: Date.now(),
      company: companyInfo.name,
      postedDate: new Date().toLocaleDateString("vi-VN"),
      status: "Đang tuyển",
      views: 0,
      applications: 0,
      shortlisted: 0,
      rejected: 0,
      pending: 0,
      workLocation: companyInfo.address,
      workTime: "Thứ 2 - Thứ 6: 8:00 - 17:30",
    };
    setJobsList((prevJobs) => [job, ...prevJobs]);
    setShowCreateJobModal(false);
  };

  const handleEditJob = (updatedJob) => {
    setJobsList((prevJobs) =>
      prevJobs.map((job) => (job.id === updatedJob.id ? updatedJob : job))
    );
    setSelectedJob(updatedJob);
  };

  const handleDeleteJob = (jobId) => {
    setJobsList((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
    setCurrentPage("main");
    setSelectedJob(null);
  };

  const handleBackPress = () => {
    setCurrentPage("main");
    setSelectedJob(null);
    scrollY.setValue(0);
  };

  const renderCompanyTab = () => (
    <CompanyTabSection
      companyInfo={companyInfo}
      isRecruiting={isRecruiting}
      onToggleRecruiting={setIsRecruiting}
      allowContactFromCandidates={allowContactFromCandidates}
      onToggleAllowContact={setAllowContactFromCandidates}
      onEditCompany={handleEditCompany}
    />
  );

  const renderJobsTab = () => (
    <JobsTabSection
      jobs={jobsList}
      onCreatePress={handleCreateJobPress}
      onJobPress={handleJobPress}
    />
  );

  const renderSettingsTab = () => <AccountSettingsSection />;

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return renderCompanyTab();
      case 1:
        return renderJobsTab();
      case 2:
        return renderSettingsTab();
      default:
        return renderCompanyTab();
    }
  };

  if (currentPage === "jobDetail" && selectedJob) {
    return (
      <JobDetailPage
        job={selectedJob}
        onBack={handleBackPress}
        onEdit={handleEditJob}
        onDelete={handleDeleteJob}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.companyCardWrapper,
            {
              transform: [{ translateY: cardTranslateY }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.cardGreenBackground,
              {
                opacity: greenBackgroundOpacity,
                transform: [{ scaleY: greenBackgroundScale }],
              },
            ]}
          />

          <CompanyProfileCard
            companyInfo={companyInfo}
            onUpgrade={() =>
              Alert.alert(
                "Nâng cấp",
                "Tính năng nâng cấp tài khoản đang phát triển"
              )
            }
          />
        </Animated.View>

        <AccountTabs
          tabs={tabs}
          activeIndex={activeTab}
          onChange={setActiveTab}
        />

        {renderContent()}
      </Animated.ScrollView>

      <EditCompanyModal
        visible={showEditModal}
        initialInfo={editedCompanyInfo}
        onClose={() => setShowEditModal(false)}
        onSave={() => {
          handleSaveCompany();
        }}
      />

      <CreateJobModal
        visible={showCreateJobModal}
        onClose={() => setShowCreateJobModal(false)}
        onSubmit={handleJobSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  companyCardWrapper: {
    paddingHorizontal: 20,
    paddingTop: 60,
    marginBottom: 20,
    zIndex: 1,
    position: "relative",
  },
  cardGreenBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: "#4CAF50",
    zIndex: -1,
  },
  scrollView: {
    flex: 1,
  },
});

export default EmployerAccountPage;

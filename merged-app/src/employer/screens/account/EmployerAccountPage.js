import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Alert,
  ActivityIndicator,
} from "react-native";
import JobDetailPage from "./JobDetailPage";
import CreateJobModal from "../../components/jobs/CreateJobModal";
import AccountTabs from "../../components/account/AccountTabs";
import CompanyProfileCard from "../../components/account/CompanyProfileCard";
import CompanyTabSection from "../../components/account/CompanyTabSection";
import JobsTabSection from "../../components/account/JobsTabSection";
import AccountSettingsSection from "../../components/account/AccountSettingsSection";
import EditCompanyModal from "../../components/account/EditCompanyModal";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { useCompanyInfo } from "../../../shared/hooks/useCompanyInfo";
import { useEmployerJobs } from "../../../shared/hooks/useEmployerJobs";

const EmployerAccountPage = () => {
  const { user } = useAuth();
  const {
    companyInfo,
    loading,
    error,
    updating,
    updateCompanyInfoWithFeedback,
    refreshCompanyInfo,
  } = useCompanyInfo();

  const {
    jobs,
    jobStats,
    loading: jobsLoading,
    creating: jobsCreating,
    updating: jobsUpdating,
    createJobWithFeedback,
    updateJobWithFeedback,
    deleteJobWithConfirmation,
  } = useEmployerJobs();

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

  // Default company info nếu chưa có dữ liệu
  const defaultCompanyInfo = {
    name: "Chưa cập nhật",
    code: "N/A",
    employees: "Chưa cập nhật",
    logo: null,
    address: "Chưa cập nhật",
    website: "Chưa cập nhật",
    description: "Chưa có mô tả về công ty",
  };

  // Sử dụng dữ liệu từ API hoặc default
  const displayCompanyInfo = companyInfo || defaultCompanyInfo;

  const handleEditCompany = () => {
    if (companyInfo) {
      // Transform dữ liệu cho form edit
      const editData = {
        name: companyInfo.name,
        address: companyInfo.address,
        website: companyInfo.website,
        description: companyInfo.description,
        company_size: companyInfo.employees,
        industry: companyInfo.industry,
        contact_person: companyInfo.contactPerson,
      };
      setEditedCompanyInfo(editData);
    }
    setShowEditModal(true);
  };

  const handleSaveCompany = async (formData) => {
    if (!formData) {
      setShowEditModal(false);
      return;
    }

    try {
      // Transform form data để phù hợp với API
      const updateData = {
        company_website: formData.website,
        company_size: formData.company_size || formData.employees,
        industry: formData.industry,
        company_address: formData.address,
        contact_person: formData.contact_person,
        description: formData.description,
      };

      await updateCompanyInfoWithFeedback(updateData);
      setShowEditModal(false);
    } catch (error) {
      // Error đã được handle trong hook
      console.error("Save company error:", error);
    }
  };

  const handleJobPress = (job) => {
    setSelectedJob(job);
    setCurrentPage("jobDetail");
  };

  const handleCreateJobPress = () => {
    setShowCreateJobModal(true);
  };

  const handleJobSubmit = async (newJob) => {
    try {
      console.log("Submitting new job:", newJob);

      // Dữ liệu đã được format đúng từ CreateJobModal, chỉ cần submit
      const jobData = {
        ...newJob,
        // Có thể thêm các thông tin bổ sung nếu cần
      };

      await createJobWithFeedback(jobData);
      setShowCreateJobModal(false);
    } catch (error) {
      // Error đã được handle trong hook
      console.error("Submit job error:", error);
    }
  };

  const handleEditJob = async (updatedJob) => {
    try {
      const result = await updateJobWithFeedback(updatedJob.id, updatedJob);
      if (result) {
        setSelectedJob(result);
      }
    } catch (error) {
      // Error đã được handle trong hook
      console.error("Edit job error:", error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      const job = jobs.find((j) => j.id === jobId);
      const jobTitle = job ? job.title : "tin tuyển dụng này";

      // Navigate về trang chính ngay khi user confirm delete
      const deleted = await deleteJobWithConfirmation(jobId, jobTitle);
      if (deleted) {
        // Navigate về trang chính ngay lập tức
        setCurrentPage("main");
        setSelectedJob(null);
      }
    } catch (error) {
      // Error đã được handle trong hook
      console.error("Delete job error:", error);
      // Nếu có lỗi, vẫn navigate về trang chính để tránh stuck
      setCurrentPage("main");
      setSelectedJob(null);
    }
  };

  const handleBackPress = () => {
    setCurrentPage("main");
    setSelectedJob(null);
    scrollY.setValue(0);
  };

  const renderCompanyTab = () => (
    <CompanyTabSection
      companyInfo={displayCompanyInfo}
      isRecruiting={isRecruiting}
      onToggleRecruiting={setIsRecruiting}
      allowContactFromCandidates={allowContactFromCandidates}
      onToggleAllowContact={setAllowContactFromCandidates}
      onEditCompany={handleEditCompany}
      loading={loading}
      updating={updating}
    />
  );

  const renderJobsTab = () => (
    <JobsTabSection
      jobs={jobs}
      jobStats={jobStats}
      loading={jobsLoading}
      creating={jobsCreating}
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

  if (currentPage === "jobDetail") {
    // Nếu selectedJob không tồn tại (có thể đã bị xóa), tự động quay về trang chính
    if (!selectedJob) {
      setTimeout(() => {
        setCurrentPage("main");
      }, 0);
      return (
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      );
    }

    return (
      <JobDetailPage
        job={selectedJob}
        onBack={handleBackPress}
        onEdit={handleEditJob}
        onDelete={handleDeleteJob}
        loading={jobsUpdating}
      />
    );
  }

  // Hiển thị loading khi đang tải dữ liệu lần đầu
  if (loading && !companyInfo) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
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
            companyInfo={displayCompanyInfo}
            loading={loading}
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
        loading={updating}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveCompany}
      />

      <CreateJobModal
        visible={showCreateJobModal}
        onClose={() => setShowCreateJobModal(false)}
        onSubmit={handleJobSubmit}
        loading={jobsCreating}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
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

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  Switch,
  Animated,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import JobDetailPage from "../JobDetailPage";
import CreateJobModal from "../CreateJobModal";

const { width } = Dimensions.get("window");

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
  const [showEditJobModal, setShowEditJobModal] = useState(false);
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

  // Animation cho card di chuyển lên và cố định ở trên
  const cardTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -35], // Di chuyển lên và cố định cách top 25px
    extrapolate: "clamp",
  });

  // Animation để quyết định khi nào card sẽ sticky
  const cardPositionMode = scrollY.interpolate({
    inputRange: [0, 80, 100],
    outputRange: [0, 0, 1], // 0 = relative, 1 = absolute (sticky)
    extrapolate: "clamp",
  });

  // Animation cho nền xanh nhỏ phía sau card - ẩn/hiện khi scroll
  const greenBackgroundOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [1, 0.5, 0], // Từ hiện rõ -> mờ dần -> ẩn hoàn toàn
    extrapolate: "clamp",
  });

  // Animation cho nền xanh nhỏ phía sau card - scale
  const greenBackgroundScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0], // Thu nhỏ dần khi scroll
    extrapolate: "clamp",
  });

  // Animation để card có position sticky khi scroll
  const cardPosition = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
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
    // Logic để lưu thông tin công ty
    setShowEditModal(false);
  };

  // Job-related handlers
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
    <View style={styles.tabContent}>
      {/* Company Information Section */}
      <View style={styles.companyInfoCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Thông tin công ty</Text>
          <TouchableOpacity
            onPress={handleEditCompany}
            style={styles.editButton}
          >
            <MaterialIcons name="edit" size={20} color="#4CAF50" />
            <Text style={styles.editButtonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="business" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Tên công ty</Text>
            <Text style={styles.infoValue}>{companyInfo.name}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="badge" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Mã số thuế</Text>
            <Text style={styles.infoValue}>{companyInfo.code}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="people" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Quy mô</Text>
            <Text style={styles.infoValue}>{companyInfo.employees}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Địa chỉ</Text>
            <Text style={styles.infoValue}>{companyInfo.address}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="language" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Website</Text>
            <Text style={[styles.infoValue, styles.linkText]}>
              {companyInfo.website}
            </Text>
          </View>
        </View>
      </View>

      {/* Company Description */}
      <View style={styles.companyInfoCard}>
        <Text style={styles.cardTitle}>Giới thiệu công ty</Text>
        <Text style={styles.descriptionText}>{companyInfo.description}</Text>
      </View>

      {/* Recruitment Settings */}
      <View style={styles.companyInfoCard}>
        <Text style={styles.cardTitle}>Cài đặt tuyển dụng</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Đang tuyển dụng</Text>
            <Text style={styles.settingDescription}>
              Hiển thị trạng thái tuyển dụng
            </Text>
          </View>
          <Switch
            value={isRecruiting}
            onValueChange={setIsRecruiting}
            trackColor={{ false: "#ddd", true: "#4CAF50" }}
            thumbColor={isRecruiting ? "#fff" : "#fff"}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Cho phép ứng viên liên hệ</Text>
            <Text style={styles.settingDescription}>
              Ứng viên có thể liên hệ trực tiếp
            </Text>
          </View>
          <Switch
            value={allowContactFromCandidates}
            onValueChange={setAllowContactFromCandidates}
            trackColor={{ false: "#ddd", true: "#4CAF50" }}
            thumbColor={allowContactFromCandidates ? "#fff" : "#fff"}
          />
        </View>

        <View style={styles.contactPreferences}>
          <View style={styles.preferenceItem}>
            <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.preferenceText}>Nhận tin qua TopConnect</Text>
          </View>
          <View style={styles.preferenceItem}>
            <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.preferenceText}>Email và số điện thoại</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderJobsTab = () => (
    <View style={styles.tabContent}>
      {/* Job Stats */}
      <View style={styles.jobStatsContainer}>
        <View style={styles.statCard}>
          <MaterialIcons name="work" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{jobsList.length}</Text>
          <Text style={styles.statLabel}>Tin đã đăng</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="people" size={24} color="#2196F3" />
          <Text style={styles.statNumber}>
            {jobsList.reduce((sum, job) => sum + job.applications, 0)}
          </Text>
          <Text style={styles.statLabel}>Ứng viên nhận</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="trending-up" size={24} color="#FF9800" />
          <Text style={styles.statNumber}>
            {jobsList.filter((job) => job.status === "Đang tuyển").length}
          </Text>
          <Text style={styles.statLabel}>Tin đang tuyển</Text>
        </View>
      </View>

      {/* Create Job Button */}
      <TouchableOpacity
        style={styles.createJobButton}
        onPress={handleCreateJobPress}
      >
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={styles.createJobButtonText}>Đăng tin tuyển dụng mới</Text>
      </TouchableOpacity>

      {/* Jobs List */}
      {jobsList.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="work-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có tin tuyển dụng nào</Text>
          <Text style={styles.emptySubText}>
            Hãy đăng tin tuyển dụng đầu tiên của bạn
          </Text>
        </View>
      ) : (
        <View style={styles.jobsList}>
          {jobsList.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              onPress={() => handleJobPress(job)}
            >
              <View style={styles.jobCardHeader}>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.jobSalary}>{job.salary}</Text>
                  <Text style={styles.jobLocation}>{job.location}</Text>
                </View>
                <View style={styles.jobStatus}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          job.status === "Đang tuyển" ? "#4CAF50" : "#757575",
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>{job.status}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.jobCardStats}>
                <View style={styles.jobStat}>
                  <MaterialIcons name="visibility" size={16} color="#666" />
                  <Text style={styles.jobStatText}>{job.views} lượt xem</Text>
                </View>
                <View style={styles.jobStat}>
                  <MaterialIcons name="people" size={16} color="#666" />
                  <Text style={styles.jobStatText}>
                    {job.applications} ứng viên
                  </Text>
                </View>
                <View style={styles.jobStat}>
                  <MaterialIcons name="schedule" size={16} color="#666" />
                  <Text style={styles.jobStatText}>
                    Hết hạn: {job.deadline}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderSettingsTab = () => (
    <View style={styles.tabContent}>
      {/* Account Settings Section */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionHeaderText}>Cài đặt tài khoản</Text>

        <TouchableOpacity style={styles.settingsItem}>
          <MaterialIcons name="workspace-premium" size={24} color="#FF9800" />
          <Text style={styles.settingsItemText}>Nâng cấp tài khoản VIP</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <MaterialIcons name="key" size={24} color="#2196F3" />
          <Text style={styles.settingsItemText}>Đổi mật khẩu</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <MaterialIcons name="security" size={24} color="#4CAF50" />
          <Text style={styles.settingsItemText}>Cài đặt bảo mật</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <MaterialIcons name="email" size={24} color="#FF5722" />
          <Text style={styles.settingsItemText}>Cài đặt thông báo email</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <MaterialIcons name="lock" size={24} color="#9C27B0" />
          <Text style={styles.settingsItemText}>Vô hiệu hóa tài khoản</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Policy and Support Section */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionHeaderText}>Chính sách và hỗ trợ</Text>

        <TouchableOpacity style={styles.settingsItem}>
          <MaterialIcons name="description" size={24} color="#607D8B" />
          <Text style={styles.settingsItemText}>Về TopCV</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <MaterialIcons name="gavel" size={24} color="#795548" />
          <Text style={styles.settingsItemText}>Điều khoản dịch vụ</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <MaterialIcons name="privacy-tip" size={24} color="#009688" />
          <Text style={styles.settingsItemText}>Chính sách bảo mật</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <MaterialIcons name="support-agent" size={24} color="#3F51B5" />
          <Text style={styles.settingsItemText}>Trợ giúp</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <MaterialIcons name="thumb-up" size={24} color="#E91E63" />
          <Text style={styles.settingsItemText}>Đánh giá ứng dụng</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <MaterialIcons name="update" size={24} color="#00BCD4" />
          <Text style={styles.settingsItemText}>Kiểm tra bản cập nhật mới</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View style={styles.versionSection}>
        <Text style={styles.versionText}>Phiên bản ứng dụng: 5.6.25</Text>
        <TouchableOpacity style={styles.logoutButton}>
          <MaterialIcons name="logout" size={20} color="#666" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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

  // Show JobDetailPage if currentPage is "jobDetail"
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
        {/* Company Card với animated transform */}
        <Animated.View
          style={[
            styles.companyCardWrapper,
            {
              transform: [{ translateY: cardTranslateY }],
            },
          ]}
        >
          {/* Nền xanh nhỏ phía sau card */}
          <Animated.View
            style={[
              styles.cardGreenBackground,
              {
                opacity: greenBackgroundOpacity,
                transform: [{ scaleY: greenBackgroundScale }],
              },
            ]}
          />

          <View style={styles.companyCard}>
            <View style={styles.companyHeader}>
              <View style={styles.companyLogoContainer}>
                <Image
                  source={{ uri: companyInfo.logo }}
                  style={styles.companyLogo}
                />
              </View>
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>{companyInfo.name}</Text>
                <Text style={styles.companyCode}>{companyInfo.code}</Text>
                <Text style={styles.companyEmployees}>
                  {companyInfo.employees}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Nâng cấp tài khoản</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.tab, activeTab === index && styles.activeTab]}
              onPress={() => setActiveTab(index)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === index && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>{renderContent()}</View>
      </Animated.ScrollView>

      {/* Edit Company Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa thông tin công ty</Text>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tên công ty</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedCompanyInfo?.name}
                  onChangeText={(text) =>
                    setEditedCompanyInfo({ ...editedCompanyInfo, name: text })
                  }
                  placeholder="Nhập tên công ty"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Địa chỉ</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={editedCompanyInfo?.address}
                  onChangeText={(text) =>
                    setEditedCompanyInfo({
                      ...editedCompanyInfo,
                      address: text,
                    })
                  }
                  placeholder="Nhập địa chỉ công ty"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Website</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedCompanyInfo?.website}
                  onChangeText={(text) =>
                    setEditedCompanyInfo({
                      ...editedCompanyInfo,
                      website: text,
                    })
                  }
                  placeholder="Nhập website công ty"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Giới thiệu công ty</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={editedCompanyInfo?.description}
                  onChangeText={(text) =>
                    setEditedCompanyInfo({
                      ...editedCompanyInfo,
                      description: text,
                    })
                  }
                  placeholder="Nhập mô tả về công ty"
                  multiline
                  numberOfLines={5}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSaveCompany}
              >
                <Text style={styles.submitButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Job Modal */}
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
    paddingTop: 60, // Tăng từ 50px lên 60px để cách top 10px nhiều hơn
    marginBottom: 20,
    zIndex: 1,
    position: "relative",
  },
  cardGreenBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 150, // Chiều dài từ top đến khoảng giữa card (khoảng 90px)
    backgroundColor: "#4CAF50",
    zIndex: -1, // Đặt phía sau card
  },
  companyCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  companyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 0, // Điều chỉnh để nội dung không bị sát biên khi mở rộng
  },
  companyLogoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
    flexShrink: 0, // Không cho logo bị thu nhỏ
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  companyInfo: {
    flex: 1,
    minWidth: 0, // Để text có thể wrap khi cần
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
    flexWrap: "wrap", // Cho phép text wrap
  },
  companyCode: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  companyEmployees: {
    fontSize: 14,
    color: "#666",
  },
  upgradeButton: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 0, // Để button có thể mở rộng theo card
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 0, // Không cần marginTop nữa
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#4CAF50",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 10, // Giảm từ 20px xuống 10px (1 nửa)
  },
  // Company Tab Styles
  companyInfoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#f0f8f0",
  },
  editButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  linkText: {
    color: "#4CAF50",
    textDecorationLine: "underline",
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    marginTop: 10,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: "#666",
  },
  contactPreferences: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  preferenceText: {
    fontSize: 14,
    color: "#4CAF50",
    marginLeft: 8,
    fontWeight: "500",
  },
  // Settings Tab Styles
  settingsSection: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    padding: 20,
    paddingBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingsItemText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  versionSection: {
    alignItems: "center",
    padding: 20,
  },
  versionText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logoutText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: width - 40,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    maxHeight: 400,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
  },
  // Jobs Tab Styles
  jobStatsContainer: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  createJobButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  createJobButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  jobsList: {
    gap: 12,
  },
  jobCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  jobCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  jobSalary: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
    marginBottom: 2,
  },
  jobLocation: {
    fontSize: 14,
    color: "#666",
  },
  jobStatus: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  jobCardStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  jobStat: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  jobStatText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 5,
  },
});

export default EmployerAccountPage;

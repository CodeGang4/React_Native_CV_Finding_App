import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import CommonHeader from "../../../components/common/CommonHeader";
import { TAB_BAR_PADDING } from "../../../../shared/styles/layout";
import JobCard from "../../../components/home/cards/JobCard";
import { useHomeData } from "../../../../shared/services/HomeDataManager";
import { useAuth } from "../../../../shared/contexts/AuthContext";
import HomeApiService from "../../../../shared/services/api/HomeApiService";
import JobDetailScreen from "../../shared/JobDetailScreen";
import CandidateDetailNavigationScreen from "../../shared/CandidateDetailNavigationScreen";

const bestJobs = [
  {
    id: 1,
    title: "Java Developer",
    company: "Công ty TNHH Thu phí tự động VETC",
    salary: "Tới 1,600 USD",
    location: "Hà Nội",
    logo: "VETC",
    logoColor: "#00b14f",
    verified: true,
    backgroundColor: "#e8f5e8",
  },
  {
    id: 2,
    title:
      "Backend Developer (Node.Js) – – Thu Nhập Gross Upto 32 Triệu (Hà...",
    company: "Open Reach Tech Hanoi",
    salary: "20 - 32 triệu",
    location: "Hà Nội",
    logo: "ORT",
    logoColor: "#4a90e2",
    verified: false,
    backgroundColor: "#e8f5e8",
  },
  {
    id: 3,
    title: "Senior Front-End Developer (Angular)",
    company: "Ngân hàng TMCP Hàng Hải Việt Nam (M...",
    salary: "1,000 - 2,000 USD",
    location: "Hà Nội",
    logo: "MSB",
    logoColor: "#e74c3c",
    verified: true,
    backgroundColor: "#e8f5e8",
  },
  {
    id: 4,
    title: "Unity Developer Intern (8 - 12M Net)",
    company: "Công ty Cổ phần Falcon Technology",
    salary: "8 - 12 triệu",
    location: "Hà Nội",
    logo: "🦅",
    logoColor: "#f39c12",
    verified: true,
    backgroundColor: "#e8f5e8",
  },
  {
    id: 5,
    title: "Software Developer",
    company: "GOOD FOOD CO., LTD",
    salary: "20 - 25 triệu",
    location: "Hồ Chí Minh",
    logo: "GF",
    logoColor: "#cc0000",
    verified: true,
    backgroundColor: "#fff",
  },
];

const filterOptions = {
  industries: [
    "Tất cả",
    "Kinh doanh / Bán hàng",
    "Biên / Phiên dịch",
    "Báo chí / Truyền hình",
    "Bưu chính - Viễn thông",
    "Bảo hiểm",
    "Bất động sản",
    "Chứng khoán / Vàng / Ngoại tệ",
    "Công nghệ cao",
    "Cơ khí / Chế tạo / Tự động hóa",
    "Du lịch",
    "Dầu khí/Hóa chất",
    "Dệt may / Da giày",
  ],
  jobTypes: [
    "Tất cả",
    "Toàn thời gian",
    "Bán thời gian",
    "Thực tập",
    "Làm tại nhà",
  ],
  salaryRanges: [
    "Tất cả",
    "Dưới 10 triệu",
    "10 - 15 triệu",
    "15 - 20 triệu",
    "20 - 25 triệu",
    "25 - 30 triệu",
    "30 - 50 triệu",
    "Trên 50 triệu",
    "Thỏa thuận",
  ],
  experienceLevels: [
    "Tất cả",
    "Sắp đi làm",
    "Dưới 1 năm",
    "1 - 3 năm",
    "3 - 5 năm",
    "5 - 10 năm",
    "Trên 10 năm",
  ],
};

const FilterModal = ({
  visible,
  onClose,
  title,
  options,
  selectedOption,
  onSelectOption,
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>×</Text>
          </TouchableOpacity>
        </View>
        {title !== "Chọn số năm kinh nghiệm" && (
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm..."
              placeholderTextColor="#999"
            />
          </View>
        )}
        <ScrollView style={styles.optionsList}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionItem}
              onPress={() => {
                onSelectOption(option);
                onClose();
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedOption === option && styles.selectedOptionText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {title === "Chọn số năm kinh nghiệm" && (
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={onClose}>
              <Text style={styles.clearButtonText}>Xóa lọc</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={onClose}>
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  </Modal>
);

export default function BestJobsPage({ onBack }) {
  const { user } = useAuth();
  const { data, loading, error } = useHomeData();
  const { jobs } = data;

  // Debug logs
  console.log("[BestJobsPage] Component state:", {
    jobs: jobs?.length || 0,
    loading,
    error,
  });

  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showIndustryModal, setShowIndustryModal] = useState(false);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCandidateDetail, setShowCandidateDetail] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("Khu vực");
  const [selectedExperience, setSelectedExperience] = useState("Kinh nghiệm");
  const [selectedSalary, setSelectedSalary] = useState("Mức");
  const [selectedIndustry, setSelectedIndustry] = useState("");

  const handleBackPress = () => {
    if (onBack && typeof onBack === "function") {
      onBack();
    }
  };

  const handleJobPress = (job) => {
    console.log("[BestJobsPage] Job pressed:", job.id);
    setSelectedJob(job);
    setShowJobDetail(true);
  };

  const handleJobDetailBack = () => {
    setShowJobDetail(false);
    setSelectedJob(null);
  };

  const handleCandidatePress = (candidate) => {
    console.log("[BestJobsPage] Candidate pressed:", candidate.id);
    setSelectedCandidate(candidate);
    setShowCandidateDetail(true);
  };

  const handleCandidateDetailBack = () => {
    setShowCandidateDetail(false);
    setSelectedCandidate(null);
  };

  const resetAllFilters = () => {
    setSearchText("");
    setSelectedRegion("Khu vực");
    setSelectedExperience("Kinh nghiệm");
    setSelectedSalary("Mức");
    setSelectedIndustry("");
  };

  // Check if current user owns the job
  const isJobOwner = (job) => {
    return user && job && user.id === job.employer_id;
  };

  const handleJobEdit = async (updatedJob) => {
    try {
      if (!isJobOwner(selectedJob)) {
        Alert.alert("Lỗi", "Bạn không có quyền chỉnh sửa tin tuyển dụng này");
        return;
      }

      await HomeApiService.updateJob(updatedJob.id, updatedJob);
      setSelectedJob(updatedJob);
      Alert.alert("Thành công", "Đã cập nhật tin tuyển dụng");
    } catch (error) {
      console.error("[BestJobsPage] Edit job error:", error);
      Alert.alert("Lỗi", error.message || "Không thể cập nhật tin tuyển dụng");
    }
  };

  const handleJobDelete = async (jobId) => {
    try {
      if (!isJobOwner(selectedJob)) {
        Alert.alert("Lỗi", "Bạn không có quyền xóa tin tuyển dụng này");
        return;
      }

      await HomeApiService.deleteJob(jobId);
      Alert.alert("Thành công", "Đã xóa tin tuyển dụng", [
        {
          text: "OK",
          onPress: () => {
            setShowJobDetail(false);
            setSelectedJob(null);
          },
        },
      ]);
    } catch (error) {
      console.error("[BestJobsPage] Delete job error:", error);
      Alert.alert("Lỗi", error.message || "Không thể xóa tin tuyển dụng");
    }
  };

  // Show candidate detail screen if candidate is selected
  if (showCandidateDetail && selectedCandidate) {
    return (
      <CandidateDetailNavigationScreen
        candidate={selectedCandidate}
        onBack={handleCandidateDetailBack}
      />
    );
  }

  // Show job detail screen if job is selected
  if (showJobDetail && selectedJob) {
    const canEdit = isJobOwner(selectedJob);

    return (
      <JobDetailScreen
        job={selectedJob}
        onBack={handleJobDetailBack}
        onCandidatePress={handleCandidatePress}
        onEdit={canEdit ? handleJobEdit : null}
        onDelete={canEdit ? handleJobDelete : null}
        canViewCandidates={canEdit}
      />
    );
  }

  // Sử dụng data từ backend, fallback về data cũ nếu có lỗi
  const baseJobs = error.jobs ? bestJobs : jobs || [];

  console.log("[BestJobsPage] Base jobs:", {
    baseJobsCount: baseJobs?.length || 0,
    hasError: !!error.jobs,
    jobsFromAPI: jobs?.length || 0,
  });

  // Áp dụng các filter
  const displayJobs = baseJobs.filter((job) => {
    // Filter theo search text (tìm kiếm trong title, company, location)
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      const titleMatch = job.title?.toLowerCase().includes(searchLower);
      const companyMatch =
        job.company?.toLowerCase().includes(searchLower) ||
        job.company_name?.toLowerCase().includes(searchLower);
      const locationMatch = job.location?.toLowerCase().includes(searchLower);

      if (!titleMatch && !companyMatch && !locationMatch) {
        return false;
      }
    }

    // Filter theo region
    if (
      selectedRegion !== "Tất cả" &&
      selectedRegion !== "Khu vực" &&
      job.location &&
      !job.location.includes(selectedRegion)
    ) {
      return false;
    }

    // Filter theo experience (nếu có field tương ứng)
    if (
      selectedExperience !== "Tất cả" &&
      selectedExperience !== "Kinh nghiệm" &&
      job.experience &&
      !job.experience.includes(selectedExperience)
    ) {
      return false;
    }

    // Filter theo salary (nếu có field tương ứng)
    if (
      selectedSalary !== "Tất cả" &&
      selectedSalary !== "Mức" &&
      job.salary &&
      !job.salary.includes(selectedSalary)
    ) {
      return false;
    }

    // Filter theo industry (nếu có field tương ứng)
    if (
      selectedIndustry !== "Tất cả" &&
      selectedIndustry &&
      job.industry &&
      !job.industry.includes(selectedIndustry)
    ) {
      return false;
    }

    return true;
  });

  return (
    <View style={styles.container}>
      <CommonHeader
        title="Việc làm tốt nhất"
        onBack={handleBackPress}
        showAI={false}
      />
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Địa điểm - Công ty - Vị trí - Ngành nghề"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton} onPress={resetAllFilters}>
          <Text style={styles.filterIcon}>⚙️</Text>
          <Text style={styles.filterText}>Xóa bộ lọc</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowRegionModal(true)}
        >
          <Text style={styles.filterText}>{selectedRegion}</Text>
          <Text style={styles.dropdownIcon}>▾</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowExperienceModal(true)}
        >
          <Text style={styles.filterText}>{selectedExperience}</Text>
          <Text style={styles.dropdownIcon}>▾</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowSalaryModal(true)}
        >
          <Text style={styles.filterText}>{selectedSalary}</Text>
          <Text style={styles.dropdownIcon}>▾</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          <Text style={styles.resultsNumber}>{displayJobs.length}</Text> kết quả
        </Text>
      </View>

      {loading.jobs ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00b14f" />
          <Text style={styles.loadingText}>Đang tải dữ liệu việc làm...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.jobList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={TAB_BAR_PADDING}
        >
          {error.jobs && (
            <Text style={styles.errorText}>
              Không thể tải dữ liệu từ server, hiển thị dữ liệu mẫu
            </Text>
          )}
          {displayJobs.map((job, index) => (
            <JobCard
              key={job.id || `fallback-${index}`}
              item={job}
              onPress={handleJobPress}
              showLogoColor={true}
            />
          ))}
        </ScrollView>
      )}

      <FilterModal
        visible={showRegionModal}
        onClose={() => setShowRegionModal(false)}
        title="Bộ lọc"
        options={["Tất cả", "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng"]}
        selectedOption={selectedRegion}
        onSelectOption={setSelectedRegion}
      />
      <FilterModal
        visible={showExperienceModal}
        onClose={() => setShowExperienceModal(false)}
        title="Chọn số năm kinh nghiệm"
        options={filterOptions.experienceLevels}
        selectedOption={selectedExperience}
        onSelectOption={setSelectedExperience}
      />
      <FilterModal
        visible={showSalaryModal}
        onClose={() => setShowSalaryModal(false)}
        title="Chọn mức lương"
        options={filterOptions.salaryRanges}
        selectedOption={selectedSalary}
        onSelectOption={setSelectedSalary}
      />
      <FilterModal
        visible={showIndustryModal}
        onClose={() => setShowIndustryModal(false)}
        title="Chọn ngành nghề"
        options={filterOptions.industries}
        selectedOption={selectedIndustry}
        onSelectOption={setSelectedIndustry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchIcon: { fontSize: 16, marginRight: 8, color: "#666" },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  filterIcon: { fontSize: 12, marginRight: 4 },
  filterText: { fontSize: 14, color: "#333" },
  dropdownIcon: { fontSize: 10, color: "#666", marginLeft: 4 },
  resultsContainer: { paddingHorizontal: 16, marginBottom: 12 },
  resultsText: { fontSize: 14, color: "#666" },
  resultsNumber: { color: "#00b14f", fontWeight: "bold" },
  jobList: { flex: 1, paddingHorizontal: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    padding: 0,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  closeButton: { fontSize: 24, color: "#666" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  optionsList: { maxHeight: 300 },
  optionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionText: { fontSize: 16, color: "#333" },
  selectedOptionText: { color: "#00b14f", fontWeight: "bold" },
  modalFooter: { flexDirection: "row", padding: 16, gap: 12 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    backgroundColor: "#fff3cd",
    color: "#856404",
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 8,
    textAlign: "center",
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  clearButtonText: { color: "#666", fontSize: 16 },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#00b14f",
    alignItems: "center",
  },
  applyButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

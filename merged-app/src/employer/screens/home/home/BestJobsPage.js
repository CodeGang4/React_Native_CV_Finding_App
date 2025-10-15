import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import CommonHeader from "../../../components/common/CommonHeader";
import { TAB_BAR_PADDING } from "../../../../shared/styles/layout";
import JobCard from "../../../components/home/cards/JobCard";

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
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showIndustryModal, setShowIndustryModal] = useState(false);

  const [selectedRegion, setSelectedRegion] = useState("Khu vực");
  const [selectedExperience, setSelectedExperience] = useState("Kinh nghiệm");
  const [selectedSalary, setSelectedSalary] = useState("Mức");
  const [selectedIndustry, setSelectedIndustry] = useState("");

  const handleBackPress = () => {
    if (onBack && typeof onBack === "function") {
      onBack();
    }
  };

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
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterIcon}>⚙️</Text>
          <Text style={styles.filterText}>Lọc</Text>
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
          <Text style={styles.resultsNumber}>859</Text> kết quả
        </Text>
      </View>

      <ScrollView
        style={styles.jobList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={TAB_BAR_PADDING}
      >
        {bestJobs.map((job) => (
          <JobCard
            key={job.id}
            item={job}
            onPress={(job) => console.log("Job pressed:", job)}
            showLogoColor={true}
          />
        ))}
      </ScrollView>

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

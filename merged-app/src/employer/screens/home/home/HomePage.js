import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import HomeHeader from "../../../components/home/HomeHeader";
import JobSections from "../../../components/home/JobSections";
import TopBrands from "../../../components/home/TopBrands";
import PodcastSection from "../../../components/home/PodcastSection";
import BannerSections from "../../../components/home/BannerSections";
import JobSuggestionsPage from "./JobSuggestionsPage";
import BestJobsPage from "./BestJobsPage";
import TopBrandsPage from "./TopBrandsPage";
import PodcastPage from "./PodcastPage";
import JobDetailScreen from "../../shared/JobDetailScreen";
import CandidateDetailNavigationScreen from "../../shared/CandidateDetailNavigationScreen";
import CompanyDetailScreen from "../../shared/CompanyDetailScreen";
import HomeApiService from "../../../../shared/services/api/HomeApiService";
import { useAuth } from "../../../../shared/contexts/AuthContext";
import { TAB_BAR_PADDING } from "../../../../shared/styles/layout";

export default function HomePage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [showBestJobs, setShowBestJobs] = useState(false);
  const [showTopBrands, setShowTopBrands] = useState(false);
  const [showPodcast, setShowPodcast] = useState(false);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCandidateDetail, setShowCandidateDetail] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCompanyDetail, setShowCompanyDetail] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const handleJobSuggestionsPress = () => setShowJobSuggestions(true);
  const handleBestJobsPress = () => setShowBestJobs(true);
  const handleTopBrandsPress = () => setShowTopBrands(true);
  const handlePodcastPress = () => setShowPodcast(true);

  const handleJobPress = (job) => {
    console.log("[HomePage] Job pressed:", job.id);
    setSelectedJob(job);
    setShowJobDetail(true);
  };

  const handleJobDetailBack = () => {
    setShowJobDetail(false);
    setSelectedJob(null);
  };

  const handleCandidatePress = (candidate) => {
    console.log("[HomePage] Candidate pressed:", candidate.id);
    // Không cần import useNavigation vì sẽ được xử lý trong JobDetailScreen
    // Chỉ cần set state để hiển thị candidate modal
    setSelectedCandidate(candidate);
    setShowCandidateDetail(true);
  };

  const handleCompanyPress = (company) => {
    console.log("[HomePage] Company pressed:", company.id);
    setSelectedCompany(company);
    setShowCompanyDetail(true);
  };

  const handleCompanyDetailBack = () => {
    setShowCompanyDetail(false);
    setSelectedCompany(null);
  };

  const handleCandidateDetailBack = () => {
    setShowCandidateDetail(false);
    setSelectedCandidate(null);
  };

  // Check if current user owns the job
  const isJobOwner = (job) => {
    console.log("[HomePage] Permission check:", {
      userId: user?.id,
      jobEmployerId: job?.employer_id,
      isOwner: user && job && user.id === job.employer_id,
    });
    return user && job && user.id === job.employer_id;
  };

  const handleJobEdit = async (updatedJob) => {
    try {
      // Check permission
      if (!isJobOwner(selectedJob)) {
        Alert.alert("Lỗi", "Bạn không có quyền chỉnh sửa tin tuyển dụng này");
        return;
      }

      console.log("[HomePage] Editing job:", updatedJob.id);

      // Call API to update job
      await HomeApiService.updateJob(updatedJob.id, updatedJob);

      // Update local job data
      setSelectedJob(updatedJob);

      Alert.alert("Thành công", "Đã cập nhật tin tuyển dụng");
    } catch (error) {
      console.error("[HomePage] Edit job error:", error);
      Alert.alert("Lỗi", error.message || "Không thể cập nhật tin tuyển dụng");
    }
  };

  const handleJobDelete = async (jobId) => {
    try {
      // Check permission
      if (!isJobOwner(selectedJob)) {
        Alert.alert("Lỗi", "Bạn không có quyền xóa tin tuyển dụng này");
        return;
      }

      console.log("[HomePage] Deleting job:", jobId);

      // Call API to delete job
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
      console.error("[HomePage] Delete job error:", error);
      Alert.alert("Lỗi", error.message || "Không thể xóa tin tuyển dụng");
    }
  };
  if (showCandidateDetail && selectedCandidate)
    return (
      <CandidateDetailNavigationScreen
        candidate={selectedCandidate}
        onBack={handleCandidateDetailBack}
      />
    );
  if (showJobDetail && selectedJob) {
    const canEdit = isJobOwner(selectedJob);

    return (
      <JobDetailScreen
        job={selectedJob}
        onBack={handleJobDetailBack}
        onCandidatePress={handleCandidatePress}
        onEdit={canEdit ? handleJobEdit : null}
        onDelete={canEdit ? handleJobDelete : null}
        canViewCandidates={canEdit} // Only job owner can view candidates
      />
    );
  }
  if (showCompanyDetail && selectedCompany) {
    return (
      <CompanyDetailScreen
        company={selectedCompany}
        onBack={handleCompanyDetailBack}
      />
    );
  }
  if (showJobSuggestions)
    return <JobSuggestionsPage onBack={() => setShowJobSuggestions(false)} />;
  if (showBestJobs)
    return <BestJobsPage onBack={() => setShowBestJobs(false)} />;
  if (showTopBrands)
    return <TopBrandsPage onBack={() => setShowTopBrands(false)} />;
  if (showPodcast) return <PodcastPage onBack={() => setShowPodcast(false)} />;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={TAB_BAR_PADDING}
      >
        <HomeHeader search={search} setSearch={setSearch} />
        <JobSections
          onJobSuggestionsPress={handleJobSuggestionsPress}
          onBestJobsPress={handleBestJobsPress}
          onJobPress={handleJobPress}
        />
        <TopBrands
          onTopBrandsPress={handleTopBrandsPress}
          onCompanyPress={handleCompanyPress}
        />
        <PodcastSection onPodcastPress={handlePodcastPress} />
        <BannerSections />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});

import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
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
import { TAB_BAR_PADDING } from "../../../../shared/styles/layout";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [showBestJobs, setShowBestJobs] = useState(false);
  const [showTopBrands, setShowTopBrands] = useState(false);
  const [showPodcast, setShowPodcast] = useState(false);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCandidateDetail, setShowCandidateDetail] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

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

  const handleCandidateDetailBack = () => {
    setShowCandidateDetail(false);
    setSelectedCandidate(null);
  };

  if (showCandidateDetail && selectedCandidate)
    return (
      <CandidateDetailNavigationScreen
        candidate={selectedCandidate}
        onBack={handleCandidateDetailBack}
      />
    );
  if (showJobDetail && selectedJob)
    return (
      <JobDetailScreen
        job={selectedJob}
        onBack={handleJobDetailBack}
        onCandidatePress={handleCandidatePress}
      />
    );
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
        <TopBrands onTopBrandsPress={handleTopBrandsPress} />
        <PodcastSection onPodcastPress={handlePodcastPress} />
        <BannerSections />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});

import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import HomeHeader from "./components/HomeHeader";
import JobSections from "./components/JobSections";
import TopBrands from "./components/TopBrands";
import PodcastSection from "./components/PodcastSection";
import BannerSections from "./components/BannerSections";
import JobSuggestionsPage from "./JobSuggestionsPage";
import BestJobsPage from "./BestJobsPage";
import TopBrandsPage from "./TopBrandsPage";
import PodcastPage from "./PodcastPage";
import { TAB_BAR_PADDING } from "../../constants/layout";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [showBestJobs, setShowBestJobs] = useState(false);
  const [showTopBrands, setShowTopBrands] = useState(false);
  const [showPodcast, setShowPodcast] = useState(false);

  const handleJobSuggestionsPress = () => {
    setShowJobSuggestions(true);
  };

  const handleBackFromJobSuggestions = () => {
    setShowJobSuggestions(false);
  };

  const handleBestJobsPress = () => {
    setShowBestJobs(true);
  };

  const handleBackFromBestJobs = () => {
    setShowBestJobs(false);
  };

  const handleTopBrandsPress = () => {
    setShowTopBrands(true);
  };

  const handleBackFromTopBrands = () => {
    setShowTopBrands(false);
  };

  const handlePodcastPress = () => {
    setShowPodcast(true);
  };

  const handleBackFromPodcast = () => {
    setShowPodcast(false);
  };

  if (showJobSuggestions) {
    return <JobSuggestionsPage onBack={handleBackFromJobSuggestions} />;
  }

  if (showBestJobs) {
    return <BestJobsPage onBack={handleBackFromBestJobs} />;
  }

  if (showTopBrands) {
    return <TopBrandsPage onBack={handleBackFromTopBrands} />;
  }

  if (showPodcast) {
    return <PodcastPage onBack={handleBackFromPodcast} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={TAB_BAR_PADDING}
      >
        {/* Header với Search, Round Buttons và Suggest Banner */}
        <HomeHeader search={search} setSearch={setSearch} />

        {/* Job Suggestions và Best Jobs */}
        <JobSections
          onJobSuggestionsPress={handleJobSuggestionsPress}
          onBestJobsPress={handleBestJobsPress}
        />

        {/* Top Brands */}
        <TopBrands onTopBrandsPress={handleTopBrandsPress} />

        {/* Podcast Section */}
        <PodcastSection onPodcastPress={handlePodcastPress} />

        {/* Các Banner và Tools Section */}
        <BannerSections />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});

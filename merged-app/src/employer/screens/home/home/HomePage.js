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
import { TAB_BAR_PADDING } from "../../../../shared/styles/layout";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [showBestJobs, setShowBestJobs] = useState(false);
  const [showTopBrands, setShowTopBrands] = useState(false);
  const [showPodcast, setShowPodcast] = useState(false);

  const handleJobSuggestionsPress = () => setShowJobSuggestions(true);
  const handleBestJobsPress = () => setShowBestJobs(true);
  const handleTopBrandsPress = () => setShowTopBrands(true);
  const handlePodcastPress = () => setShowPodcast(true);

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

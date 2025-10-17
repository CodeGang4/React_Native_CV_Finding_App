import React from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import JobCard from "./cards/JobCard";
import SectionHeader from "../common/SectionHeader";
import { useHomeData } from "../../../shared/services/HomeDataManager";

const suggestionList = [
  {
    id: 1,
    title: "Java Developer",
    company: "Công ty TNHH Thu phí tự động VETC",
    salary: "Tới 1,600 USD",
    location: "Hà Nội",
    logo: "💻",
    verified: true,
  },
  {
    id: 2,
    title: "Mobile Developer (Android/IOS)- Lương Upto 20.000.000đ",
    company: "CÔNG TY CỔ PHẦN ĐẦU TƯ AHV HOLDING",
    salary: "Thỏa thuận",
    location: "Thái Nguyên & 4 nơi khác",
    logo: "📱",
    verified: false,
  },
];

const bestJobsList = [
  {
    id: 1,
    title: "Senior.NET (Fullstack Developer)",
    company: "CÔNG TY CỔ PHẦN MINH PHÚC TRANS",
    salary: "30 - 40 triệu",
    location: "Hà Nội",
    logo: "⚡",
    verified: true,
  },
  {
    id: 2,
    title: "Senior Front-End Developer (Angular)",
    company: "Ngân hàng TMCP Hàng Hải Việt Nam (MSB)",
    salary: "1,000 - 2,000 USD",
    location: "Hà Nội",
    logo: "🎯",
    verified: true,
  },
];

export default function JobSections({
  onJobSuggestionsPress,
  onBestJobsPress,
  onJobPress, // New prop to handle job press from parent
}) {
  const { data, loading, error } = useHomeData();
  const { jobs, topJobs } = data;

  const handleJobPress = (job) => {
    console.log("[JobSections] Job pressed:", job.id);
    if (onJobPress) {
      onJobPress(job);
    }
  };

  if (loading.jobs) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00b14f" />
        <Text style={styles.loadingText}>Đang tải dữ liệu việc làm...</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.section}>
        <SectionHeader
          title="Gợi ý việc làm phù hợp"
          onSeeAllPress={onJobSuggestionsPress}
        />
        {error.jobs ? (
          <>
            <Text style={styles.errorText}>
              Không thể tải dữ liệu từ server, hiển thị dữ liệu mẫu
            </Text>
            {suggestionList.map((item, index) => (
              <JobCard
                item={item}
                key={`static-suggestion-${item.id || index}`}
                onPress={handleJobPress}
              />
            ))}
          </>
        ) : (
          <>
            {jobs.length > 0
              ? jobs
                  .slice(0, 3)
                  .map((item, index) => (
                    <JobCard
                      item={item}
                      key={`job-${item.id || index}`}
                      onPress={handleJobPress}
                    />
                  ))
              : suggestionList.map((item, index) => (
                  <JobCard
                    item={item}
                    key={`fallback-suggestion-${item.id || index}`}
                    onPress={handleJobPress}
                  />
                ))}
          </>
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Việc làm tốt nhất"
          onSeeAllPress={onBestJobsPress}
        />
        {error.jobs ? (
          <>
            <Text style={styles.errorText}>
              Không thể tải dữ liệu từ server, hiển thị dữ liệu mẫu
            </Text>
            {bestJobsList.map((item, index) => (
              <JobCard
                item={item}
                key={`static-bestjob-${item.id || index}`}
                onPress={handleJobPress}
              />
            ))}
          </>
        ) : (
          <>
            {topJobs.length > 0
              ? topJobs
                  .slice(0, 3)
                  .map((item, index) => (
                    <JobCard
                      item={item}
                      key={`topjob-${item.id || index}`}
                      onPress={handleJobPress}
                    />
                  ))
              : bestJobsList.map((item, index) => (
                  <JobCard
                    item={item}
                    key={`fallback-bestjob-${item.id || index}`}
                    onPress={handleJobPress}
                  />
                ))}
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 12, marginHorizontal: 0, paddingHorizontal: 16 },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
    gap: 10,
  },
  loadingText: {
    color: "#666",
    fontSize: 14,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
});

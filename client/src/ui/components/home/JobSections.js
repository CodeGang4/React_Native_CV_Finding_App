import React from "react";
import { View, StyleSheet } from "react-native";
import JobCard from "./cards/JobCard";
import SectionHeader from "../common/SectionHeader";

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
}) {
  return (
    <>
      <View style={styles.section}>
        <SectionHeader
          title="Gợi ý việc làm phù hợp"
          onSeeAllPress={onJobSuggestionsPress}
        />
        {suggestionList.map((item) => (
          <JobCard item={item} key={item.id} />
        ))}
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Việc làm tốt nhất"
          onSeeAllPress={onBestJobsPress}
        />
        {bestJobsList.map((item) => (
          <JobCard item={item} key={item.id} />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 12, marginHorizontal: 0, paddingHorizontal: 16 },
});

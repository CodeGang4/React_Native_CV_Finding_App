import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import CommonHeader from "../../../../shared/components/common/CommonHeader";
import JobCard from "../../components/cards/JobCard";

const jobSuggestions = [
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
      "Junior Android Developer – Hà Nội | Thu Nhập 15-25 Triệu|Phát Triể...",
    company: "Công ty Phát triển giải pháp và Công ng...",
    salary: "15 - 25 triệu",
    location: "Hà Nội",
    logo: "🔥",
    logoColor: "#ff4444",
    verified: false,
    backgroundColor: "#fff",
  },
  {
    id: 3,
    title: "Front End Developer (Typescript/ Vue/Javascript/Canvas HTML5/En...",
    company: "ROWBOAT SOFTWARE",
    salary: "500 - 800 USD",
    location: "Hồ Chí Minh",
    logo: "⚙️",
    logoColor: "#007acc",
    verified: false,
    backgroundColor: "#fff",
  },
  {
    id: 4,
    title: "ReactJs Developer",
    company: "Công ty Cổ phần Công nghệ Tài chính G...",
    salary: "$ Thỏa thuận",
    location: "Hà Nội",
    logo: "GO",
    logoColor: "#0066cc",
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

export default function JobSuggestionsPage({ onBack }) {
  const handleBackPress = () => {
    if (onBack && typeof onBack === "function") {
      onBack();
    }
  };
  const handleJobPress = (job) => {
    console.log("Job pressed:", job);
  };

  return (
    <View style={styles.container}>
      <CommonHeader
        title="Gợi ý việc làm phù hợp"
        onBack={handleBackPress}
        showAI={true}
      />
      <ScrollView style={styles.jobList} showsVerticalScrollIndicator={false}>
        {jobSuggestions.map((job) => (
          <JobCard
            key={job.id}
            item={job}
            onPress={handleJobPress}
            showLogoColor={true}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  jobList: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
});

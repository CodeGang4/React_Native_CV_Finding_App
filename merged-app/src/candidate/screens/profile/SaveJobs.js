import React from "react";
import { View, StyleSheet } from "react-native";
import JobListSection from "../../components/JobListSection";

export default function SaveJobs({ navigation }) {
  return (
    <View style={styles.container}>
      <JobListSection
        navigation={navigation}
        searchQuery=""
        location=""
        searchTrigger={1}
        showSavedOnly={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});

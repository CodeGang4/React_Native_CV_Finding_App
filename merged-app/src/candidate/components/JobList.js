import React, { memo } from "react";
import { FlatList, Text, View } from "react-native";
import JobCard from "./JobCard";

const MemoizedJobCard = memo(JobCard, (prev, next) => {
  return (
    prev.job.id === next.job.id &&
    prev.isSaved === next.isSaved
  );
});

export default function JobList({ jobs = [], onJobPress, onFavoritePress, savedJobs = [] ,scrollEnabled = true,refreshControl}) {
  if (!jobs || jobs.length === 0) {
    return (
      <View style={{ marginTop: 20 }}>
        <Text style={{ textAlign: "center" }}>Không có job nào</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={jobs}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <MemoizedJobCard
          job={item}
          onPress={onJobPress}
          onFavoritePress={onFavoritePress}
          isSaved={savedJobs?.includes(item.id)}
        />
      )}
      contentContainerStyle={{ padding: 20 }}
      initialNumToRender={6}
      windowSize={10}
      removeClippedSubviews
      nestedScrollEnabled={true}
      scrollEnabled={scrollEnabled}
      refreshControl={refreshControl}
    />
  );
}

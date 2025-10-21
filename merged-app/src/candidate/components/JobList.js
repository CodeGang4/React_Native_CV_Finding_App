import React from "react";
import { FlatList, Text } from "react-native";
import JobCard from "./JobCard";

export default function JobList({ jobs = [], onJobPress, onFavoritePress, savedJobs = [] }) {
  if (!jobs || jobs.length === 0) {
    return (
      <Text style={{ textAlign: "center", marginTop: 20 }}>
        Không có job nào
      </Text>
    );
  }

  return (
    <FlatList
      data={jobs}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <JobCard 
          job={item} 
          onPress={onJobPress} 
          onFavoritePress={onFavoritePress}
          isSaved={savedJobs?.includes(item.id)}
        />
      )}
      contentContainerStyle={{
        padding: 20,
      }}
    />
  );
}

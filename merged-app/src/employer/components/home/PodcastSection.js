import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

// Temporary: Use a placeholder image or remove image requirement
const podcastList = [
  {
    id: 1,
    title: "AI tạo sinh: Giải pháp thay thế đào tạo nhân sự trực t...",
    duration: "00:10:15",
    thumbnail: null, // Temporary: Remove image to test
  },
  {
    id: 2,
    title: "Trí tuệ nhân tạo (AI) hỗ trợ người lao động tối ưu năng s...",
    duration: "00:10:42",
    thumbnail: null, // Temporary: Remove image to test
  },
  {
    id: 3,
    title: "Trí tuệ nhân tạo (AI) đang thay đổi cách chúng ta ứng...",
    duration: "00:11:04",
    thumbnail: null, // Temporary: Remove image to test
  },
];

const PodcastCard = ({ podcast }) => (
  <View style={styles.podcastCard}>
    {podcast.thumbnail && (
      <Image source={podcast.thumbnail} style={styles.podcastThumbnail} />
    )}
    {!podcast.thumbnail && (
      <View style={[styles.podcastThumbnail, styles.placeholderThumbnail]}>
        <MaterialIcons name="headphones" size={24} color="#666" />
      </View>
    )}
    <View style={styles.podcastInfo}>
      <Text style={styles.podcastTitle} numberOfLines={2}>
        {podcast.title}
      </Text>
      <Text style={styles.podcastDuration}>{podcast.duration}</Text>
    </View>
    <TouchableOpacity style={styles.heartButton}>
      <MaterialIcons name="favorite-border" size={20} color="#00b14f" />
    </TouchableOpacity>
    <TouchableOpacity style={styles.playButton}>
      <MaterialIcons name="play-arrow" size={24} color="#00b14f" />
    </TouchableOpacity>
  </View>
);

export default function PodcastSection({ onPodcastPress }) {
  return (
    <View style={styles.section}>
      <LinearGradient
        colors={["#2c5f41", "#00b14f"]}
        style={styles.podcastHeader}
      >
        <Text style={styles.headerTitle}>TopCV Podcast</Text>
        <View style={styles.micIcon}>
          <MaterialIcons name="mic" size={24} color="white" />
        </View>
      </LinearGradient>

      <View style={styles.podcastContainer}>
        {podcastList.map((podcast) => (
          <PodcastCard key={podcast.id} podcast={podcast} />
        ))}

        <TouchableOpacity style={styles.seeMoreButton} onPress={onPodcastPress}>
          <Text style={styles.seeMoreText}>Xem thêm →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
  podcastHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  micIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  podcastContainer: {
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  podcastCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  podcastThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  podcastInfo: {
    flex: 1,
    marginRight: 12,
  },
  podcastTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  podcastDuration: {
    fontSize: 12,
    color: "#666",
  },
  heartButton: {
    marginRight: 12,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderThumbnail: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  seeMoreButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  seeMoreText: {
    color: "#00b14f",
    fontSize: 16,
    fontWeight: "600",
  },
});

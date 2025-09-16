import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function PodcastCard({ podcast, onHeartPress, onPlayPress }) {
  return (
    <TouchableOpacity style={styles.podcastCard}>
      <View style={styles.thumbnailContainer}>
        <Text style={styles.thumbnailIcon}>{podcast.thumbnail}</Text>
      </View>
      <View style={styles.podcastInfo}>
        <Text style={styles.podcastCardTitle} numberOfLines={2}>
          {podcast.title}
        </Text>
        <Text style={styles.podcastDuration}>{podcast.duration}</Text>
      </View>
      <View style={styles.podcastActions}>
        <TouchableOpacity style={styles.heartButton} onPress={onHeartPress}>
          <Text style={styles.heartIcon}>♡</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.playButton} onPress={onPlayPress}>
          <Text style={styles.playIcon}>▶</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  podcastCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  thumbnailContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#00b14f",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  thumbnailIcon: {
    fontSize: 24,
    color: "#fff",
  },
  podcastInfo: {
    flex: 1,
    paddingRight: 8,
  },
  podcastCardTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
    lineHeight: 20,
  },
  podcastDuration: {
    fontSize: 13,
    color: "#666",
  },
  podcastActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  heartButton: {
    padding: 8,
    marginRight: 4,
  },
  heartIcon: {
    fontSize: 20,
    color: "#00b14f",
  },
  playButton: {
    backgroundColor: "#00b14f",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    fontSize: 14,
    color: "#fff",
    marginLeft: 2,
  },
});

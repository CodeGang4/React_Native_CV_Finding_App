import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PodcastCard = ({ 
  podcast, 
  isActive = false, 
  isPlaying = false, 
  progress = 0, 
  position = 0, 
  duration = 0, 
  onPlayPress 
}) => {
  
  const formatTime = (ms) => {
    if (!ms) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.leftSection}>
          <TouchableOpacity 
            style={styles.playIconContainer}
            onPress={() => onPlayPress(podcast)}
          >
            <Ionicons 
              name={isActive && isPlaying ? "pause" : "play"} 
              size={16} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.middleSection}>
          <Text style={[styles.title, isActive && styles.activeTitle]} numberOfLines={2}>
            {podcast.title}
          </Text>
          
          {isActive && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.duration}>
                {formatTime(position)} / {formatTime(duration)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.rightSection}>
          <Text style={styles.date}>
            {new Date(podcast.created_at).toLocaleDateString("vi-VN")}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "transparent",
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    width: 60,
  },
  playIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1DB954",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    shadowColor: "#1DB954",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  middleSection: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    lineHeight: 20,
  },
  activeTitle: {
    color: "#1DB954",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#E5E5E5",
    borderRadius: 2,
    marginRight: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1DB954",
    borderRadius: 2,
  },
  duration: {
    fontSize: 12,
    color: "#666",
    minWidth: 35,
    fontWeight: "500",
  },
  rightSection: {
    alignItems: "flex-end",
  },
  date: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
});

export default PodcastCard;
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Audio } from "expo-av";
import { useAllPodcasts } from "../../shared/hooks/useAllPodcasts";
import PodcastCard from "./PodcastCard";

export default function PodcastListSection({ limit = 2 }) {
  const { podcasts, loading, error } = useAllPodcasts();
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval;
    if (sound && isPlaying) {
      interval = setInterval(async () => {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setPosition(status.positionMillis);
          setDuration(status.durationMillis || 0);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [sound, isPlaying]);

  const handlePlayPause = async (item) => {
    try {
      if (sound && currentId !== item.id) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }

      if (isPlaying && currentId === item.id) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        let currentSound = sound;
        if (!sound || currentId !== item.id) {
          const { sound: newSound } = await Audio.Sound.createAsync({
            uri: item.podcast_url,
          });
          currentSound = newSound;
          setSound(newSound);
          setCurrentId(item.id);
        }
        await currentSound.playAsync();
        setIsPlaying(true);
      }
    } catch (err) {
      console.log("Lỗi phát podcast:", err);
    }
  };

  // Giới hạn số lượng podcast hiển thị
  const limitedPodcasts = limit ? podcasts.slice(0, limit) : podcasts;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#1DB954" />
        <Text style={styles.loadingText}>Đang tải podcast...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Đã xảy ra lỗi khi tải podcast</Text>
      </View>
    );
  }

  if (podcasts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chưa có podcast nào</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={limitedPodcasts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PodcastCard
            podcast={item}
            isActive={item.id === currentId}
            isPlaying={isPlaying}
            progress={duration && item.id === currentId ? position / duration : 0}
            position={position}
            duration={duration}
            onPlayPress={handlePlayPause}
          />
        )}
        contentContainerStyle={styles.listContainer}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listContainer: {
    paddingBottom: 10,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  loadingText: {
    marginLeft: 10,
    color: "#666",
    fontSize: 14,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  errorText: {
    color: "#FF4444",
    fontSize: 14,
    textAlign: "center",
  },
  emptyContainer: {
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
});
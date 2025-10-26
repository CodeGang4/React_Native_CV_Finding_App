import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useAllPodcasts } from "../../../shared/hooks/useAllPodcasts";
import PodcastCard from "../../components/PodcastCard";
import PodcastListSection from "../../components/PodcastListSection";

export default function Podcast() {
  const { podcasts, loading, error, refetch } = useAllPodcasts();
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

  const renderPodcast = ({ item }) => (
    <PodcastCard
      podcast={item}
      isActive={item.id === currentId}
      isPlaying={isPlaying}
      progress={duration && item.id === currentId ? position / duration : 0}
      position={position}
      duration={duration}
      onPlayPress={handlePlayPause}
    />
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Đang tải podcast...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Đã xảy ra lỗi khi tải podcast</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {podcasts.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyIcon}>
            <Ionicons name="musical-notes" size={40} color="#666" />
          </View>
          <Text style={styles.emptyText}>Chưa có podcast nào</Text>
          <Text style={styles.emptySubText}>Khám phá và thêm podcast mới để bắt đầu nghe</Text>
        </View>
      ) : (
        <FlatList
          data={podcasts}
          renderItem={renderPodcast}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#333",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptySubText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  errorText: {
    color: "#FF4444",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: "#1DB954",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryText: {
    color: "white",
    fontWeight: "bold",
  },
});
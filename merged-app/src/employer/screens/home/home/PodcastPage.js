import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  PanResponder,
  Modal,
} from "react-native";
import CommonHeader from "../../../components/common/CommonHeader";
import { TAB_BAR_PADDING } from "../../../../shared/styles/layout";
import HomeApiService from "../../../../shared/services/api/HomeApiService";
import AudioService from "../../../../shared/services/AudioService";

const allPodcasts = [
  {
    id: 1,
    title: "AI tạo sinh: Giải pháp thay thế đào tạo nhân sự trực tuyến",
    duration: "00:10:15",
    category: "Công nghệ",
  },
  {
    id: 2,
    title: "Trí tuệ nhân tạo (AI) hỗ trợ người lao động tối ưu năng suất",
    duration: "00:10:42",
    category: "Công nghệ",
  },
  {
    id: 3,
    title: "Trí tuệ nhân tạo (AI) đang thay đổi cách chúng ta ứng tuyển",
    duration: "00:11:04",
    category: "Tuyển dụng",
  },
  {
    id: 4,
    title: "Chìa khóa thăng tiến trong sự nghiệp (Phần 3)",
    duration: "00:15:53",
    category: "Sự nghiệp",
  },
  {
    id: 5,
    title: "Chìa khóa thăng tiến trong sự nghiệp (Phần 2)",
    duration: "00:19:37",
    category: "Sự nghiệp",
  },
  {
    id: 6,
    title: "Chìa khóa thăng tiến trong sự nghiệp (Phần 1)",
    duration: "00:18:27",
    category: "Sự nghiệp",
  },
  {
    id: 7,
    title: "Bí quyết xây dựng thương hiệu cá nhân hiệu quả",
    duration: "00:22:15",
    category: "Thương hiệu",
  },
  {
    id: 8,
    title: "Làm sao để thành công trong buổi phỏng vấn đầu tiên",
    duration: "00:14:33",
    category: "Phỏng vấn",
  },
];

const PodcastCard = ({ podcast, onShowVolumeControl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({
    position: 0,
    duration: 0,
    progress: 0,
    positionFormatted: "0:00",
    durationFormatted: "0:00",
  });
  const [volume, setVolumeState] = useState(1.0);

  // Progress bar layout info
  const [progressBarLayout, setProgressBarLayout] = useState({
    width: 200,
    x: 0,
  });

  // PanResponder for progress bar dragging
  const progressPanResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Require minimum movement to start panning (reduced sensitivity)
      return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
    },
    onPanResponderGrant: () => {
      // Start dragging
    },
    onPanResponderMove: (evt, gestureState) => {
      if (!isPlaying || progress.duration === 0) return;

      // Reduce sensitivity by requiring more movement
      if (Math.abs(gestureState.dx) < 3) return;

      const { pageX } = evt.nativeEvent;
      const relativeX = pageX - progressBarLayout.x;
      const newProgress = Math.max(
        0,
        Math.min(1, relativeX / progressBarLayout.width)
      );
      const newPosition = newProgress * progress.duration;

      // Update local state immediately for responsive UI
      setProgress((prev) => ({
        ...prev,
        progress: newProgress,
        position: newPosition,
        positionFormatted: AudioService.formatTime(newPosition),
      }));
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (!isPlaying || progress.duration === 0) return;

      const { pageX } = evt.nativeEvent;
      const relativeX = pageX - progressBarLayout.x;
      const newProgress = Math.max(
        0,
        Math.min(1, relativeX / progressBarLayout.width)
      );
      const newPosition = newProgress * progress.duration;

      // Seek to the new position
      AudioService.seekTo(newPosition);
    },
  });

  const handlePlayPress = async () => {
    try {
      setIsLoading(true);

      // Get podcast URL from database
      const podcastUrl = podcast.podcast_url;

      if (!podcastUrl) {
        Alert.alert("Lỗi", "Podcast này chưa có file âm thanh");
        return;
      }

      console.log(
        "[PodcastCard] Playing podcast:",
        podcast.title,
        "URL:",
        podcastUrl
      );

      await AudioService.playPodcast(podcastUrl, podcast.id);

      // Get current state
      const { isPlaying: currentlyPlaying, currentPodcast } =
        AudioService.getCurrentPlaybackInfo();
      setIsPlaying(currentlyPlaying && currentPodcast === podcast.id);
    } catch (error) {
      console.error("[PodcastCard] Play error:", error);
      Alert.alert("Lỗi", error.message || "Không thể phát podcast");
    } finally {
      setIsLoading(false);
    }
  };

  // Update playing state and progress periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const playbackInfo = AudioService.getCurrentPlaybackInfo();
      const isCurrentPodcast = playbackInfo.currentPodcast === podcast.id;

      setIsPlaying(playbackInfo.isPlaying && isCurrentPodcast);

      if (isCurrentPodcast && playbackInfo.progress) {
        setProgress(playbackInfo.progress);
      }

      setVolumeState(playbackInfo.volume);
    }, 500); // Update more frequently for smooth progress

    return () => clearInterval(interval);
  }, [podcast.id]);

  const handleVolumeChange = async (newVolume) => {
    await AudioService.setVolume(newVolume);
    setVolumeState(newVolume);
  };

  const handleProgressPress = async (event) => {
    if (!isPlaying || progress.duration === 0) return;

    const { locationX } = event.nativeEvent;
    const progressBarWidth = 200; // Approximate width of progress bar
    const newProgress = locationX / progressBarWidth;
    const newPosition = newProgress * progress.duration;

    await AudioService.seekTo(newPosition);
  };

  return (
    <View style={styles.podcastCard}>
      <View style={styles.thumbnail}>
        <Text style={styles.thumbnailText}>🎧</Text>
      </View>

      <View style={styles.podcastInfo}>
        <Text style={styles.podcastTitle} numberOfLines={2}>
          {podcast.title}
        </Text>

        {/* Progress Bar with Drag Support */}
        <View
          style={styles.progressContainer}
          {...progressPanResponder.panHandlers}
        >
          <TouchableOpacity
            style={styles.progressTouchArea}
            onPress={handleProgressPress}
            activeOpacity={0.8}
          >
            <View
              style={styles.progressBar}
              onLayout={(event) => {
                const { width, x } = event.nativeEvent.layout;
                setProgressBarLayout({ width, x });
              }}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.max(
                      0,
                      Math.min(100, progress.progress * 100)
                    )}%`,
                  },
                ]}
              />
              {/* Progress thumb for better dragging */}
              <View
                style={[
                  styles.progressThumb,
                  {
                    left: `${Math.max(
                      0,
                      Math.min(100, progress.progress * 100)
                    )}%`,
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Time and Controls */}
        <View style={styles.controlsRow}>
          <View style={styles.leftControls}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPress}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#00b14f" />
              ) : (
                <Text style={styles.playButtonIcon}>
                  {isPlaying ? "⏸" : "▶"}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.timeText}>
              {isPlaying ? progress.positionFormatted : "0:00"} /{" "}
              {progress.durationFormatted || podcast.duration}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.volumeButton}
            onPress={() => onShowVolumeControl(podcast.id, volume)}
          >
            <Text style={styles.volumeIcon}>🔊</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.favoriteButton}>
        <Text style={styles.favoriteIcon}>♡</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function PodcastPage({ onBack }) {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalVolumeControl, setGlobalVolumeControl] = useState({
    show: false,
    volume: 1.0,
    podcastId: null,
  });

  const handleBackPress = () => {
    if (onBack && typeof onBack === "function") {
      onBack();
    }
  };

  const handleShowVolumeControl = (podcastId, currentVolume) => {
    setGlobalVolumeControl({
      show: true,
      volume: currentVolume,
      podcastId: podcastId,
    });
  };

  const handleVolumeChange = async (newVolume) => {
    await AudioService.setVolume(newVolume);
    setGlobalVolumeControl((prev) => ({
      ...prev,
      volume: newVolume,
    }));
  };

  const hideVolumeControl = () => {
    setGlobalVolumeControl({
      show: false,
      volume: 1.0,
      podcastId: null,
    });
  };

  const fetchAllPodcasts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("[PodcastPage] Fetching all podcasts...");
      const allPodcastsData = await HomeApiService.getAllPodcasts();

      // Transform data to ensure consistent format
      const transformedPodcasts = allPodcastsData.map((podcast) => ({
        id: podcast.id,
        title: podcast.title || "Chưa có tiêu đề",
        duration: podcast.duration || podcast.length || "00:00:00",
        category: podcast.category || "Khác",
        thumbnail: podcast.thumbnail || null,
        podcast_url: podcast.podcast_url, // Directly from DB
        // Keep original data for debugging
        original_data: podcast,
      }));

      console.log("[PodcastPage] Loaded podcasts:", transformedPodcasts.length);
      console.log("[PodcastPage] Sample podcast data:", {
        title: transformedPodcasts[0]?.title,
        podcast_url: transformedPodcasts[0]?.podcast_url,
        original: transformedPodcasts[0]?.original_data,
      });
      setPodcasts(transformedPodcasts);
    } catch (err) {
      console.error("[PodcastPage] Failed to fetch podcasts:", err);
      setError(err.message || "Không thể tải danh sách podcast");
      // Fallback to mock data on error
      setPodcasts(allPodcasts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize audio service
    AudioService.initializeAudio();

    // Fetch podcasts
    fetchAllPodcasts();

    // Cleanup audio when component unmounts
    return () => {
      AudioService.stopPodcast();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <CommonHeader title="Podcast" onBack={handleBackPress} showAI={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00b14f" />
          <Text style={styles.loadingText}>Đang tải danh sách podcast...</Text>
        </View>
      </View>
    );
  }

  const displayPodcasts = podcasts;

  return (
    <View style={styles.container}>
      <CommonHeader title="Podcast" onBack={handleBackPress} showAI={false} />
      <ScrollView
        style={styles.podcastsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={TAB_BAR_PADDING}
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Có lỗi xảy ra: {error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchAllPodcasts}
            >
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {displayPodcasts.length === 0 && !loading && !error && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có podcast nào</Text>
          </View>
        )}

        {displayPodcasts.map((podcast, index) => (
          <PodcastCard
            key={podcast.id || `fallback-${index}`}
            podcast={podcast}
            onShowVolumeControl={handleShowVolumeControl}
          />
        ))}
      </ScrollView>

      {/* Global Volume Control Modal */}
      <Modal
        visible={globalVolumeControl.show}
        transparent={true}
        animationType="fade"
        onRequestClose={hideVolumeControl}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={hideVolumeControl}
          activeOpacity={1}
        >
          <View style={styles.volumeModalContainer}>
            <Text style={styles.volumeModalTitle}>Điều chỉnh âm lượng</Text>
            <Text style={styles.volumeModalLabel}>
              Âm lượng: {Math.round(globalVolumeControl.volume * 100)}%
            </Text>
            <View style={styles.volumeModalSliderContainer}>
              <TouchableOpacity
                style={styles.volumeModalButton}
                onPress={() =>
                  handleVolumeChange(
                    Math.max(0, globalVolumeControl.volume - 0.1)
                  )
                }
              >
                <Text style={styles.volumeModalButtonText}>➖</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.volumeModalSlider}
                onPress={(evt) => {
                  const { locationX } = evt.nativeEvent;
                  const sliderWidth = 200; // Fixed width for modal slider
                  const newVolume = Math.max(
                    0,
                    Math.min(1, locationX / sliderWidth)
                  );
                  handleVolumeChange(newVolume);
                }}
              >
                <View style={styles.volumeModalTrack}>
                  <View
                    style={[
                      styles.volumeModalFill,
                      { width: `${globalVolumeControl.volume * 100}%` },
                    ]}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.volumeModalButton}
                onPress={() =>
                  handleVolumeChange(
                    Math.min(1, globalVolumeControl.volume + 0.1)
                  )
                }
              >
                <Text style={styles.volumeModalButtonText}>➕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.volumeModalCloseButton}
              onPress={hideVolumeControl}
            >
              <Text style={styles.volumeModalCloseText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  podcastsList: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#00b14f",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  podcastCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#2c5f41",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginRight: 12,
  },
  thumbnailText: { fontSize: 32, color: "#fff" },

  podcastInfo: { flex: 1, paddingRight: 12, position: "relative" },
  podcastTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    lineHeight: 22,
  },
  podcastMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  podcastDuration: {
    fontSize: 14,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  // Progress Bar Styles
  progressContainer: {
    marginVertical: 8,
    paddingVertical: 8, // Increase touch area
  },
  progressTouchArea: {
    paddingVertical: 4, // Extra touch area
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    position: "relative",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00b14f",
    borderRadius: 2,
  },
  progressThumb: {
    position: "absolute",
    top: -4,
    width: 12,
    height: 12,
    backgroundColor: "#00b14f",
    borderRadius: 6,
    marginLeft: -6, // Center the thumb
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  // Controls Row
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  leftControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  playButton: {
    backgroundColor: "#00b14f",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    minWidth: 28,
    alignItems: "center",
  },
  playButtonIcon: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  volumeButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  volumeIcon: {
    fontSize: 14,
  },

  favoriteButton: {
    padding: 8,
  },
  favoriteIcon: {
    fontSize: 24,
    color: "#00b14f",
  },

  // Volume Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  volumeModalContainer: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    width: "85%",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  volumeModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  volumeModalLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "500",
  },
  volumeModalSliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  volumeModalButton: {
    backgroundColor: "#f0f0f0",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  volumeModalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  volumeModalSlider: {
    flex: 1,
    paddingVertical: 12, // Increase touch area
  },
  volumeModalTrack: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  volumeModalFill: {
    height: "100%",
    backgroundColor: "#00b14f",
    borderRadius: 3,
  },
  volumeModalCloseButton: {
    backgroundColor: "#00b14f",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "center",
  },
  volumeModalCloseText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

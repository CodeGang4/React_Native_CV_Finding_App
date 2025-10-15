import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import CommonHeader from "../../../components/common/CommonHeader";
import { TAB_BAR_PADDING } from "../../../../shared/styles/layout";
import { useHomeData } from "../../../../shared/services/HomeDataManager";

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

const PodcastCard = ({ podcast }) => (
  <View style={styles.podcastCard}>
    <View style={styles.thumbnail}>
      <Text style={styles.thumbnailText}>🎧</Text>
      <View style={styles.playOverlay}>
        <Text style={styles.playIcon}>▶</Text>
      </View>
    </View>
    <View style={styles.podcastInfo}>
      <Text style={styles.podcastTitle} numberOfLines={2}>
        {podcast.title}
      </Text>
      <View style={styles.podcastMeta}>
        <Text style={styles.podcastDuration}>{podcast.duration}</Text>
        <TouchableOpacity style={styles.playButton}>
          <Text style={styles.playButtonIcon}>▶</Text>
        </TouchableOpacity>
      </View>
    </View>
    <TouchableOpacity style={styles.favoriteButton}>
      <Text style={styles.favoriteIcon}>♡</Text>
    </TouchableOpacity>
  </View>
);

export default function PodcastPage({ onBack }) {
  const { data, loading, error, refetch } = useHomeData();
  const { podcasts } = data;

  const handleBackPress = () => {
    if (onBack && typeof onBack === "function") {
      onBack();
    }
  };

  if (loading.podcasts) {
    return (
      <View style={styles.container}>
        <CommonHeader title="Podcast" onBack={handleBackPress} showAI={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00b14f" />
          <Text style={styles.loadingText}>Đang tải danh sách podcast...</Text>
        </View>
      </View>
    );
  }

  if (error.podcasts) {
    return (
      <View style={styles.container}>
        <CommonHeader title="Podcast" onBack={handleBackPress} showAI={true} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Có lỗi xảy ra: {error.podcasts}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Sử dụng data từ backend, fallback về allPodcasts nếu có lỗi
  const displayPodcasts = error.podcasts ? allPodcasts : podcasts || [];

  return (
    <View style={styles.container}>
      <CommonHeader title="Podcast" onBack={handleBackPress} showAI={true} />
      <ScrollView
        style={styles.podcastsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={TAB_BAR_PADDING}
      >
        {error.podcasts && (
          <Text style={styles.errorText}>
            Không thể tải dữ liệu từ server, hiển thị dữ liệu mẫu
          </Text>
        )}
        {displayPodcasts.map((podcast, index) => (
          <PodcastCard
            key={podcast.id || `fallback-${index}`}
            podcast={podcast}
          />
        ))}
      </ScrollView>
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
  playOverlay: {
    position: "absolute",
    bottom: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#00b14f",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  playIcon: { fontSize: 14, color: "#fff", marginLeft: 2 },
  podcastInfo: { flex: 1, paddingRight: 12 },
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
  playButton: {
    backgroundColor: "#00b14f",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  playButtonIcon: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  favoriteButton: { padding: 8 },
  favoriteIcon: { fontSize: 24, color: "#00b14f" },
});

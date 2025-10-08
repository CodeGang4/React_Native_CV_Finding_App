import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useJobCardStats } from "../../../shared/hooks/useJobCardStats";

// Helper function to format data from API (same as JobListItem)
const formatJobData = (job) => {
  // Format salary
  const formatSalary = (salary) => {
    if (!salary) return "Thỏa thuận";
    if (typeof salary === "string") return salary;
    return `${salary.toLocaleString()} VND`;
  };

  // Format location
  const formatLocation = (location) => {
    return location || "Chưa cập nhật";
  };

  // Format status
  const formatStatus = (status) => {
    const statusMap = {
      active: "Đang tuyển",
      inactive: "Tạm dừng",
      closed: "Đã đóng",
      draft: "Bản nháp",
    };
    return statusMap[status] || status || "Không xác định";
  };

  return {
    ...job,
    salary: formatSalary(job.salary),
    location: formatLocation(job.location),
    status: formatStatus(job.status),
    views: job.views || 0,
    applications: job.application_count || job.applications || 0,
  };
};

export default function SwipeableJobCard({
  job,
  onPress,
  onDelete,
  onSwipe,
  isOpen,
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const cardHeight = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;

  // Use real backend data for job stats
  const { views, candidatesCount, deadline, status } = useJobCardStats(job);

  // Effect để tự động đóng card khi isOpen thay đổi
  useEffect(() => {
    if (!isOpen) {
      // Đóng card mà không trigger onSwipe callback để tránh infinite loop
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [isOpen]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Chỉ bắt đầu pan khi vuốt ngang đủ xa và không phải vuốt dọc
        return (
          Math.abs(gestureState.dx) > 5 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        );
      },
      onPanResponderGrant: () => {
        // Set lại value hiện tại để tránh jump
        translateX.setOffset(translateX._value);
        translateX.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Chỉ cho phép vuốt sang trái (dx âm) và giới hạn tối đa
        const newValue = Math.min(0, Math.max(-120, gestureState.dx));
        translateX.setValue(newValue);
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Flatten offset để tránh lỗi animation
        translateX.flattenOffset();

        if (gestureState.dx < -60) {
          // Vuốt đủ xa -> hiện delete button
          Animated.spring(translateX, {
            toValue: -100,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
          // Notify parent component
          if (onSwipe) {
            onSwipe(job.id, true);
          }
        } else {
          // Vuốt chưa đủ xa -> reset về vị trí ban đầu
          resetPosition();
        }
      },
      onPanResponderTerminate: () => {
        // Reset nếu gesture bị hủy
        translateX.flattenOffset();
        resetPosition();
      },
    })
  ).current;

  const handleDelete = () => {
    Alert.alert("Xóa tin tuyển dụng", `Bạn có chắc muốn xóa "${job.title}"?`, [
      { text: "Hủy", style: "cancel", onPress: resetPosition },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          // Animation ẩn card trước khi xóa
          Animated.parallel([
            Animated.timing(cardHeight, {
              toValue: 0,
              duration: 300,
              useNativeDriver: false,
            }),
            Animated.timing(cardOpacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            if (onDelete) {
              onDelete(job.id);
            }
          });
        },
      },
    ]);
  };

  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      // Notify parent component khi card đóng
      if (onSwipe) {
        onSwipe(job.id, false);
      }
    });
  };

  const formattedJob = formatJobData(job);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scaleY: cardHeight }],
          opacity: cardOpacity,
        },
      ]}
    >
      {/* Delete Button (hidden behind) */}
      <View style={styles.deleteContainer}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <MaterialIcons name="delete" size={24} color="#fff" />
          <Text style={styles.deleteText}>Xóa</Text>
        </TouchableOpacity>
      </View>

      {/* Main Card */}
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <View {...panResponder.panHandlers} style={styles.panHandlerWrapper}>
          <TouchableOpacity
            style={styles.jobCard}
            onPress={() => onPress?.(job)}
            activeOpacity={0.8}
            delayPressIn={100}
          >
            <View style={styles.jobCardHeader}>
              <View style={styles.jobInfo}>
                <Text style={styles.jobTitle} numberOfLines={2}>
                  {formattedJob.title || "Chưa có tiêu đề"}
                </Text>
                <Text style={styles.jobSalary}>{formattedJob.salary}</Text>
                <Text style={styles.jobLocation} numberOfLines={1}>
                  {formattedJob.location}
                </Text>
              </View>
              <View style={styles.jobStatus}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: status.color },
                  ]}
                >
                  <Text style={styles.statusText}>{status.text}</Text>
                </View>
              </View>
            </View>
            <View style={styles.jobCardStats}>
              <View style={styles.jobStat}>
                <MaterialIcons name="visibility" size={16} color="#666" />
                <Text style={styles.jobStatText}>{views} lượt xem</Text>
              </View>
              <View style={styles.jobStat}>
                <MaterialIcons name="people" size={16} color="#666" />
                <Text style={styles.jobStatText}>
                  {candidatesCount} ứng viên
                </Text>
              </View>
              <View style={styles.jobStat}>
                <MaterialIcons
                  name="schedule"
                  size={16}
                  color={
                    deadline &&
                    typeof deadline === "object" &&
                    deadline.isExpired
                      ? "#F44336"
                      : "#666"
                  }
                />
                <Text
                  style={[
                    styles.jobStatText,
                    deadline &&
                      typeof deadline === "object" &&
                      deadline.isExpired && {
                        color: "#F44336",
                        fontWeight: "600",
                      },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {typeof deadline === "object" ? deadline.formatted : deadline}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    overflow: "hidden",
  },
  cardWrapper: {
    width: "100%",
  },
  panHandlerWrapper: {
    flex: 1,
  },
  jobCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f44336",
    borderRadius: 12,
    marginBottom: 12,
  },
  deleteButton: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    marginTop: 4,
  },
  jobCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  jobInfo: { flex: 1 },
  jobTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  jobSalary: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
    marginBottom: 2,
  },
  jobLocation: { fontSize: 14, color: "#666" },
  jobStatus: { alignItems: "flex-end" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { color: "white", fontSize: 12, fontWeight: "600" },
  jobCardStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  jobStat: { flexDirection: "row", alignItems: "center", flex: 1 },
  jobStatText: { fontSize: 12, color: "#666", marginLeft: 4 },
});

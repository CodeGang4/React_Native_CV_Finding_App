import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import CandidateCard from "../candidates/CandidateCard";

function getStatusColor(status) {
  switch (status) {
    case "pending":
      return "#FFA500";
    case "shortlisted":
      return "#4CAF50";
    case "rejected":
      return "#F44336";
    default:
      return "#666";
  }
}

function getStatusText(status) {
  switch (status) {
    case "pending":
      return "Chờ xét duyệt";
    case "shortlisted":
      return "Được chọn";
    case "rejected":
      return "Từ chối";
    default:
      return status;
  }
}

export default function ApplicantsList({
  applicants = [],
  loading = false,
  refreshing = false,
  error = null,
  onOpenInterview,
  onPressCandidate,
  onRefresh,
}) {
  // Render loading state
  if (loading && applicants.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Đang tải danh sách ứng viên...</Text>
      </View>
    );
  }

  // Render error state
  if (error && applicants.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}> {error}</Text>
        <Text style={styles.errorSubText}>Vui lòng kéo xuống để thử lại</Text>
      </View>
    );
  }

  // Render empty state
  if (!loading && applicants.length === 0) {
    return (
      <ScrollView
        style={styles.tabContent}
        contentContainerStyle={styles.centerContainer}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        <Text style={styles.emptyIcon}>👥</Text>
        <Text style={styles.emptyTitle}>Chưa có ứng viên nào</Text>
        <Text style={styles.emptySubtitle}>
          Tin tuyển dụng này chưa có ứng viên ứng tuyển
        </Text>
      </ScrollView>
    );
  }

  // Render candidates list
  return (
    <ScrollView
      style={styles.tabContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    >
      <Text style={styles.sectionTitle}>
        Danh sách ứng viên ({applicants.length})
      </Text>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}> {error}</Text>
        </View>
      )}

      {applicants.map((a) => (
        <CandidateCard
          key={a.id}
          candidate={{
            ...a,
            title: a.title || a.appliedPosition || undefined,
          }}
          hideViewCV
          onPress={onPressCandidate ? () => onPressCandidate(a) : undefined}
          onInvite={() => onOpenInterview && onOpenInterview(a)}
          rightAccessory={
            <View style={styles.statusWrap}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(a.status) },
                ]}
              >
                <Text style={styles.statusText}>{getStatusText(a.status)}</Text>
              </View>
              {a.appliedDate ? (
                <Text style={styles.appliedDate}>
                  Ứng tuyển: {a.appliedDate}
                </Text>
              ) : null}
            </View>
          }
        />
      ))}
      <View style={{ height: 16 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabContent: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  statusWrap: { alignItems: "flex-end" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  appliedDate: { fontSize: 11, color: "#777", marginTop: 6 },

  // Loading states
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },

  // Error states
  errorText: {
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  errorBanner: {
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeft: 4,
    borderLeftColor: "#F44336",
  },
  errorBannerText: {
    color: "#C62828",
    fontSize: 14,
  },

  // Empty states
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});

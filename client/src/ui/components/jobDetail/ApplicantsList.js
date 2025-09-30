import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
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
  applicants,
  onOpenInterview,
  onPressCandidate,
}) {
  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>
        Danh sách ứng viên ({applicants.length})
      </Text>
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
      <View style={{ height: 8 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabContent: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },
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
});

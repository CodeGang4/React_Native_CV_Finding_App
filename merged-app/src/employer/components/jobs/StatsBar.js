import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { isApplicationCountingEnabled } from "../../../shared/config/featureFlags.js";

export default function StatsBar({
  jobs = 0,
  applications = 0,
  templates = 0,
  loading = false,
}) {
  const items = [
    { label: "Tin đăng", value: jobs },
    {
      label: "Ứng viên",
      value: applications,
      note:
        !isApplicationCountingEnabled() && applications === 0
          ? "Tính năng tạm tắt"
          : null,
    },
    // { label: "Mẫu email", value: templates },
  ];
  return (
    <View style={styles.row}>
      {items.map((it, idx) => (
        <View key={idx} style={styles.card}>
          {loading ? (
            <ActivityIndicator size="small" color="#00b14f" />
          ) : (
            <Text style={styles.value}>{it.value}</Text>
          )}
          <Text style={styles.label}>{it.label}</Text>
          {it.note && <Text style={styles.note}>{it.note}</Text>}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, marginBottom: 16 },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  value: { fontSize: 20, fontWeight: "700", color: "#00b14f" },
  label: { fontSize: 12, color: "#666", marginTop: 4 },
  note: { fontSize: 10, color: "#999", marginTop: 2, fontStyle: "italic" },
});

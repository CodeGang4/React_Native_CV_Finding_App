import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function JobCard({
  item,
  onPress,
  showLogoColor = false,
  cardBackgroundColor,
}) {
  const cardBgColor = cardBackgroundColor || item.backgroundColor || "#fff";

  return (
    <TouchableOpacity
      style={[styles.jobCard, { backgroundColor: cardBgColor }]}
      onPress={() => onPress && onPress(item)}
    >
      <View
        style={[
          styles.logoContainer,
          showLogoColor && item.logoColor
            ? { backgroundColor: item.logoColor }
            : {},
        ]}
      >
        <Text style={showLogoColor ? styles.logoText : styles.logoEmoji}>
          {item.logo}
        </Text>
      </View>

      <View style={styles.jobInfo}>
        <Text style={styles.jobTitle} numberOfLines={2}>
          {item.title}
          {item.verified && <Text style={styles.verifiedIcon}> ✅</Text>}
        </Text>
        <Text style={styles.jobCompany} numberOfLines={showLogoColor ? 2 : 1}>
          {item.company}
        </Text>
        <View style={styles.jobTagRow}>
          <View style={styles.salaryTag}>
            <Text style={styles.salaryText}>{item.salary}</Text>
          </View>
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.heartContainer}>
        <Text style={styles.heart}>♡</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  jobCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#f0f0f0",
  },
  logoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
  },
  logoEmoji: { fontSize: 24 },
  jobInfo: { flex: 1 },
  jobTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
    lineHeight: 22,
  },
  verifiedIcon: { fontSize: 12 },
  jobCompany: { fontSize: 14, color: "#666", marginBottom: 8, lineHeight: 18 },
  jobTagRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  salaryTag: {
    backgroundColor: "#00b14f",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  salaryText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  locationText: { fontSize: 12, color: "#666" },
  heartContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  heart: { fontSize: 18, color: "#ccc" },
});

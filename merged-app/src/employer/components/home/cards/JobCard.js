import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

export default function JobCard({
  item,
  onPress,
  showLogoColor = false,
  cardBackgroundColor,
}) {
  const cardBgColor = cardBackgroundColor || item.backgroundColor || "#fff";

  // Helper function to shorten location
  const shortenLocation = (location) => {
    if (!location) return "Chưa có địa điểm";

    // Nếu có dấu phẩy, lấy phần cuối (thành phố)
    if (location.includes(",")) {
      const parts = location.split(",");
      const city = parts[parts.length - 1].trim();
      const district = parts[parts.length - 2]?.trim();

      if (district && district.length < 20) {
        return `${district}, ${city}`;
      }
      return city;
    }

    // Nếu quá dài, cắt ngắn
    if (location.length > 25) {
      return location.substring(0, 22) + "...";
    }

    return location;
  };

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
        {item.logo && item.logo.startsWith("http") ? (
          <Image
            source={{ uri: item.logo }}
            style={styles.logoImage}
            onError={(e) =>
              console.log("Logo load error:", e.nativeEvent.error)
            }
          />
        ) : (
          <Text style={showLogoColor ? styles.logoText : styles.logoEmoji}>
            {item.logo || "🏢"}
          </Text>
        )}
      </View>

      <View style={styles.jobInfo}>
        <Text style={styles.jobTitle} numberOfLines={2}>
          {item.title}
          {item.verified && <Text style={styles.verifiedIcon}> </Text>}
        </Text>
        <Text style={styles.jobCompany} numberOfLines={showLogoColor ? 2 : 1}>
          {item.company}
        </Text>
        <View style={styles.jobTagRow}>
          <View style={styles.salaryTag}>
            <Text style={styles.salaryText}>{item.salary}</Text>
          </View>
          <Text style={styles.locationText} numberOfLines={1}>
            {shortenLocation(item.location)}
          </Text>
        </View>
      </View>

      
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
    alignItems: "flex-start",
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#4CAF50",
    flexShrink: 0,
  },
  logoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
  },
  logoEmoji: { fontSize: 20 },
  logoImage: {
    width: 48,
    height: 48,
    borderRadius: 15,
    resizeMode: "contain",
  },
  jobInfo: { flex: 1, minWidth: 0 },
  jobTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
    lineHeight: 20,
  },
  verifiedIcon: { fontSize: 12 },
  jobCompany: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
    lineHeight: 18,
  },
  jobTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  salaryTag: {
    backgroundColor: "#00b14f",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  salaryText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  locationText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
    flexShrink: 1,
  },
  heartContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  heart: { fontSize: 18, color: "#ccc" },
});

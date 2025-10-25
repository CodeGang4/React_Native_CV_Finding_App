import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function JobCard({ job, onPress, onFavoritePress, isSaved }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(job)}>
      <View style={styles.headerRow}>
        <View style={styles.logoContainer}>
          {job.company_logo ? (
            <Image
              source={{ uri: job.company_logo }}
              style={styles.logo}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderLogo}>
              <Text style={styles.placeholderText}>Logo</Text>
            </View>
          )}
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={2}>
            {job.title}
          </Text>
          <View style={styles.subInfoRow}>
            <Text style={styles.company} numberOfLines={1}>
              {job.company_name || "Không rõ công ty"}
            </Text>
            {job.location && <Text style={styles.dot}> · </Text>}
            <Text style={styles.locationText} numberOfLines={1}>
              {job.location}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.salaryContainer}>
          <Text style={styles.salaryText}>{job.salary}</Text>
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => onFavoritePress?.(job)}
        >
          <Icon
            name={isSaved ? "heart" : "heart-outline"}
            size={24}
            color={isSaved ? "#ff4d4f" : "#00b14f"}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#f0f8f0",
    borderWidth: 2,
    borderColor: "#00b14f",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logo: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  placeholderLogo: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#999",
    fontSize: 12,
  },
  headerText: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
  },
  company: {
    fontSize: 14,
    color: "#666",
    opacity: 0.7,
    flexShrink: 0,
    minWidth: 0,
  },
  dot: {
    fontSize: 14,
    color: "#999",
    marginHorizontal: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    flexShrink: 1,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  salaryContainer: {
    backgroundColor: "#e6f8ee",
    borderWidth: 1,
    borderColor: "#00b14f",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  salaryText: {
    color: "#00b14f",
    fontWeight: "600",
    fontSize: 14,
  },
  locationContainer: {
    display: "none",
  },
  favoriteButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
});

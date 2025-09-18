import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function BrandCard({
  brand,
  onPress,
  buttonText = "+ Theo dõi",
}) {
  return (
    <TouchableOpacity style={styles.brandCard} onPress={onPress}>
      {brand.tag && brand.tag !== "" && (
        <View style={styles.tagContainer}>
          <Text style={styles.tagText}>{brand.tag}</Text>
        </View>
      )}
      <View style={styles.logoContainer}>
        <Text style={styles.logoEmoji}>{brand.logo}</Text>
      </View>
      <Text style={styles.brandName} numberOfLines={3}>
        {brand.name}
      </Text>
      <Text style={styles.brandCategory}>{brand.category}</Text>
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followText}>{buttonText}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  brandCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    position: "relative",
  },
  tagContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#ff6b35",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  logoEmoji: { fontSize: 24 },
  brandName: {
    fontWeight: "600",
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    lineHeight: 18,
  },
  brandCategory: { color: "#666", fontSize: 12, marginBottom: 12 },
  followButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#00b14f",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  followText: { color: "#00b14f", fontSize: 12, fontWeight: "600" },
});

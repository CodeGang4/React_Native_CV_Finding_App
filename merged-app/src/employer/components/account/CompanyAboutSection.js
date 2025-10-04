import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function CompanyAboutSection({ description, loading = false }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Giới thiệu công ty</Text>
      <Text
        style={[
          styles.descriptionText,
          (description === "Chưa có mô tả về công ty" ||
            description === "Chưa có mô tả") &&
            styles.placeholderText,
        ]}
      >
        {loading ? "Đang tải..." : description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    marginTop: 10,
  },
  placeholderText: {
    color: "#999",
    fontStyle: "italic",
  },
});

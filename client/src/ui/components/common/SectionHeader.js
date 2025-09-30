import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function SectionHeader({ title, onSeeAllPress }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {onSeeAllPress ? (
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 1 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#333" },
  seeAll: { color: "#00b14f", fontWeight: "700" },
});

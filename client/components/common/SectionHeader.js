import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function SectionHeader({
  title,
  onSeeAllPress,
  showSeeAll = true,
}) {
  return (
    <View style={styles.rowBetween}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {showSeeAll && (
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
  },
  seeAll: {
    color: "#00b14f",
    fontWeight: "bold",
  },
});

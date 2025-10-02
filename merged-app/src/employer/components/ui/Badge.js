import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../../shared/styles/colors";

export default function Badge({ value }) {
  if (typeof value !== "number" || value <= 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{value > 99 ? "99+" : value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    right: -10,
    top: -6,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "700",
  },
});

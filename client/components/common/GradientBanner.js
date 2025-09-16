import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function GradientBanner({
  colors,
  title,
  icon,
  style,
  titleStyle,
  iconStyle,
}) {
  return (
    <LinearGradient colors={colors} style={[styles.banner, style]}>
      <Text style={[styles.bannerText, titleStyle]}>{title}</Text>
      {icon && <Text style={[styles.bannerIcon, iconStyle]}>{icon}</Text>}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 20,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bannerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    flex: 1,
  },
  bannerIcon: {
    fontSize: 24,
  },
});

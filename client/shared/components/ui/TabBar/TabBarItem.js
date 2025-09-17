import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Badge from "../Badge";
import { colors } from "../../../constants/colors";

export default function TabBarItem({
  icon,
  label,
  active,
  badge,
  onPress,
  onLongPress,
}) {
  const tint = active ? colors.primary : colors.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
      android_ripple={{ color: "rgba(0,0,0,0.08)" }}
      hitSlop={8}
    >
      <View style={styles.iconWrap}>
        <MaterialIcons name={icon} size={26} color={tint} />
        <Badge value={badge} />
      </View>
      <Text numberOfLines={1} style={[styles.label, { color: tint }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: { flex: 1, alignItems: "center", justifyContent: "center" },
  itemPressed: { opacity: 0.9 },
  iconWrap: { position: "relative", height: 28, justifyContent: "center" },
  label: { fontSize: 12, fontWeight: "600", marginTop: 4 },
});

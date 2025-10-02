import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function ActionsBar({ onCreatePress, onManageTemplatesPress }) {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.primaryButton} onPress={onCreatePress}>
        <Text style={styles.primaryText}>Đăng tin mới</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={onManageTemplatesPress}
      >
        <Text style={styles.secondaryText}>Quản lý email mẫu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, marginBottom: 16 },
  primaryButton: {
    flex: 1,
    backgroundColor: "#00b14f",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "600" },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  secondaryText: { color: "#00b14f", fontWeight: "600" },
});
import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function RecruitmentSettingsSection({
  isRecruiting,
  onToggleRecruiting,
  allowContactFromCandidates,
  onToggleAllowContact,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Cài đặt tuyển dụng</Text>
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Đang tuyển dụng</Text>
          <Text style={styles.settingDescription}>
            Hiển thị trạng thái tuyển dụng
          </Text>
        </View>
        <Switch
          value={isRecruiting}
          onValueChange={onToggleRecruiting}
          trackColor={{ false: "#ddd", true: "#4CAF50" }}
          thumbColor={"#fff"}
        />
      </View>
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Cho phép ứng viên liên hệ</Text>
          <Text style={styles.settingDescription}>
            Ứng viên có thể liên hệ trực tiếp
          </Text>
        </View>
        <Switch
          value={allowContactFromCandidates}
          onValueChange={onToggleAllowContact}
          trackColor={{ false: "#ddd", true: "#4CAF50" }}
          thumbColor={"#fff"}
        />
      </View>
      <View style={styles.contactPreferences}>
        <View style={styles.preferenceItem}>
          <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
          <Text style={styles.preferenceText}>Nhận tin qua TopConnect</Text>
        </View>
        <View style={styles.preferenceItem}>
          <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
          <Text style={styles.preferenceText}>Email và số điện thoại</Text>
        </View>
      </View>
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingInfo: { flex: 1 },
  settingLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    marginBottom: 4,
  },
  settingDescription: { fontSize: 12, color: "#666" },
  contactPreferences: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  preferenceText: {
    fontSize: 14,
    color: "#4CAF50",
    marginLeft: 8,
    fontWeight: "500",
  },
});

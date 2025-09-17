import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function CompanyInfoSection({ companyInfo, onEdit }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Thông tin công ty</Text>
        <View style={styles.editButton} onTouchEnd={onEdit}>
          <MaterialIcons name="edit" size={20} color="#4CAF50" />
          <Text style={styles.editButtonText}>Chỉnh sửa</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <MaterialIcons name="business" size={20} color="#666" />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Tên công ty</Text>
          <Text style={styles.infoValue}>{companyInfo.name}</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <MaterialIcons name="badge" size={20} color="#666" />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Mã số thuế</Text>
          <Text style={styles.infoValue}>{companyInfo.code}</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <MaterialIcons name="people" size={20} color="#666" />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Quy mô</Text>
          <Text style={styles.infoValue}>{companyInfo.employees}</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <MaterialIcons name="location-on" size={20} color="#666" />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Địa chỉ</Text>
          <Text style={styles.infoValue}>{companyInfo.address}</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <MaterialIcons name="language" size={20} color="#666" />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Website</Text>
          <Text style={[styles.infoValue, styles.linkText]}>
            {companyInfo.website}
          </Text>
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#f0f8f0",
  },
  editButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  infoRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 15 },
  infoContent: { flex: 1, marginLeft: 12 },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  infoValue: { fontSize: 14, color: "#333", lineHeight: 20 },
  linkText: { color: "#4CAF50", textDecorationLine: "underline" },
});

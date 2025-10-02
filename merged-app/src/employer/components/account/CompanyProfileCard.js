import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

export default function CompanyProfileCard({ companyInfo, onUpgrade }) {
  return (
    <View style={styles.companyCard}>
      <View style={styles.companyHeader}>
        <View style={styles.companyLogoContainer}>
          <Image
            source={{ uri: companyInfo.logo }}
            style={styles.companyLogo}
          />
        </View>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{companyInfo.name}</Text>
          <Text style={styles.companyCode}>{companyInfo.code}</Text>
          <Text style={styles.companyEmployees}>{companyInfo.employees}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
        <Text style={styles.upgradeButtonText}>Nâng cấp tài khoản</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  companyCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  companyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 0,
  },
  companyLogoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
    flexShrink: 0,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  companyInfo: { flex: 1, minWidth: 0 },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  companyCode: { fontSize: 14, color: "#666", marginBottom: 2 },
  companyEmployees: { fontSize: 14, color: "#666" },
  upgradeButton: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 0,
  },
  upgradeButtonText: { fontSize: 14, fontWeight: "600", color: "#333" },
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function CompanyProfileCard({
  companyInfo,
  loading = false,
  onUpgrade,
}) {
  return (
    <View style={styles.companyCard}>
      <View style={styles.companyHeader}>
        <View style={styles.companyLogoContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#4CAF50" />
          ) : companyInfo.logo ? (
            <Image
              source={{ uri: companyInfo.logo }}
              style={styles.companyLogo}
              onError={() => console.log("Failed to load company logo")}
            />
          ) : (
            <MaterialIcons name="business" size={30} color="#ccc" />
          )}
        </View>
        <View style={styles.companyInfo}>
          <Text
            style={[
              styles.companyName,
              companyInfo.name === "Chưa cập nhật" && styles.placeholderText,
            ]}
          >
            {loading ? "Đang tải..." : companyInfo.name}
          </Text>
          <Text style={styles.companyWebsite}>
            {loading ? "..." : companyInfo.website}
          </Text>
          <Text style={styles.companyEmployees}>
            {loading ? "..." : companyInfo.employees}
          </Text>
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
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
    flexShrink: 0,
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 20,
    resizeMode: "contain",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  companyInfo: { flex: 1, minWidth: 0 },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  companyWebsite: { fontSize: 14, color: "#666", marginBottom: 2 },
  companyEmployees: { fontSize: 14, color: "#666" },
  placeholderText: {
    color: "#999",
    fontStyle: "italic",
  },
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

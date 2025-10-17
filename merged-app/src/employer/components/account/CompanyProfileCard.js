import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

export default function CompanyProfileCard({
  companyInfo,
  loading = false,
  onUpgrade,
  onLogoUpdate,
}) {
  const handleSelectImage = async () => {
    try {
      // Yêu cầu quyền truy cập thư viện ảnh
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Quyền truy cập bị từ chối",
          "Bạn cần cấp quyền truy cập thư viện ảnh để chọn logo công ty."
        );
        return;
      }

      // Mở thư viện ảnh
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Tỷ lệ vuông cho logo
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];

        // Gọi callback để cập nhật logo
        if (onLogoUpdate) {
          onLogoUpdate(selectedImage.uri);
        }
      }
    } catch (error) {
      console.error("Lỗi khi chọn ảnh:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại.");
    }
  };
  return (
    <View style={styles.companyCard}>
      <View style={styles.companyHeader}>
        <TouchableOpacity
          style={styles.companyLogoContainer}
          onPress={handleSelectImage}
          disabled={loading}
        >
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
          {/* Overlay để hiển thị icon camera khi hover */}
          <View style={styles.logoOverlay}>
            <MaterialIcons
              name="camera-alt"
              size={20}
              color="rgba(255,255,255,0.8)"
            />
          </View>
        </TouchableOpacity>
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
    position: "relative",
    overflow: "hidden",
  },
  logoOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 8,
    padding: 2,
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

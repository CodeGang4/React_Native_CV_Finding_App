import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function UpgradeAccountScreen({ navigation }) {
  const features = [
    {
      icon: "trending-up",
      text: "Phân tích mức độ cạnh tranh so với ứng viên khác không giới hạn",
    },
    {
      icon: "stars",
      text: "Ưu tiên đẩy Top hiển thị với NTD 1 lần/ngày",
    },
    {
      icon: "search",
      text: "Truy cập kho CV, Cover Letter cao cấp",
    },
    {
      icon: "folder-open",
      text: "Tạo và quản lý tối đa 12 CV và Cover Letter",
    },
    {
      icon: "card-giftcard",
      text: "Gói quà tặng học tập từ đối tác Gitiho",
    },
    {
      icon: "flash-on",
      text: "Chỉ chờ 3s khi tải CV và Cover Letter",
    },
    {
      icon: "visibility-off",
      text: "Ẩn biểu tượng @topcv.vn",
    },
  ];

  const handleUpgradeNow = () => {
    // TODO: Implement payment logic here
    alert("Đang xử lý nâng cấp gói Pro");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />

      {/* Header without background */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
          <Text style={styles.headerTitle}>Quay lại</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Nâng cấp tài khoản</Text>
          <Text style={styles.subtitle}>Mở khóa quyền lợi ứng viên Pro</Text>
        </View>

        {/* Diamond Icon */}
        <View style={styles.diamondContainer}>
          <View style={styles.diamondWrapper}>
            <Image
              source={require("../../../../assets/diamond-icon.png")}
              style={styles.diamondImage}
              resizeMode="contain"
            />

            {/* Sparkle effects with animation */}
            <View style={[styles.sparkle, styles.sparkle1]}>
              <MaterialIcons name="auto-awesome" size={16} color="#68cdfcff" />
            </View>
            <View style={[styles.sparkle, styles.sparkle2]}>
              <MaterialIcons name="auto-awesome" size={18} color="#ffffffff" />
            </View>
            <View style={[styles.sparkle, styles.sparkle3]}>
              <MaterialIcons name="auto-awesome" size={14} color="#ffffffff" />
            </View>
          </View>
        </View>

        {/* Plan Title */}
        <Text style={styles.planTitle}>Pro</Text>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>500.000 VND</Text>
          <Text style={styles.priceUnit}> / 1 năm</Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.checkIconContainer}>
                <MaterialIcons name="check-circle" size={22} color="#4CAF50" />
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        {/* Spacing before button */}
        <View style={styles.buttonSpacing} />
      </ScrollView>

      {/* Upgrade Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={handleUpgradeNow}
          activeOpacity={0.8}
        >
          <Text style={styles.upgradeButtonText}>Nâng cấp ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A2E",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 12,
    backgroundColor: "#1A1A2E",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  backButton: {
    padding: 6,
    marginRight: 6,
    borderRadius: 8,
    backgroundColor: "transparent",
    flexDirection: "row",
    gap: 6,
  },
  headerTitle: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
    backgroundColor: "#1A1A2E",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#B0B0B0",
    textAlign: "center",
  },
  diamondContainer: {
    alignItems: "center",
    marginBottom: 10,
    marginTop: 8,
  },
  diamondWrapper: {
    position: "relative",
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  diamondImage: {
    width: 80,
    height: 80,
  },
  sparkle: {
    position: "absolute",
  },
  sparkle1: {
    top: 8,
    right: 8,
  },
  sparkle2: {
    top: 24,
    left: 3,
  },
  sparkle3: {
    bottom: 16,
    right: 32,
  },
  planTitle: {
    fontSize: 34,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 1,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "baseline",
    marginBottom: 40,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    marginHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  price: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4CAF50",
    letterSpacing: 0.5,
  },
  priceUnit: {
    fontSize: 16,
    color: "#B0B0B0",
    marginLeft: 4,
  },
  featuresContainer: {
    paddingHorizontal: 24,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  checkIconContainer: {
    marginRight: 14,
    marginTop: 2,
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    borderRadius: 12,
    padding: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: "#E0E0E0",
    lineHeight: 24,
  },
  buttonSpacing: {
    height: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
    backgroundColor: "#1A1A2E",
    borderTopWidth: 1,
    borderTopColor: "#2A2A3E",
  },
  upgradeButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  upgradeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});

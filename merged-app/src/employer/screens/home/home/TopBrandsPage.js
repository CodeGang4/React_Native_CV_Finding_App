import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import CommonHeader from "../../../components/common/CommonHeader";
import { TAB_BAR_PADDING } from "../../../../shared/styles/layout";

const allBrands = [
  {
    id: 1,
    name: "NGÂN HÀNG THƯƠNG MẠI CỔ PHẦN KỸ THƯƠNG VIỆT NAM",
    category: "Ngân hàng",
    jobCount: 28,
    logo: "TECHCOMBANK",
    logoColor: "#e74c3c",
    tag: "VNR500",
  },
  {
    id: 2,
    name: "CÔNG TY TNHH SHOPEE",
    category: "Thương mại điện tử",
    jobCount: 156,
    logo: "SHOPEE",
    logoColor: "#ff5722",
    tag: "TOP500",
  },
  {
    id: 3,
    name: "NGÂN HÀNG TMCP XUẤT NHẬP KHẨU VIỆT NAM",
    category: "Ngân hàng",
    jobCount: 45,
    logo: "EXIMBANK",
    logoColor: "#1976d2",
    tag: null,
  },
  {
    id: 4,
    name: "CÔNG TY CỔ PHẦN TẬP ĐOÀN FPT",
    category: "Công nghệ thông tin",
    jobCount: 89,
    logo: "FPT",
    logoColor: "#ff9800",
    tag: "TOP100",
  },
  {
    id: 5,
    name: "NGÂN HÀNG THƯƠNG MẠI CỔ PHẦN VIỆT NAM THỊNH VƯỢNG",
    category: "Ngân hàng",
    jobCount: 67,
    logo: "VPBANK",
    logoColor: "#4caf50",
    tag: "VNR500",
  },
  {
    id: 6,
    name: "CÔNG TY CỔ PHẦN VINHOMES",
    category: "Bất động sản",
    jobCount: 123,
    logo: "VINHOMES",
    logoColor: "#9c27b0",
    tag: "TOP100",
  },
  {
    id: 7,
    name: "NGÂN HÀNG TMCP Á CHÂU",
    category: "Ngân hàng",
    jobCount: 34,
    logo: "ACB",
    logoColor: "#00bcd4",
    tag: null,
  },
  {
    id: 8,
    name: "CÔNG TY CỔ PHẦN VINGROUP",
    category: "Tập đoàn đa ngành",
    jobCount: 234,
    logo: "VINGROUP",
    logoColor: "#f44336",
    tag: "TOP50",
  },
  {
    id: 9,
    name: "NGÂN HÀNG TMCP QUỐC TẾ VIỆT NAM",
    category: "Ngân hàng",
    jobCount: 56,
    logo: "VIB",
    logoColor: "#673ab7",
    tag: "VNR500",
  },
  {
    id: 10,
    name: "CÔNG TY CỔ PHẦN THÉP HÒA PHÁT",
    category: "Sản xuất",
    jobCount: 78,
    logo: "HOA PHAT",
    logoColor: "#795548",
    tag: "TOP200",
  },
];

const BrandCard = ({ brand }) => (
  <View style={styles.brandCard}>
    {brand.tag && (
      <View style={styles.tagContainer}>
        <Text style={styles.tagText}>{brand.tag}</Text>
      </View>
    )}
    <View style={styles.logoContainer}>
      <View style={[styles.logo, { backgroundColor: brand.logoColor }]}>
        <Text style={styles.logoText}>{brand.logo}</Text>
      </View>
    </View>
    <View style={styles.brandInfo}>
      <Text style={styles.brandName} numberOfLines={2}>
        {brand.name}
      </Text>
      <Text style={styles.brandCategory}>{brand.category}</Text>
      <Text style={styles.jobCount}>{brand.jobCount} việc làm</Text>
    </View>
    <TouchableOpacity style={styles.followButton}>
      <Text style={styles.followButtonText}>Theo dõi</Text>
    </TouchableOpacity>
  </View>
);

export default function TopBrandsPage({ onBack }) {
  const handleBackPress = () => {
    if (onBack && typeof onBack === "function") {
      onBack();
    }
  };

  return (
    <View style={styles.container}>
      <CommonHeader
        title="Top Brands"
        onBack={handleBackPress}
        showAI={false}
      />
      <ScrollView
        style={styles.brandsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={TAB_BAR_PADDING}
      >
        {allBrands.map((brand) => (
          <BrandCard key={brand.id} brand={brand} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  brandsList: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  brandCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  tagContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#00b14f",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  tagText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  logoContainer: { alignItems: "center", marginBottom: 12 },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 4,
  },
  brandInfo: { alignItems: "center", marginBottom: 16 },
  brandName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
    lineHeight: 18,
  },
  brandCategory: { fontSize: 12, color: "#666", marginBottom: 4 },
  jobCount: { fontSize: 12, color: "#00b14f", fontWeight: "500" },
  followButton: {
    backgroundColor: "#00b14f",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: "center",
  },
  followButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});

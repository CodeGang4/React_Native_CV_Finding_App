import React from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import SectionHeader from "../common/SectionHeader";
import BrandCard from "../cards/BrandCard";
import { useHomeData } from "../../../shared/services/HomeDataManager";

const brandsList = [
  {
    id: 1,
    name: "NGÂN HÀNG THƯƠNG MẠI CỔ PHẦN KỸ THƯƠNG VIỆT NAM",
    category: "Ngân hàng",
    logo: "🏦",
    tag: "VNR500",
  },
  {
    id: 2,
    name: "Ngân Hàng TMCP Việt Nam Thịnh Vượng (VPBank)",
    category: "Ngân hàng",
    logo: "🏛️",
    tag: "VNR500",
  },
  {
    id: 3,
    name: "CÔNG TY CỔ PHẦN TẬP ĐOÀN TRƯỜNG THỊNH",
    category: "Sản xuất",
    logo: "🏭",
    tag: "",
  },
  {
    id: 4,
    name: "NOVALAND GROUP CORP",
    category: "Bất động sản",
    logo: "🏘️",
    tag: "",
  },
];

export default function TopBrands({ onTopBrandsPress, onCompanyPress }) {
  const { data, loading, error } = useHomeData();
  const { companies } = data;

  console.log("[TopBrands] Component state:", {
    companiesCount: companies.length,
    loading,
    error,
    companies: companies.slice(0, 2), // Log first 2 companies for debugging
  });

  if (loading.companies) {
    return (
      <View style={styles.section}>
        <SectionHeader
          title="Thương hiệu lớn tiêu biểu"
          onSeeAllPress={onTopBrandsPress}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#00b14f" />
          <Text style={styles.loadingText}>Đang tải dữ liệu công ty...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <SectionHeader
        title="Thương hiệu lớn tiêu biểu"
        onSeeAllPress={onTopBrandsPress}
      />
      {error.companies && (
        <Text style={styles.errorText}>
          Không thể tải dữ liệu từ server, hiển thị dữ liệu mẫu
        </Text>
      )}
      <View style={styles.brandsGrid}>
        {error.companies || companies.length === 0
          ? brandsList.map((brand, index) => (
              <BrandCard
                key={`static-brand-${brand.id || index}`}
                brand={brand}
                onPress={() => onCompanyPress && onCompanyPress(brand)}
              />
            ))
          : companies.map((brand, index) => (
              <BrandCard
                key={`company-${brand.id || index}`}
                brand={brand}
                onPress={() => onCompanyPress && onCompanyPress(brand)}
              />
            ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 12,
    marginHorizontal: 0,
    paddingHorizontal: 16,
  },
  brandsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
    gap: 8,
  },
  loadingText: {
    color: "#666",
    fontSize: 12,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
});

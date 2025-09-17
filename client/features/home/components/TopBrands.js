import React from "react";
import { View, StyleSheet } from "react-native";
import SectionHeader from "../../../components/common/SectionHeader";
import BrandCard from "../../../components/cards/BrandCard";

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

export default function TopBrands({ onTopBrandsPress }) {
  return (
    <View style={styles.section}>
      <SectionHeader
        title="Thương hiệu lớn tiêu biểu"
        onSeeAllPress={onTopBrandsPress}
      />
      <View style={styles.brandsGrid}>
        {brandsList.map((brand) => (
          <BrandCard key={brand.id} brand={brand} />
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
});

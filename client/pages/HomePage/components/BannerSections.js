import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import GradientBanner from "../../../components/common/GradientBanner";

export default function BannerSections() {
  return (
    <>
      {/* Cùng chia sẻ - Cùng vươn xa */}
      <GradientBanner
        colors={["#00b14f", "#4cd471"]}
        title="Cùng chia sẻ - Cùng vươn xa"
        icon="📈"
      />

      {/* Thêm công cụ - Thêm vượt trội */}
      <GradientBanner
        colors={["#2c5f41", "#00b14f"]}
        title="Thêm công cụ - Thêm vượt trội"
        icon="🛠️"
      />

      {/* Tools Section */}
      <View style={styles.section}>
        <View style={styles.toolCardGreen}>
          <View style={styles.toolContent}>
            <Text style={styles.toolTitleGreen}>
              Trắc nghiệm tính cách MBTI
            </Text>
            <TouchableOpacity style={styles.greenBtnWhite}>
              <Text style={styles.greenBtnWhiteText}>Khám phá ngay</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.toolIcon}>🧠</Text>
        </View>

        <View style={styles.toolCardGreen}>
          <View style={styles.toolContent}>
            <Text style={styles.toolTitleGreen}>
              Trắc nghiệm đa trí thông minh MI
            </Text>
            <TouchableOpacity style={styles.greenBtnWhite}>
              <Text style={styles.greenBtnWhiteText}>Khám phá ngay</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.toolIcon}>🧩</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 12,
    marginHorizontal: 16,
  },
  toolCardGreen: {
    backgroundColor: "#00b14f",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toolContent: {
    flex: 1,
  },
  toolTitleGreen: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 12,
    color: "#fff",
    lineHeight: 22,
  },
  toolIcon: {
    fontSize: 32,
    marginLeft: 16,
  },
  greenBtnWhite: {
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
  },
  greenBtnWhiteText: {
    color: "#00b14f",
    fontWeight: "bold",
    fontSize: 14,
  },
});

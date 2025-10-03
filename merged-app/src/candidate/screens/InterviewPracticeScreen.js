import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function InterviewPracticeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Đây là trang Luyện phỏng vấn</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 18,
    fontWeight: "500",
  },
});

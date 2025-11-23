import React from "react";
import { View, Text, TouchableOpacity, Alert, Linking } from "react-native";

/**
 * Component hiển thị thông báo về quota limits của Gemini AI
 */
export const QuotaLimitNotice = ({ visible, onClose }) => {
  const handleLearnMore = () => {
    Alert.alert(
      "Về Quota Limits",
      "Gemini AI Free Tier có giới hạn:\n\n" +
        "• 10 requests/minute\n" +
        "• 1,500 requests/day\n\n" +
        "Để tăng giới hạn, bạn có thể:\n" +
        "1. Đợi và retry sau\n" +
        "2. Upgrade lên paid plan\n" +
        "3. Sử dụng multiple API keys",
      [
        { text: "Đóng", style: "cancel" },
        {
          text: "Xem Pricing",
          onPress: () => Linking.openURL("https://ai.google.dev/pricing"),
        },
      ]
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.notice}>
        <Text style={styles.title}> Quota Limit Reached</Text>
        <Text style={styles.message}>
          Bạn đã vượt quá giới hạn API của Gemini AI Free Tier (10
          requests/minute).
        </Text>
        <Text style={styles.suggestion}>
          Hệ thống sẽ tự động retry sau 45 giây hoặc sử dụng AI backup.
        </Text>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.button} onPress={handleLearnMore}>
            <Text style={styles.buttonText}>Tìm hiểu thêm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={onClose}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              Đóng
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = {
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  notice: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 10,
    maxWidth: 350,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#FF6B35",
  },
  message: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
    color: "#333",
  },
  suggestion: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
    color: "#666",
    fontStyle: "italic",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#007AFF",
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    textAlign: "center",
    color: "#007AFF",
    fontWeight: "600",
  },
  primaryButtonText: {
    color: "white",
  },
};

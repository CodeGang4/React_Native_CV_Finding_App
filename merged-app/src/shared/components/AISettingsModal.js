import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AIConfig, FALLBACK_CONFIG } from "../services/business/AIConfig.js";

/**
 * AI Settings Component - Cấu hình API key và settings cho Real AI
 */
export const AISettingsModal = ({ visible, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState("");
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (visible) {
      loadCurrentConfig();
    }
  }, [visible]);

  const loadCurrentConfig = () => {
    const config = AIConfig.getCurrentConfig();
    setCurrentConfig(config);

    if (config.hasValidKey) {
      // Ẩn bớt API key để bảo mật
      const maskedKey =
        AIConfig.GEMINI_CONFIG.API_KEY.substring(0, 8) +
        "..." +
        AIConfig.GEMINI_CONFIG.API_KEY.substring(-4);
      setApiKey(maskedKey);
    }
  };

  const handleTestAPIKey = async () => {
    if (!apiKey || apiKey.length < 10) {
      Alert.alert("Lỗi", "Vui lòng nhập API key hợp lệ");
      return;
    }

    setIsTestingKey(true);
    setTestResult(null);

    try {
      const result = await AIConfig.testAPIKey(apiKey);
      setTestResult(result);

      if (result.success) {
        Alert.alert(
          "Thành công! 🎉",
          "API key hoạt động tốt. Bạn có thể sử dụng Real AI ngay bây giờ!",
          [{ text: "OK", onPress: () => handleSaveConfig() }]
        );
      } else {
        Alert.alert(
          "Lỗi API Key ❌",
          `${result.error}\n\n💡 Gợi ý: ${result.suggestion}`,
          [
            { text: "Thử lại", style: "default" },
            { text: "Xem hướng dẫn", onPress: showAPIKeyGuide },
          ]
        );
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể test API key: " + error.message);
    }

    setIsTestingKey(false);
  };

  const handleSaveConfig = () => {
    if (AIConfig.updateAPIKey(apiKey)) {
      Alert.alert("Đã lưu!", "Cấu hình AI đã được cập nhật thành công");
      onSave && onSave();
      onClose();
    }
  };

  const showAPIKeyGuide = () => {
    const guide = AIConfig.getAPIKeyGuide();

    Alert.alert(
      guide.title,
      guide.steps.join("\n\n") +
        "\n\n📝 Lưu ý:\n" +
        guide.notes.join("\n") +
        "\n\n🔧 Khắc phục sự cố:\n" +
        guide.troubleshooting.join("\n"),
      [
        {
          text: "Mở link",
          onPress: () =>
            Linking.openURL("https://makersuite.google.com/app/apikey"),
        },
        { text: "Đóng", style: "cancel" },
      ]
    );
  };

  const FeatureComparison = () => (
    <View style={styles.comparisonSection}>
      <Text style={styles.comparisonTitle}>🔥 So sánh tính năng AI</Text>

      <View style={styles.featureRow}>
        <Text style={styles.featureLabel}>Local AI (Rule-based)</Text>
        <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
      </View>

      {FALLBACK_CONFIG.LOCAL_AI_FEATURES.map((feature, index) => (
        <Text key={index} style={styles.featureItem}>
          • {feature}
        </Text>
      ))}

      <View style={[styles.featureRow, { marginTop: 15 }]}>
        <Text style={styles.featureLabel}>Gemini AI</Text>
        <MaterialIcons
          name={currentConfig?.hasValidKey ? "check-circle" : "error"}
          size={20}
          color={currentConfig?.hasValidKey ? "#4CAF50" : "#f44336"}
        />
      </View>

      {FALLBACK_CONFIG.GEMINI_AI_FEATURES.map((feature, index) => (
        <Text key={index} style={styles.featureItem}>
          • {feature}
        </Text>
      ))}
    </View>
  );

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ Cấu hình AI</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Current Status */}
          <View style={styles.statusSection}>
            <Text style={styles.sectionTitle}>📊 Trạng thái hiện tại</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Gemini AI:</Text>
              <View style={styles.statusBadge(currentConfig?.hasValidKey)}>
                <Text style={styles.statusText}>
                  {currentConfig?.hasValidKey
                    ? "🟢 Đã kích hoạt"
                    : "🔴 Chưa cấu hình"}
                </Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Model:</Text>
              <Text style={styles.statusValue}>
                {currentConfig?.model || "N/A"}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Rate Limit:</Text>
              <Text style={styles.statusValue}>
                {currentConfig?.rateLimit || 0} req/min
              </Text>
            </View>
          </View>

          {/* API Key Input */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>🔑 Google Gemini API Key</Text>
            <TextInput
              style={styles.apiKeyInput}
              placeholder="Nhập API key của bạn..."
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry={apiKey.includes("...")}
              multiline={true}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.testButton}
                onPress={handleTestAPIKey}
                disabled={isTestingKey}
              >
                {isTestingKey ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialIcons name="science" size={20} color="#fff" />
                )}
                <Text style={styles.buttonText}>
                  {isTestingKey ? "Đang test..." : "Test API Key"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.guideButton}
                onPress={showAPIKeyGuide}
              >
                <MaterialIcons name="help" size={20} color="#2196F3" />
                <Text style={styles.guideButtonText}>Hướng dẫn</Text>
              </TouchableOpacity>
            </View>

            {testResult && (
              <View style={styles.testResult(testResult.success)}>
                <MaterialIcons
                  name={testResult.success ? "check-circle" : "error"}
                  size={20}
                  color={testResult.success ? "#4CAF50" : "#f44336"}
                />
                <Text style={styles.testResultText}>
                  {testResult.success ? testResult.message : testResult.error}
                </Text>
              </View>
            )}
          </View>

          {/* Feature Comparison */}
          <FeatureComparison />

          {/* Quick Setup Guide */}
          <View style={styles.quickGuideSection}>
            <Text style={styles.sectionTitle}>⚡ Thiết lập nhanh</Text>
            <Text style={styles.quickGuideText}>
              1. Truy cập makersuite.google.com/app/apikey{"\n"}
              2. Tạo API key mới (100% miễn phí){"\n"}
              3. Copy và paste vào ô trên{"\n"}
              4. Nhấn "Test API Key"{"\n"}
              5. Tận hưởng Real AI! 🚀
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveConfig}
            disabled={!apiKey || apiKey.length < 10}
          >
            <MaterialIcons name="save" size={20} color="#fff" />
            <Text style={styles.buttonText}>Lưu cấu hình</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
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
  modal: {
    backgroundColor: "white",
    borderRadius: 15,
    width: "90%",
    maxHeight: "80%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  statusSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: "#666",
  },
  statusValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  statusBadge: (isActive) => ({
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
    backgroundColor: isActive ? "#E8F5E8" : "#FFE8E8",
  }),
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  inputSection: {
    marginBottom: 20,
  },
  apiKeyInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
    fontFamily: "monospace",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  testButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  guideButton: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
  guideButtonText: {
    color: "#2196F3",
    fontWeight: "500",
    fontSize: 14,
  },
  testResult: (isSuccess) => ({
    flexDirection: "row",
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: isSuccess ? "#E8F5E8" : "#FFE8E8",
    alignItems: "center",
    gap: 8,
  }),
  testResultText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  comparisonSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  featureLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  featureItem: {
    fontSize: 13,
    color: "#666",
    marginLeft: 10,
    marginBottom: 2,
  },
  quickGuideSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#E3F2FD",
    borderRadius: 10,
  },
  quickGuideText: {
    fontSize: 14,
    color: "#1976D2",
    lineHeight: 20,
  },
  bottomActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});

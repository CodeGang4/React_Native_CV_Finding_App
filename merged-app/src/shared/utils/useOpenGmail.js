import { Linking, Alert, Platform } from "react-native";

/**
 Mở mail compose với người nhận là userEmail
 Dùng mailto để mở app mail mặc định
 */
export const openGmail = async (userEmail) => {
  if (!userEmail) {
    Alert.alert("Lỗi", "Không tìm thấy email của bạn.");
    return;
  }

  const subject = "";
  const body = "";
  const mailto = `mailto:${encodeURIComponent(userEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  try {
    const canOpen = await Linking.canOpenURL(mailto);
    if (!canOpen) {
      Alert.alert("Lỗi", "Không thể mở ứng dụng email trên thiết bị.");
      return;
    }
    await Linking.openURL(mailto);
  } catch (error) {
    console.error("openEmail error:", error);
    Alert.alert("Lỗi", "Không thể mở ứng dụng email.");
  }
};

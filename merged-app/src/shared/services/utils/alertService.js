import { Alert } from "react-native";

/**
 * Alert Service - Utility functions for showing alerts
 */

export const showSuccessAlert = (title, message, onPress = null) => {
  Alert.alert(title || "Thành công", message, [{ text: "OK", onPress }]);
};

export const showErrorAlert = (title, message, onPress = null) => {
  Alert.alert(title || "Lỗi", message, [{ text: "OK", onPress }]);
};

export const showConfirmAlert = (
  title,
  message,
  onConfirm,
  onCancel = null
) => {
  Alert.alert(title || "Xác nhận", message, [
    { text: "Hủy", style: "cancel", onPress: onCancel },
    { text: "OK", onPress: onConfirm },
  ]);
};

export const showInfoAlert = (title, message, onPress = null) => {
  Alert.alert(title || "Thông báo", message, [{ text: "OK", onPress }]);
};

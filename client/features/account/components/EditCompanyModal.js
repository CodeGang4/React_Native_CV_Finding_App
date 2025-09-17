import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function EditCompanyModal({
  visible,
  initialInfo,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(initialInfo || {});

  useEffect(() => {
    setForm(initialInfo || {});
  }, [initialInfo, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chỉnh sửa thông tin công ty</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên công ty</Text>
              <TextInput
                style={styles.textInput}
                value={form?.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
                placeholder="Nhập tên công ty"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Địa chỉ</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={form?.address}
                onChangeText={(t) => setForm({ ...form, address: t })}
                placeholder="Nhập địa chỉ công ty"
                multiline
                numberOfLines={3}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Website</Text>
              <TextInput
                style={styles.textInput}
                value={form?.website}
                onChangeText={(t) => setForm({ ...form, website: t })}
                placeholder="Nhập website công ty"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Giới thiệu công ty</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={form?.description}
                onChangeText={(t) => setForm({ ...form, description: t })}
                placeholder="Nhập mô tả về công ty"
                multiline
                numberOfLines={5}
              />
            </View>
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton]}
              onPress={() => onSave?.(form)}
            >
              <Text style={styles.submitButtonText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: width - 40,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  closeButton: { padding: 5 },
  modalBody: { maxHeight: 400, padding: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
  },
  multilineInput: { height: 80, textAlignVertical: "top" },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: { backgroundColor: "#f0f0f0" },
  submitButton: { backgroundColor: "#4CAF50" },
  cancelButtonText: { color: "#666", fontWeight: "600" },
  submitButtonText: { color: "white", fontWeight: "600" },
});

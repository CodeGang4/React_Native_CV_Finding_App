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
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function EditCompanyModal({
  visible,
  initialInfo,
  loading = false,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(initialInfo || {});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initialInfo || {});
    setErrors({});
  }, [initialInfo, visible]);

  const validateForm = () => {
    const newErrors = {};

    if (!form.name?.trim()) {
      newErrors.name = "Tên công ty là bắt buộc";
    }

    if (!form.address?.trim()) {
      newErrors.address = "Địa chỉ là bắt buộc";
    }

    if (!form.website?.trim()) {
      newErrors.website = "Website là bắt buộc";
    } else {
      try {
        new URL(form.website);
      } catch {
        newErrors.website = "Website không hợp lệ";
      }
    }

    if (!form.description?.trim()) {
      newErrors.description = "Mô tả công ty là bắt buộc";
    }

    if (!form.company_size?.trim()) {
      newErrors.company_size = "Quy mô công ty là bắt buộc";
    }

    if (!form.industry?.trim()) {
      newErrors.industry = "Ngành nghề là bắt buộc";
    }

    if (!form.contact_person?.trim()) {
      newErrors.contact_person = "Người liên hệ là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave?.(form);
    }
  };

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
                style={[styles.textInput, errors.name && styles.errorInput]}
                value={form?.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
                placeholder="Nhập tên công ty"
                editable={!loading}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Quy mô công ty</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.company_size && styles.errorInput,
                ]}
                value={form?.company_size}
                onChangeText={(t) => setForm({ ...form, company_size: t })}
                placeholder="Ví dụ: 25-99 nhân viên"
                editable={!loading}
              />
              {errors.company_size && (
                <Text style={styles.errorText}>{errors.company_size}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ngành nghề</Text>
              <TextInput
                style={[styles.textInput, errors.industry && styles.errorInput]}
                value={form?.industry}
                onChangeText={(t) => setForm({ ...form, industry: t })}
                placeholder="Ví dụ: Công nghệ thông tin"
                editable={!loading}
              />
              {errors.industry && (
                <Text style={styles.errorText}>{errors.industry}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Địa chỉ</Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.multilineInput,
                  errors.address && styles.errorInput,
                ]}
                value={form?.address}
                onChangeText={(t) => setForm({ ...form, address: t })}
                placeholder="Nhập địa chỉ công ty"
                multiline
                numberOfLines={3}
                editable={!loading}
              />
              {errors.address && (
                <Text style={styles.errorText}>{errors.address}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Website</Text>
              <TextInput
                style={[styles.textInput, errors.website && styles.errorInput]}
                value={form?.website}
                onChangeText={(t) => setForm({ ...form, website: t })}
                placeholder="https://example.com"
                keyboardType="url"
                autoCapitalize="none"
                editable={!loading}
              />
              {errors.website && (
                <Text style={styles.errorText}>{errors.website}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Người liên hệ</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.contact_person && styles.errorInput,
                ]}
                value={form?.contact_person}
                onChangeText={(t) => setForm({ ...form, contact_person: t })}
                placeholder="Tên hoặc email người liên hệ"
                editable={!loading}
              />
              {errors.contact_person && (
                <Text style={styles.errorText}>{errors.contact_person}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Giới thiệu công ty</Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.multilineInput,
                  errors.description && styles.errorInput,
                ]}
                value={form?.description}
                onChangeText={(t) => setForm({ ...form, description: t })}
                placeholder="Nhập mô tả về công ty, hoạt động kinh doanh..."
                multiline
                numberOfLines={5}
                editable={!loading}
              />
              {errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
            </View>
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.submitButton,
                loading && styles.disabledButton,
              ]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Lưu</Text>
              )}
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
  errorInput: {
    borderColor: "#ff4444",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginTop: 4,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
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
    justifyContent: "center",
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
  },
});

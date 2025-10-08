import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function ManageTemplatesModal({
  visible,
  onClose,
  templates = [],
  onCreate,
  onUpload,
  onDelete,
  loading = false,
  creating = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    content: "",
  });

  const handleCreate = async () => {
    if (!formData.name || !formData.subject || !formData.content) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin mẫu email");
      return;
    }

    const templateData = {
      name: formData.name,
      subject: formData.subject,
      content: formData.content,
      type: "custom",
    };

    if (onCreate) {
      const success = await onCreate(templateData);
      if (success) {
        setFormData({ name: "", subject: "", content: "" });
      }
    }
  };

  const handleUploadMock = async () => {
    Alert.alert("Thông báo", "Tính năng upload file đang được phát triển");
    const templateData = {
      name: "Template từ file",
      subject: "Subject từ file",
      content: "Nội dung từ file...",
      uploadDate: new Date().toLocaleDateString("vi-VN"),
    };
    onUpload && onUpload(t);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Quản lý email mẫu</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={22} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Form tạo mẫu */}
            <Text style={styles.sectionTitle}>Tạo mẫu mới</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên mẫu</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="VD: Mẫu mời phỏng vấn"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tiêu đề</Text>
              <TextInput
                style={styles.input}
                value={formData.subject}
                onChangeText={(text) =>
                  setFormData({ ...formData, subject: text })
                }
                placeholder="VD: Thông báo lịch phỏng vấn - {position}"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nội dung</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={formData.content}
                onChangeText={(text) =>
                  setFormData({ ...formData, content: text })
                }
                placeholder="Nội dung email..."
                multiline
                numberOfLines={4}
              />
            </View>
            <View style={styles.row}>
              <TouchableOpacity
                style={[
                  styles.btn,
                  styles.btnPrimary,
                  creating && styles.btnDisabled,
                ]}
                onPress={handleCreate}
                disabled={creating}
              >
                {creating ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color="#fff"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.btnPrimaryText}>Đang tạo...</Text>
                  </>
                ) : (
                  <Text style={styles.btnPrimaryText}>Tạo mẫu</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={handleUploadMock}
              >
                <Text style={styles.btnSecondaryText}>Upload file</Text>
              </TouchableOpacity>
            </View>

            {/* Danh sách mẫu */}
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
              Danh sách mẫu
            </Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Đang tải mẫu email...</Text>
              </View>
            ) : (
              templates.map((tpl) => (
                <View key={tpl.id} style={styles.templateCard}>
                  <View style={styles.templateHeader}>
                    <MaterialIcons name="email" size={22} color="#4CAF50" />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.templateName}>{tpl.name}</Text>
                      <Text style={styles.templateSubject} numberOfLines={1}>
                        {tpl.subject}
                      </Text>
                      <Text style={styles.templateDate}>
                        Tạo: {tpl.uploadDate}
                      </Text>
                    </View>
                    {tpl.type !== "default" && onDelete && (
                      <TouchableOpacity
                        onPress={() => onDelete(tpl.id)}
                        style={styles.deleteButton}
                      >
                        <MaterialIcons
                          name="delete"
                          size={20}
                          color="#F44336"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.templateContent} numberOfLines={3}>
                    {tpl.content}
                  </Text>
                </View>
              ))
            )}
            {!loading && templates.length === 0 && (
              <Text style={styles.emptyText}>Chưa có mẫu email nào</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    width: width - 32,
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: { fontSize: 16, fontWeight: "700", color: "#333" },
  body: { padding: 16 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 12, color: "#555", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  textarea: { height: 90, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 10 },
  btn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
  },
  btnPrimary: { backgroundColor: "#00b14f" },
  btnSecondary: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  btnPrimaryText: { color: "#fff", fontWeight: "600" },
  btnSecondaryText: { color: "#00b14f", fontWeight: "600" },
  templateCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    marginBottom: 12,
  },
  templateHeader: { flexDirection: "row", alignItems: "center" },
  templateName: { fontSize: 14, fontWeight: "700", color: "#333" },
  templateSubject: { fontSize: 12, color: "#666", marginTop: 2 },
  templateDate: { fontSize: 11, color: "#999", marginTop: 2 },
  templateContent: { fontSize: 12, color: "#555", marginTop: 8 },
  deleteButton: {
    padding: 8,
    borderRadius: 4,
  },
  btnDisabled: {
    backgroundColor: "#cccccc",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
});

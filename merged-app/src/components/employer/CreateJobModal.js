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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function CreateJobModal({ visible, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: "",
    salary: "",
    location: "",
    experience: "",
    deadline: "",
    jobType: "",
    description: "",
    requirements: "",
    benefits: "",
    skills: "",
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.salary || !formData.location) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const jobData = {
      ...formData,
      requirements: formData.requirements.split("\n").filter((x) => x.trim()),
      benefits: formData.benefits.split("\n").filter((x) => x.trim()),
      skills: formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    onSubmit && onSubmit(jobData);
    setFormData({
      title: "",
      salary: "",
      location: "",
      experience: "",
      deadline: "",
      jobType: "",
      description: "",
      requirements: "",
      benefits: "",
      skills: "",
    });
    onClose && onClose();
  };

  const handleClose = () => {
    setFormData({
      title: "",
      salary: "",
      location: "",
      experience: "",
      deadline: "",
      jobType: "",
      description: "",
      requirements: "",
      benefits: "",
      skills: "",
    });
    onClose && onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Đăng tin tuyển dụng mới</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Tên vị trí */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên vị trí *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
                }
                placeholder="VD: Senior React Native Developer"
              />
            </View>

            {/* Lương & Địa điểm */}
            <View style={styles.formRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Mức lương *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.salary}
                  onChangeText={(text) =>
                    setFormData({ ...formData, salary: text })
                  }
                  placeholder="VD: 15-25 triệu"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>Địa điểm *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.location}
                  onChangeText={(text) =>
                    setFormData({ ...formData, location: text })
                  }
                  placeholder="VD: Hà Nội"
                />
              </View>
            </View>

            {/* Kinh nghiệm & Hạn nộp */}
            <View style={styles.formRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Kinh nghiệm</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.experience}
                  onChangeText={(text) =>
                    setFormData({ ...formData, experience: text })
                  }
                  placeholder="VD: 2-3 năm"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>Hạn nộp</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.deadline}
                  onChangeText={(text) =>
                    setFormData({ ...formData, deadline: text })
                  }
                  placeholder="VD: 30/09/2025"
                />
              </View>
            </View>

            {/* Loại hình công việc */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Loại hình công việc</Text>
              <TextInput
                style={styles.textInput}
                value={formData.jobType}
                onChangeText={(text) =>
                  setFormData({ ...formData, jobType: text })
                }
                placeholder="VD: Toàn thời gian"
              />
            </View>

            {/* Mô tả */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mô tả công việc</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="Mô tả chi tiết về công việc..."
                multiline
                numberOfLines={5}
              />
            </View>

            {/* Yêu cầu */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Yêu cầu công việc</Text>
              <Text style={styles.inputNote}>Mỗi yêu cầu trên một dòng</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={formData.requirements}
                onChangeText={(text) =>
                  setFormData({ ...formData, requirements: text })
                }
                placeholder={`Có ít nhất 2 năm kinh nghiệm với React Native\nThành thạo JavaScript, TypeScript\nKinh nghiệm với Redux, Context API`}
                multiline
                numberOfLines={5}
              />
            </View>

            {/* Quyền lợi */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Quyền lợi</Text>
              <Text style={styles.inputNote}>Mỗi quyền lợi trên một dòng</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={formData.benefits}
                onChangeText={(text) =>
                  setFormData({ ...formData, benefits: text })
                }
                placeholder={`Mức lương cạnh tranh\nThưởng hiệu suất hàng quý\nBảo hiểm đầy đủ theo quy định`}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Kỹ năng */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kỹ năng yêu cầu</Text>
              <Text style={styles.inputNote}>Phân tách bằng dấu phẩy</Text>
              <TextInput
                style={styles.textInput}
                value={formData.skills}
                onChangeText={(text) =>
                  setFormData({ ...formData, skills: text })
                }
                placeholder="React Native, JavaScript, TypeScript, Redux"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Đăng tin</Text>
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
    width: width - 32,
    maxHeight: "90%",
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
  modalBody: { maxHeight: 500, padding: 20 },
  inputGroup: { marginBottom: 20 },
  formRow: { flexDirection: "row", marginBottom: 0 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputNote: { fontSize: 12, color: "#666", marginBottom: 8 },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
  },
  multilineInput: { height: 100, textAlignVertical: "top" },
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
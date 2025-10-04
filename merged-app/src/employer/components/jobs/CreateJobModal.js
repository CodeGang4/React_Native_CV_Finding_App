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

export default function CreateJobModal({
  visible,
  onClose,
  onSubmit,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    title: "",
    position: "",
    salary: "",
    location: "",
    education: "",
    deadline: "",
    jobType: "Toàn thời gian",
    description: "",
    requirements: "",
    benefits: "",
    skills: "",
    quantity: "1",
  });

  const handleSubmit = () => {
    // Validation - Check required fields theo backend API
    const requiredFields = [
      { field: "title", label: "Tiêu đề công việc" },
      { field: "position", label: "Vị trí ứng tuyển" },
      { field: "salary", label: "Mức lương" },
      { field: "location", label: "Địa điểm làm việc" },
      { field: "description", label: "Mô tả công việc" },
      { field: "requirements", label: "Yêu cầu công việc" },
      { field: "education", label: "Trình độ học vấn" },
      { field: "deadline", label: "Hạn nộp hồ sơ" },
      { field: "quantity", label: "Số lượng tuyển dụng" },
    ];

    const missingFields = requiredFields.filter(
      ({ field }) => !formData[field] || formData[field].trim() === ""
    );

    if (missingFields.length > 0) {
      const missingLabels = missingFields.map(({ label }) => label).join(", ");
      Alert.alert("Lỗi", `Vui lòng điền đầy đủ thông tin: ${missingLabels}`);
      return;
    }

    // Validate deadline format (dd/mm/yyyy)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(formData.deadline)) {
      Alert.alert(
        "Lỗi",
        "Hạn nộp hồ sơ phải có định dạng dd/mm/yyyy (ví dụ: 31/12/2024)"
      );
      return;
    }

    // Format data cho API backend theo đúng cấu trúc required
    try {
      // Parse deadline từ dd/mm/yyyy sang ISO string
      const [day, month, year] = formData.deadline.split("/");
      const expiryDate = new Date(year, month - 1, day);

      if (expiryDate < new Date()) {
        Alert.alert("Lỗi", "Hạn nộp hồ sơ phải là ngày trong tương lai");
        return;
      }

      const jobData = {
        title: formData.title.trim(),
        position: formData.position.trim(),
        salary: formData.salary.trim(),
        location: formData.location.trim(),
        education: formData.education.trim(),
        jobType: formData.jobType, // Sử dụng jobType thay vì job_type để phù hợp với validation
        description: formData.description.trim(),
        requirements: formData.requirements.trim(),
        quantity: parseInt(formData.quantity) || 1,
        deadline: expiryDate.toISOString(), // Sử dụng deadline thay vì exprired_date
        isAccepted: true, // Mặc định được chấp nhận
      };

      onSubmit && onSubmit(jobData);

      // Reset form
      setFormData({
        title: "",
        position: "",
        salary: "",
        location: "",
        education: "",
        deadline: "",
        jobType: "Toàn thời gian",
        description: "",
        requirements: "",
        benefits: "",
        skills: "",
        quantity: "1",
      });
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi xử lý dữ liệu. Vui lòng thử lại.");
      console.error("Form data processing error:", error);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      position: "",
      salary: "",
      location: "",
      education: "",
      deadline: "",
      jobType: "Toàn thời gian",
      description: "",
      requirements: "",
      benefits: "",
      skills: "",
      quantity: "1",
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
            {/* Tiêu đề công việc */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tiêu đề công việc *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
                }
                placeholder="VD: Tuyển dụng Senior React Native Developer"
              />
            </View>

            {/* Vị trí ứng tuyển */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Vị trí ứng tuyển *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.position}
                onChangeText={(text) =>
                  setFormData({ ...formData, position: text })
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

            {/* Trình độ học vấn & Hạn nộp */}
            <View style={styles.formRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Trình độ học vấn *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.education}
                  onChangeText={(text) =>
                    setFormData({ ...formData, education: text })
                  }
                  placeholder="VD: Đại học"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>Hạn nộp *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.deadline}
                  onChangeText={(text) =>
                    setFormData({ ...formData, deadline: text })
                  }
                  placeholder="VD: 30/12/2024"
                />
              </View>
            </View>

            {/* Loại hình công việc & Số lượng */}
            <View style={styles.formRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Loại hình công việc *</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => {
                      Alert.alert("Chọn loại hình công việc", "", [
                        {
                          text: "Toàn thời gian",
                          onPress: () =>
                            setFormData({
                              ...formData,
                              jobType: "Toàn thời gian",
                            }),
                        },
                        {
                          text: "Bán thời gian",
                          onPress: () =>
                            setFormData({
                              ...formData,
                              jobType: "Bán thời gian",
                            }),
                        },
                        {
                          text: "Thực tập",
                          onPress: () =>
                            setFormData({ ...formData, jobType: "Thực tập" }),
                        },
                        {
                          text: "Freelance",
                          onPress: () =>
                            setFormData({ ...formData, jobType: "Freelance" }),
                        },
                        { text: "Hủy", style: "cancel" },
                      ]);
                    }}
                  >
                    <Text style={styles.pickerText}>
                      {formData.jobType || "Chọn loại hình"}
                    </Text>
                    <MaterialIcons
                      name="arrow-drop-down"
                      size={24}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>Số lượng tuyển *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.quantity}
                  onChangeText={(text) =>
                    setFormData({ ...formData, quantity: text })
                  }
                  placeholder="VD: 2"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Mô tả */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mô tả công việc *</Text>
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
              <Text style={styles.inputLabel}>Yêu cầu công việc *</Text>
              <Text style={styles.inputNote}>Mô tả chi tiết yêu cầu</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={formData.requirements}
                onChangeText={(text) =>
                  setFormData({ ...formData, requirements: text })
                }
                placeholder="Có ít nhất 2 năm kinh nghiệm với React Native. Thành thạo JavaScript, TypeScript. Kinh nghiệm với Redux, Context API..."
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
              style={[
                styles.modalButton,
                styles.submitButton,
                loading && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={[styles.submitButtonText, { marginLeft: 8 }]}>
                    Đang đăng...
                  </Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Đăng tin</Text>
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerText: {
    fontSize: 14,
    color: "#333",
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
  },
  cancelButton: { backgroundColor: "#f0f0f0" },
  submitButton: { backgroundColor: "#4CAF50" },
  disabledButton: { backgroundColor: "#cccccc" },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: { color: "#666", fontWeight: "600" },
  submitButtonText: { color: "white", fontWeight: "600" },
});

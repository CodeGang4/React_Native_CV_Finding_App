import React, { useEffect, useState } from "react";
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

export default function EditJobModal({
  visible,
  onClose,
  job,
  onSubmit,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    id: undefined,
    title: "",
    position: "",
    salary: "",
    location: "",
    education: "",
    deadline: "",
    jobType: "Toàn thời gian",
    description: "",
    requirements: "",
    quantity: "1",
  });

  useEffect(() => {
    if (job && visible) {
      // Debug: Log job data để kiểm tra cấu trúc
      console.log("EditJobModal - Job data:", job);
      console.log("EditJobModal - Deadline fields:", {
        deadline: job.deadline,
        expired_date: job.expired_date,
        exprired_date: job.exprired_date,
      });

      // Format deadline từ ISO string về dd/mm/yyyy
      const formatDeadline = (dateString) => {
        if (!dateString) return "";
        console.log("Formatting date string:", dateString);
        try {
          const date = new Date(dateString);
          console.log("Parsed date object:", date);
          console.log("Date is valid:", !isNaN(date.getTime()));

          if (isNaN(date.getTime())) return ""; // Check if date is invalid

          const day = date.getDate().toString().padStart(2, "0");
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const year = date.getFullYear();
          const formatted = `${day}/${month}/${year}`;
          console.log("Formatted date:", formatted);
          return formatted;
        } catch (error) {
          console.error("Date formatting error:", error);
          return "";
        }
      };

      setFormData({
        id: job.id,
        title: job.title || "",
        position: job.position || job.title || "",
        salary: job.salary || "",
        location: job.location || "",
        education: job.education || "",
        deadline: formatDeadline(
          job.deadline || job.expired_date || job.exprired_date
        ),
        jobType: job.jobType || "Toàn thời gian",
        description: job.description || "",
        requirements: Array.isArray(job.requirements)
          ? job.requirements.join("\n")
          : job.requirements || "",
        quantity: job.quantity?.toString() || "1",
      });
    }
  }, [job, visible]);

  const handleSave = () => {
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

    try {
      // Parse deadline từ dd/mm/yyyy sang ISO string
      const [day, month, year] = formData.deadline.split("/");
      const expiryDate = new Date(year, month - 1, day);

      if (expiryDate < new Date()) {
        Alert.alert("Lỗi", "Hạn nộp hồ sơ phải là ngày trong tương lai");
        return;
      }

      // Format data cho API backend theo đúng cấu trúc
      const jobData = {
        id: formData.id,
        title: formData.title.trim(),
        position: formData.position.trim(),
        salary: formData.salary.trim(),
        location: formData.location.trim(),
        education: formData.education.trim(),
        jobType: formData.jobType,
        description: formData.description.trim(),
        requirements: formData.requirements.trim(),
        quantity: parseInt(formData.quantity) || 1,
        deadline: expiryDate.toISOString(),
        isAccepted: job.isAccepted !== false, // Giữ nguyên trạng thái hiện tại
      };

      onSubmit && onSubmit(jobData);
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi xử lý dữ liệu. Vui lòng thử lại.");
      console.error("Form data processing error:", error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Chỉnh sửa tin tuyển dụng</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Tiêu đề công việc */}
            <View style={styles.group}>
              <Text style={styles.label}>Tiêu đề công việc *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
                }
                placeholder="VD: Tuyển dụng Senior React Native Developer"
              />
            </View>

            {/* Vị trí ứng tuyển */}
            <View style={styles.group}>
              <Text style={styles.label}>Vị trí ứng tuyển *</Text>
              <TextInput
                style={styles.input}
                value={formData.position}
                onChangeText={(text) =>
                  setFormData({ ...formData, position: text })
                }
                placeholder="VD: Senior React Native Developer"
              />
            </View>

            {/* Lương & Địa điểm */}
            <View style={styles.row}>
              <View style={[styles.group, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Mức lương *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.salary}
                  onChangeText={(text) =>
                    setFormData({ ...formData, salary: text })
                  }
                  placeholder="VD: 20-30 triệu"
                />
              </View>
              <View style={[styles.group, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Địa điểm *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.location}
                  onChangeText={(text) =>
                    setFormData({ ...formData, location: text })
                  }
                  placeholder="VD: TP.HCM"
                />
              </View>
            </View>

            {/* Trình độ học vấn & Hạn nộp */}
            <View style={styles.row}>
              <View style={[styles.group, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Trình độ học vấn *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.education}
                  onChangeText={(text) =>
                    setFormData({ ...formData, education: text })
                  }
                  placeholder="VD: Đại học"
                />
              </View>
              <View style={[styles.group, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Hạn nộp *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.deadline}
                  onChangeText={(text) =>
                    setFormData({ ...formData, deadline: text })
                  }
                  placeholder="VD: 30/12/2024"
                />
              </View>
            </View>

            {/* Loại hình công việc & Số lượng */}
            <View style={styles.row}>
              <View style={[styles.group, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Loại hình công việc *</Text>
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
              <View style={[styles.group, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Số lượng tuyển *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.quantity}
                  onChangeText={(text) =>
                    setFormData({ ...formData, quantity: text })
                  }
                  placeholder="VD: 2"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Mô tả công việc */}
            <View style={styles.group}>
              <Text style={styles.label}>Mô tả công việc *</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="Mô tả chi tiết về công việc..."
                multiline
                numberOfLines={5}
              />
            </View>

            {/* Yêu cầu công việc */}
            <View style={styles.group}>
              <Text style={styles.label}>Yêu cầu công việc *</Text>
              <Text style={styles.note}>Mô tả chi tiết yêu cầu</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={formData.requirements}
                onChangeText={(text) =>
                  setFormData({ ...formData, requirements: text })
                }
                placeholder="Có ít nhất 2 năm kinh nghiệm với React Native. Thành thạo JavaScript, TypeScript..."
                multiline
                numberOfLines={5}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.btnSecondaryText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btn,
                styles.btnPrimary,
                loading && styles.disabledButton,
              ]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={[styles.btnPrimaryText, { marginLeft: 8 }]}>
                    Đang lưu...
                  </Text>
                </View>
              ) : (
                <Text style={styles.btnPrimaryText}>Lưu thay đổi</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
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
  body: { padding: 16, maxHeight: 500 },
  group: { marginBottom: 14 },
  label: { fontSize: 13, color: "#333", marginBottom: 6, fontWeight: "600" },
  note: { fontSize: 11, color: "#777", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  textarea: { height: 100, textAlignVertical: "top" },
  row: { flexDirection: "row" },
  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 10,
  },
  btn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 8 },
  btnPrimary: { backgroundColor: "#00b14f" },
  btnSecondary: { backgroundColor: "#f0f0f0" },
  btnPrimaryText: { color: "#fff", fontWeight: "700" },
  btnSecondaryText: { color: "#555", fontWeight: "700" },
  disabledButton: { backgroundColor: "#cccccc" },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  multilineInput: { height: 100, textAlignVertical: "top" },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pickerText: {
    fontSize: 14,
    color: "#333",
  },
});

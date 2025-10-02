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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function EditJobModal({ visible, onClose, job, onSubmit }) {
  const [formData, setFormData] = useState({
    id: undefined,
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

  useEffect(() => {
    if (job && visible) {
      setFormData({
        id: job.id,
        title: job.title || "",
        salary: job.salary || "",
        location: job.location || "",
        experience: job.experience || "",
        deadline: job.deadline || "",
        jobType: job.jobType || "",
        description: job.description || "",
        requirements: Array.isArray(job.requirements)
          ? job.requirements.join("\n")
          : job.requirements || "",
        benefits: Array.isArray(job.benefits)
          ? job.benefits.join("\n")
          : job.benefits || "",
        skills: Array.isArray(job.skills)
          ? job.skills.join(", ")
          : job.skills || "",
      });
    }
  }, [job, visible]);

  const handleSave = () => {
    if (!formData.title || !formData.salary || !formData.location) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    const updated = {
      ...job,
      ...formData,
      requirements: formData.requirements.split("\n").filter((x) => x.trim()),
      benefits: formData.benefits.split("\n").filter((x) => x.trim()),
      skills: formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    onSubmit && onSubmit(updated);
    onClose && onClose();
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
            {/* Tên vị trí */}
            <View style={styles.group}>
              <Text style={styles.label}>Tên vị trí *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
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

            {/* Kinh nghiệm & Hạn nộp */}
            <View style={styles.row}>
              <View style={[styles.group, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Kinh nghiệm</Text>
                <TextInput
                  style={styles.input}
                  value={formData.experience}
                  onChangeText={(text) =>
                    setFormData({ ...formData, experience: text })
                  }
                  placeholder="VD: 2-3 năm"
                />
              </View>
              <View style={[styles.group, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Hạn nộp</Text>
                <TextInput
                  style={styles.input}
                  value={formData.deadline}
                  onChangeText={(text) =>
                    setFormData({ ...formData, deadline: text })
                  }
                  placeholder="VD: 30/09/2025"
                />
              </View>
            </View>

            {/* Loại hình công việc */}
            <View style={styles.group}>
              <Text style={styles.label}>Loại hình công việc</Text>
              <TextInput
                style={styles.input}
                value={formData.jobType}
                onChangeText={(text) =>
                  setFormData({ ...formData, jobType: text })
                }
                placeholder="VD: Toàn thời gian"
              />
            </View>

            {/* Mô tả */}
            <View style={styles.group}>
              <Text style={styles.label}>Mô tả công việc</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
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
            <View style={styles.group}>
              <Text style={styles.label}>Yêu cầu công việc</Text>
              <Text style={styles.note}>Mỗi yêu cầu trên một dòng</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
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
            <View style={styles.group}>
              <Text style={styles.label}>Quyền lợi</Text>
              <Text style={styles.note}>Mỗi quyền lợi trên một dòng</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
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
            <View className="group" style={styles.group}>
              <Text style={styles.label}>Kỹ năng yêu cầu</Text>
              <Text style={styles.note}>Phân tách bằng dấu phẩy</Text>
              <TextInput
                style={styles.input}
                value={formData.skills}
                onChangeText={(text) =>
                  setFormData({ ...formData, skills: text })
                }
                placeholder="React Native, JavaScript, TypeScript, Redux"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={onClose}
            >
              <Text style={styles.btnSecondaryText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={handleSave}
            >
              <Text style={styles.btnPrimaryText}>Lưu</Text>
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
});

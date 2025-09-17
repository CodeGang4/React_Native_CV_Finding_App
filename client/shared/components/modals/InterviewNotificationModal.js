import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const InterviewNotificationModal = ({ visible, onClose, applicantName }) => {
  const [selectedTemplate, setSelectedTemplate] = useState("formal");
  const [customMessage, setCustomMessage] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewLocation, setInterviewLocation] = useState("");

  const templates = {
    formal: {
      title: "Thư mời phỏng vấn chính thức",
      content: `Kính gửi ${applicantName},

Công ty chúng tôi đã xem xét hồ sơ của bạn và rất ấn tượng với kinh nghiệm cũng như kỹ năng của bạn.

Chúng tôi xin trân trọng mời bạn tham gia buổi phỏng vấn cho vị trí đã ứng tuyển.

Thông tin chi tiết:
- Thời gian: [Ngày giờ phỏng vấn]
- Địa điểm: [Địa chỉ phỏng vấn]
- Người liên hệ: HR Department

Vui lòng xác nhận tham gia và chuẩn bị các giấy tờ cần thiết.

Trân trọng,
TCC & Partners`,
    },
    friendly: {
      title: "Lời mời phỏng vấn thân thiện",
      content: `Chào ${applicantName}!

Chúng mình đã xem CV của bạn và thấy rất phù hợp với vị trí team đang tuyển dụng.

Bạn có thể sắp xếp thời gian để chat cùng team về công việc không?

Chi tiết buổi phỏng vấn:
- Thời gian: [Ngày giờ phỏng vấn]  
- Hình thức: [Online/Offline]
- Thời lượng: Khoảng 45-60 phút

Nếu có thắc mắc gì, bạn cứ liên hệ trực tiếp nhé!

Best regards,
TCC & Partners Team`,
    },
    online: {
      title: "Mời phỏng vấn trực tuyến",
      content: `Xin chào ${applicantName},

Cảm ơn bạn đã quan tâm đến vị trí tại công ty chúng tôi.

Chúng tôi muốn mời bạn tham gia buổi phỏng vấn trực tuyến:

📅 Thời gian: [Ngày giờ phỏng vấn]
💻 Nền tảng: Google Meet/Zoom
⏰ Thời lượng: 30-45 phút
📋 Nội dung: Trao đổi về kinh nghiệm và kỹ năng

Link meeting sẽ được gửi trước buổi phỏng vấn 15 phút.

Mong nhận được phản hồi từ bạn!

TCC & Partners`,
    },
  };

  const handleSend = () => {
    if (!interviewDate || !interviewTime) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thời gian phỏng vấn");
      return;
    }

    Alert.alert("Thành công!", "Đã gửi thông báo phỏng vấn đến ứng viên", [
      {
        text: "OK",
        onPress: () => {
          onClose();
          setInterviewDate("");
          setInterviewTime("");
          setInterviewLocation("");
          setCustomMessage("");
          setSelectedTemplate("formal");
        },
      },
    ]);
  };

  const renderTemplate = () => {
    const template = templates[selectedTemplate];
    let content = template.content;

    if (interviewDate && interviewTime) {
      content = content.replace(
        "[Ngày giờ phỏng vấn]",
        `${interviewDate} lúc ${interviewTime}`
      );
    }

    if (interviewLocation) {
      content = content.replace("[Địa chỉ phỏng vấn]", interviewLocation);
      content = content.replace("[Online/Offline]", "Tại văn phòng");
    } else {
      content = content.replace("[Online/Offline]", "Phỏng vấn trực tuyến");
    }

    return content;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Hủy</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Gửi thông báo phỏng vấn</Text>
          <TouchableOpacity onPress={handleSend}>
            <Text style={styles.sendButton}>Gửi</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Người nhận</Text>
            <View style={styles.recipientContainer}>
              <MaterialIcons name="person" size={20} color="#666" />
              <Text style={styles.recipientName}>{applicantName}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin phỏng vấn</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ngày phỏng vấn *</Text>
              <TextInput
                style={styles.textInput}
                value={interviewDate}
                onChangeText={setInterviewDate}
                placeholder="VD: 20/12/2024"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Giờ phỏng vấn *</Text>
              <TextInput
                style={styles.textInput}
                value={interviewTime}
                onChangeText={setInterviewTime}
                placeholder="VD: 14:00"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Địa điểm (tùy chọn)</Text>
              <TextInput
                style={styles.textInput}
                value={interviewLocation}
                onChangeText={setInterviewLocation}
                placeholder="Địa chỉ văn phòng hoặc để trống nếu online"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mẫu email</Text>
            <View style={styles.templateButtons}>
              <TouchableOpacity
                style={[
                  styles.templateButton,
                  selectedTemplate === "formal" && styles.activeTemplateButton,
                ]}
                onPress={() => setSelectedTemplate("formal")}
              >
                <Text
                  style={[
                    styles.templateButtonText,
                    selectedTemplate === "formal" &&
                      styles.activeTemplateButtonText,
                  ]}
                >
                  Chính thức
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.templateButton,
                  selectedTemplate === "friendly" &&
                    styles.activeTemplateButton,
                ]}
                onPress={() => setSelectedTemplate("friendly")}
              >
                <Text
                  style={[
                    styles.templateButtonText,
                    selectedTemplate === "friendly" &&
                      styles.activeTemplateButtonText,
                  ]}
                >
                  Thân thiện
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.templateButton,
                  selectedTemplate === "online" && styles.activeTemplateButton,
                ]}
                onPress={() => setSelectedTemplate("online")}
              >
                <Text
                  style={[
                    styles.templateButtonText,
                    selectedTemplate === "online" &&
                      styles.activeTemplateButtonText,
                  ]}
                >
                  Trực tuyến
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nội dung email</Text>
            <View style={styles.emailPreview}>
              <Text style={styles.emailSubject}>
                {templates[selectedTemplate].title}
              </Text>
              <Text style={styles.emailContent}>{renderTemplate()}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ghi chú thêm (tùy chọn)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={customMessage}
              onChangeText={setCustomMessage}
              placeholder="Thêm ghi chú hoặc yêu cầu đặc biệt..."
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingTop: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cancelButton: {
    fontSize: 16,
    color: "#666",
  },
  sendButton: {
    fontSize: 16,
    color: "#00b14f",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  recipientContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 8,
  },
  recipientName: {
    fontSize: 16,
    color: "#333",
    marginLeft: 8,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
    fontWeight: "500",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "white",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  templateButtons: {
    flexDirection: "row",
    marginBottom: 16,
  },
  templateButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 6,
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "white",
  },
  activeTemplateButton: {
    backgroundColor: "#00b14f",
    borderColor: "#00b14f",
  },
  templateButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTemplateButtonText: {
    color: "white",
  },
  emailPreview: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  emailSubject: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 8,
  },
  emailContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});

export default InterviewNotificationModal;

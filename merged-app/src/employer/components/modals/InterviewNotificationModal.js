import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../../shared/contexts/AuthContext";
import EmailApiService from "../../../shared/services/api/EmailApiService";
import { supabase } from "../../../../supabase/config";

const InterviewNotificationModal = ({ visible, onClose, candidate }) => {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState("formal");
  const [customMessage, setCustomMessage] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewLocation, setInterviewLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingEmail, setFetchingEmail] = useState(false);
  const [candidateEmail, setCandidateEmail] = useState("");

  // Extract candidate info
  const applicantName = candidate?.name || candidate?.full_name || "Ứng viên";

  // Extract user ID from various possible fields
  // Priority: userId (from candidates table) > id (from applications) > user_id
  const candidateUserId =
    candidate?.userId || // From Candidate entity (candidates.user_id)
    candidate?.user_id || // Direct from backend
    candidate?.id || // From applications data
    candidate?.candidate_id; // Fallback

  // Fetch email from users table when candidate changes
  useEffect(() => {
    const fetchEmail = async () => {
      if (!visible || !candidateUserId) {
        setCandidateEmail("");
        return;
      }

      // Check if email already exists in candidate object (and not "N/A")
      const existingEmail = candidate?.email;
      if (
        existingEmail &&
        existingEmail !== "N/A" &&
        existingEmail.includes("@")
      ) {
        console.log(
          "[InterviewModal] Using email from candidate object:",
          existingEmail
        );
        setCandidateEmail(existingEmail);
        return;
      }

      // Fetch from users table using candidate ID
      setFetchingEmail(true);
      try {
        console.log(
          "[InterviewModal] Fetching email for user_id:",
          candidateUserId
        );
        console.log("[InterviewModal] Candidate object:", {
          id: candidate?.id,
          user_id: candidate?.user_id,
          candidate_id: candidate?.candidate_id,
          email: candidate?.email,
        });

        const { data, error } = await supabase
          .from("users")
          .select("email")
          .eq("id", candidateUserId)
          .single();

        if (error) {
          console.error("[InterviewModal] Fetch email error:", error);
          throw error;
        }

        if (data?.email) {
          console.log(
            "[InterviewModal] Email fetched successfully:",
            data.email
          );
          setCandidateEmail(data.email);
        } else {
          console.warn("[InterviewModal] No email found for user");
          setCandidateEmail("");
        }
      } catch (error) {
        console.error("[InterviewModal] Failed to fetch email:", error);
        setCandidateEmail("");
      } finally {
        setFetchingEmail(false);
      }
    };

    fetchEmail();
  }, [visible, candidate, candidateUserId]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setInterviewDate("");
      setInterviewTime("");
      setInterviewLocation("");
      setCustomMessage("");
      setSelectedTemplate("formal");
      setCandidateEmail("");
    }
  }, [visible]);

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
 Nội dung: Trao đổi về kinh nghiệm và kỹ năng

Link meeting sẽ được gửi trước buổi phỏng vấn 15 phút.

Mong nhận được phản hồi từ bạn!

TCC & Partners`,
    },
  };

  const handleSend = async () => {
    // Validation
    if (!interviewDate || !interviewTime) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thời gian phỏng vấn");
      return;
    }

    if (!candidateEmail) {
      Alert.alert(
        "Lỗi",
        "Không tìm thấy email của ứng viên. Vui lòng thử lại sau."
      );
      return;
    }

    if (!user || !user.id) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin công ty");
      return;
    }

    setLoading(true);

    try {
      // Prepare email data
      const emailData = {
        email: candidateEmail, // Email fetched from users table
        email_type: selectedTemplate, // 'formal', 'friendly', or 'online'
        email_date_time: `${interviewDate} - ${interviewTime}`,
        email_location: interviewLocation || "Phỏng vấn trực tuyến",
        email_duration: "60 phút", // Default duration
      };

      console.log("[InterviewNotificationModal] Sending email:", {
        ...emailData,
        recipient: applicantName,
      });

      // Call API
      const response = await EmailApiService.sendInterviewInvitation(
        user.id,
        emailData
      );

      console.log("[InterviewNotificationModal] Email sent:", response);

      // Success
      Alert.alert(
        "Thành công!",
        `Đã gửi thông báo phỏng vấn đến ${applicantName}`,
        [
          {
            text: "OK",
            onPress: () => {
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error("[InterviewNotificationModal] Send email error:", error);

      // Error handling
      let errorMessage = "Không thể gửi email. Vui lòng thử lại sau.";

      if (error.response) {
        // Backend returned error
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
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
          <TouchableOpacity onPress={onClose} disabled={loading}>
            <Text style={[styles.cancelButton, loading && { opacity: 0.5 }]}>
              Hủy
            </Text>
          </TouchableOpacity>
          <Text style={styles.title}>Gửi thông báo phỏng vấn</Text>
          <TouchableOpacity onPress={handleSend} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#00b14f" />
            ) : (
              <Text style={styles.sendButton}>Gửi</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Người nhận</Text>
            <View style={styles.recipientContainer}>
              <MaterialIcons name="person" size={20} color="#666" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.recipientName}>{applicantName}</Text>
                {fetchingEmail ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 4,
                    }}
                  >
                    <ActivityIndicator size="small" color="#999" />
                    <Text style={styles.emailText}> Đang tải email...</Text>
                  </View>
                ) : candidateEmail ? (
                  <Text style={styles.emailText}>{candidateEmail}</Text>
                ) : (
                  <Text style={[styles.emailText, { color: "#F44336" }]}>
                     Không tìm thấy email
                  </Text>
                )}
              </View>
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
    fontWeight: "500",
  },
  emailText: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
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

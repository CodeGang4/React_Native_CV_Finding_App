// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   Modal,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Alert,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { MaterialIcons } from "@expo/vector-icons";

// export default function InterviewNotificationModal({
//   visible,
//   onClose,
//   applicantName = "Ứng viên",
//   jobTitle = "Vị trí ứng tuyển",
// }) {
//   const [emailData, setEmailData] = useState({
//     subject: `Thông báo phỏng vấn - ${jobTitle}`,
//     content: `Chào ${applicantName},

// Cảm ơn bạn đã ứng tuyển vào vị trí ${jobTitle} tại công ty chúng tôi.

// Chúng tôi rất vui mừng thông báo rằng hồ sơ của bạn đã được lựa chọn để tham gia vòng phỏng vấn.

// THÔNG TIN PHỎNG VẤN:
// 📅 Ngày: [Ngày phỏng vấn]
// 🕐 Giờ: [Giờ phỏng vấn]
// 📍 Địa điểm: [Địa chỉ công ty hoặc link phỏng vấn online]
// 👥 Hình thức: [Trực tiếp/Online]

// CHUẨN BỊ:
// - Mang theo CV và các giấy tờ liên quan
// - Chuẩn bị các câu hỏi về công ty và vị trí ứng tuyển
// - Dress code: Smart casual

// Vui lòng xác nhận tham gia phỏng vấn bằng cách reply email này trước [ngày].

// Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ:
// 📧 Email: hr@company.com
// 📞 Hotline: 0123-456-789

// Chúc bạn may mắn!

// Trân trọng,
// Phòng Nhân sự
// [Tên công ty]`,
//     interviewDate: "",
//     interviewTime: "",
//     interviewLocation: "",
//     interviewType: "Trực tiếp",
//     confirmDeadline: "",
//   });

//   const emailTemplates = [
//     {
//       id: 1,
//       name: "Mẫu phỏng vấn trực tiếp",
//       subject: "Thông báo phỏng vấn - {jobTitle}",
//       content: `Chào {applicantName},

// Cảm ơn bạn đã ứng tuyển vào vị trí {jobTitle} tại công ty chúng tôi.

// Chúng tôi rất vui mừng thông báo rằng hồ sơ của bạn đã được lựa chọn để tham gia vòng phỏng vấn trực tiếp.

// THÔNG TIN PHỎNG VẤN:
// 📅 Ngày: {interviewDate}
// 🕐 Giờ: {interviewTime}
// 📍 Địa điểm: {interviewLocation}
// 👥 Hình thức: Phỏng vấn trực tiếp

// Vui lòng xác nhận tham gia phỏng vấn trước {confirmDeadline}.

// Trân trọng,
// Phòng Nhân sự`,
//     },
//     {
//       id: 2,
//       name: "Mẫu phỏng vấn online",
//       subject: "Thông báo phỏng vấn Online - {jobTitle}",
//       content: `Chào {applicantName},

// Chúng tôi sẽ tiến hành phỏng vấn online cho vị trí {jobTitle}.

// THÔNG TIN PHỎNG VẤN:
// 📅 Ngày: {interviewDate}
// 🕐 Giờ: {interviewTime}
// 🔗 Link tham gia: {interviewLocation}
// 👥 Hình thức: Phỏng vấn Online (Zoom/Google Meet)

// Lưu ý:
// - Vui lòng kiểm tra kết nối internet và camera/micro trước giờ phỏng vấn
// - Tham gia phòng họp trước 5-10 phút

// Trân trọng,
// Phòng Nhân sự`,
//     },
//     {
//       id: 3,
//       name: "Mẫu từ chối ứng viên",
//       subject: "Thông báo kết quả ứng tuyển - {jobTitle}",
//       content: `Chào {applicantName},

// Cảm ơn bạn đã dành thời gian ứng tuyển vào vị trí {jobTitle} tại công ty chúng tôi.

// Sau khi xem xét kỹ lưỡng, chúng tôi rất tiếc phải thông báo rằng hồ sơ của bạn chưa phù hợp với yêu cầu của vị trí này.

// Chúng tôi rất trân trọng sự quan tâm của bạn và khuyến khích bạn tiếp tục theo dõi các cơ hội nghề nghiệp khác tại công ty.

// Chúc bạn thành công trong con đường sự nghiệp!

// Trân trọng,
// Phòng Nhân sự`,
//     },
//   ];

//   const handleUseTemplate = (template) => {
//     setEmailData({
//       ...emailData,
//       subject: template.subject.replace("{jobTitle}", jobTitle),
//       content: template.content
//         .replace(/{applicantName}/g, applicantName)
//         .replace(/{jobTitle}/g, jobTitle)
//         .replace(
//           /{interviewDate}/g,
//           emailData.interviewDate || "[Ngày phỏng vấn]"
//         )
//         .replace(
//           /{interviewTime}/g,
//           emailData.interviewTime || "[Giờ phỏng vấn]"
//         )
//         .replace(
//           /{interviewLocation}/g,
//           emailData.interviewLocation || "[Địa điểm phỏng vấn]"
//         )
//         .replace(
//           /{confirmDeadline}/g,
//           emailData.confirmDeadline || "[Ngày xác nhận]"
//         ),
//     });
//   };

//   const handleSendEmail = () => {
//     if (!emailData.subject || !emailData.content) {
//       Alert.alert("Lỗi", "Vui lòng điền đầy đủ tiêu đề và nội dung email!");
//       return;
//     }

//     Alert.alert(
//       "Xác nhận gửi email",
//       `Bạn có chắc chắn muốn gửi email thông báo phỏng vấn cho ${applicantName}?`,
//       [
//         { text: "Hủy", style: "cancel" },
//         {
//           text: "Gửi",
//           onPress: () => {
//             // Logic gửi email
//             Alert.alert("Thành công", "Đã gửi email thông báo phỏng vấn!");
//             onClose();
//           },
//         },
//       ]
//     );
//   };

//   const handleSaveTemplate = () => {
//     Alert.alert("Thành công", "Đã lưu mẫu email thành công!");
//   };

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       presentationStyle="pageSheet"
//     >
//       <View style={styles.container}>
//         {/* Header */}
//         <LinearGradient colors={["#00b14f", "#4CAF50"]} style={styles.header}>
//           <TouchableOpacity onPress={onClose}>
//             <MaterialIcons name="close" size={24} color="white" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Gửi thông báo phỏng vấn</Text>
//           <TouchableOpacity onPress={handleSendEmail}>
//             <MaterialIcons name="send" size={24} color="white" />
//           </TouchableOpacity>
//         </LinearGradient>

//         <ScrollView style={styles.content}>
//           {/* Recipient Info */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Thông tin người nhận</Text>
//             <View style={styles.recipientInfo}>
//               <Text style={styles.recipientLabel}>Ứng viên:</Text>
//               <Text style={styles.recipientValue}>{applicantName}</Text>
//             </View>
//             <View style={styles.recipientInfo}>
//               <Text style={styles.recipientLabel}>Vị trí:</Text>
//               <Text style={styles.recipientValue}>{jobTitle}</Text>
//             </View>
//           </View>

//           {/* Email Templates */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Mẫu email có sẵn</Text>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//               <View style={styles.templatesContainer}>
//                 {emailTemplates.map((template) => (
//                   <TouchableOpacity
//                     key={template.id}
//                     style={styles.templateCard}
//                     onPress={() => handleUseTemplate(template)}
//                   >
//                     <MaterialIcons name="email" size={24} color="#00b14f" />
//                     <Text style={styles.templateName}>{template.name}</Text>
//                     <Text style={styles.useTemplateText}>Sử dụng</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </ScrollView>
//           </View>

//           {/* Interview Details */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Chi tiết phỏng vấn</Text>

//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>Ngày phỏng vấn</Text>
//               <TextInput
//                 style={styles.textInput}
//                 value={emailData.interviewDate}
//                 onChangeText={(text) =>
//                   setEmailData({ ...emailData, interviewDate: text })
//                 }
//                 placeholder="VD: 20/09/2025"
//               />
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>Giờ phỏng vấn</Text>
//               <TextInput
//                 style={styles.textInput}
//                 value={emailData.interviewTime}
//                 onChangeText={(text) =>
//                   setEmailData({ ...emailData, interviewTime: text })
//                 }
//                 placeholder="VD: 14:00 - 15:00"
//               />
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>Địa điểm/Link</Text>
//               <TextInput
//                 style={styles.textInput}
//                 value={emailData.interviewLocation}
//                 onChangeText={(text) =>
//                   setEmailData({ ...emailData, interviewLocation: text })
//                 }
//                 placeholder="Địa chỉ công ty hoặc link zoom"
//                 multiline
//               />
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>Hạn xác nhận</Text>
//               <TextInput
//                 style={styles.textInput}
//                 value={emailData.confirmDeadline}
//                 onChangeText={(text) =>
//                   setEmailData({ ...emailData, confirmDeadline: text })
//                 }
//                 placeholder="VD: 18/09/2025"
//               />
//             </View>
//           </View>

//           {/* Email Content */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Nội dung email</Text>

//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>Tiêu đề</Text>
//               <TextInput
//                 style={styles.textInput}
//                 value={emailData.subject}
//                 onChangeText={(text) =>
//                   setEmailData({ ...emailData, subject: text })
//                 }
//                 placeholder="Tiêu đề email"
//               />
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>Nội dung</Text>
//               <TextInput
//                 style={[styles.textInput, styles.textArea]}
//                 value={emailData.content}
//                 onChangeText={(text) =>
//                   setEmailData({ ...emailData, content: text })
//                 }
//                 placeholder="Nội dung email"
//                 multiline
//                 numberOfLines={15}
//                 textAlignVertical="top"
//               />
//             </View>
//           </View>

//           {/* Action Buttons */}
//           <View style={styles.actionButtons}>
//             <TouchableOpacity
//               style={styles.saveTemplateButton}
//               onPress={handleSaveTemplate}
//             >
//               <MaterialIcons name="save" size={20} color="#666" />
//               <Text style={styles.saveTemplateText}>Lưu mẫu</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.sendButton}
//               onPress={handleSendEmail}
//             >
//               <MaterialIcons name="send" size={20} color="white" />
//               <Text style={styles.sendButtonText}>Gửi thông báo</Text>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   header: {
//     paddingTop: 44,
//     paddingBottom: 16,
//     paddingHorizontal: 16,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "white",
//   },
//   content: {
//     flex: 1,
//     padding: 16,
//   },
//   section: {
//     backgroundColor: "white",
//     padding: 16,
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 12,
//   },
//   recipientInfo: {
//     flexDirection: "row",
//     marginBottom: 8,
//   },
//   recipientLabel: {
//     fontSize: 14,
//     color: "#666",
//     width: 80,
//   },
//   recipientValue: {
//     fontSize: 14,
//     color: "#333",
//     fontWeight: "500",
//   },
//   templatesContainer: {
//     flexDirection: "row",
//     gap: 12,
//   },
//   templateCard: {
//     backgroundColor: "#f8f8f8",
//     padding: 16,
//     borderRadius: 8,
//     alignItems: "center",
//     minWidth: 120,
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//   },
//   templateName: {
//     fontSize: 12,
//     color: "#333",
//     textAlign: "center",
//     marginVertical: 8,
//     fontWeight: "500",
//   },
//   useTemplateText: {
//     fontSize: 12,
//     color: "#00b14f",
//     fontWeight: "bold",
//   },
//   inputGroup: {
//     marginBottom: 16,
//   },
//   inputLabel: {
//     fontSize: 14,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 8,
//   },
//   textInput: {
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     fontSize: 14,
//     backgroundColor: "white",
//   },
//   textArea: {
//     height: 200,
//     textAlignVertical: "top",
//   },
//   actionButtons: {
//     flexDirection: "row",
//     gap: 12,
//     marginTop: 16,
//     marginBottom: 32,
//   },
//   saveTemplateButton: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "white",
//     paddingVertical: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#666",
//     gap: 8,
//   },
//   saveTemplateText: {
//     color: "#666",
//     fontWeight: "bold",
//   },
//   sendButton: {
//     flex: 2,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#00b14f",
//     paddingVertical: 12,
//     borderRadius: 8,
//     gap: 8,
//   },
//   sendButtonText: {
//     color: "white",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
// });

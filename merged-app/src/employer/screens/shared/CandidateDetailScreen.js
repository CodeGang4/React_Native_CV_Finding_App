import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Image,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import CommonHeader from "../../components/common/CommonHeader";
import InterviewNotificationModal from "../../components/modals/InterviewNotificationModal";

const { width: screenWidth } = Dimensions.get("window");

export default function CandidateDetailScreen({ route, navigation }) {
  const candidate = route?.params?.candidate || {};
  const [showInvite, setShowInvite] = useState(false);

  // Extract candidate information
  const name = candidate.name || "Ứng viên";
  const title = candidate.title || candidate.appliedPosition || "Ứng tuyển";
  const skills = Array.isArray(candidate.skills) ? candidate.skills : [];
  const cvUrl = candidate.cvUrl || candidate.cv_url || null;

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case "shortlisted":
        return "#4CAF50";
      case "rejected":
        return "#F44336";
      case "pending":
      default:
        return "#FF9800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "shortlisted":
        return "Được chọn";
      case "rejected":
        return "Từ chối";
      case "pending":
      default:
        return "Chờ xem xét";
    }
  };

  const handleDownloadCV = async () => {
    if (!cvUrl) {
      Alert.alert("Chưa có CV", "Ứng viên này chưa cập nhật CV");
      return;
    }
    try {
      const supported = await Linking.canOpenURL(cvUrl);
      if (supported) await Linking.openURL(cvUrl);
      else Alert.alert("Không thể mở/tải CV", cvUrl);
    } catch (e) {
      Alert.alert("Lỗi", "Không thể mở đường dẫn CV");
    }
  };

  const handleContactPhone = () => {
    if (candidate.phone) {
      Linking.openURL(`tel:${candidate.phone}`);
    }
  };

  const handleContactEmail = () => {
    if (candidate.email) {
      Linking.openURL(`mailto:${candidate.email}`);
    }
  };

  return (
    <View style={styles.container}>
      <CommonHeader
        title="Hồ sơ ứng viên"
        onBack={() => navigation.goBack()}
        showAI={false}
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {candidate.avatar &&
            (candidate.avatar.startsWith("http") ||
              candidate.avatar.startsWith("https")) ? (
              <Image
                source={{ uri: candidate.avatar }}
                style={styles.avatarImage}
                defaultSource={{
                  uri: "https://th.bing.com/th/id/R.e6453f9d07601043e5b928d25e129948?rik=JPSLKIXFf8DmmQ&pid=ImgRaw&r=0",
                }}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {candidate.avatar || name.charAt(0).toUpperCase() || "👤"}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>{name}</Text>
            {!!title && <Text style={styles.title}>{title}</Text>}
            {!!candidate.location && (
              <View style={styles.locationRow}>
                <MaterialIcons name="location-on" size={16} color="#666" />
                <Text style={styles.locationText}>{candidate.location}</Text>
              </View>
            )}

            {/* Application Status */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(candidate.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusText(candidate.status)}
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        {(candidate.email || candidate.phone || candidate.location) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="contact-phone" size={18} color="#333" />{" "}
              Thông tin liên hệ
            </Text>
            <View style={styles.contactContainer}>
              {candidate.email && (
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={handleContactEmail}
                >
                  <MaterialIcons name="email" size={20} color="#2196F3" />
                  <Text style={styles.contactText}>{candidate.email}</Text>
                  <MaterialIcons name="open-in-new" size={16} color="#999" />
                </TouchableOpacity>
              )}
              {candidate.phone && (
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={handleContactPhone}
                >
                  <MaterialIcons name="phone" size={20} color="#4CAF50" />
                  <Text style={styles.contactText}>{candidate.phone}</Text>
                  <MaterialIcons name="open-in-new" size={16} color="#999" />
                </TouchableOpacity>
              )}
              {candidate.location && (
                <View style={styles.contactItem}>
                  <MaterialIcons name="location-on" size={20} color="#FF9800" />
                  <Text style={styles.contactText}>{candidate.location}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Experience & Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MaterialIcons name="work" size={18} color="#333" /> Kinh nghiệm &
            Kỹ năng
          </Text>
          {candidate.experience && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Kinh nghiệm:</Text>
              <Text style={styles.infoValue}>{candidate.experience}</Text>
            </View>
          )}
          {skills.length > 0 && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Kỹ năng:</Text>
              <View style={styles.skillsContainer}>
                {skills.map((skill, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Education */}
        {candidate.education && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="school" size={18} color="#333" /> Học vấn
            </Text>
            <Text style={styles.infoValue}>{candidate.education}</Text>
          </View>
        )}

        {/* Bio/Summary */}
        {(candidate.bio || candidate.summary) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="person" size={18} color="#333" /> Giới thiệu
              bản thân
            </Text>
            <Text style={styles.bioText}>
              {candidate.bio || candidate.summary}
            </Text>
          </View>
        )}

        {/* Application Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MaterialIcons name="assignment" size={18} color="#333" /> Thông tin
            ứng tuyển
          </Text>
          {candidate.appliedPosition && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Vị trí ứng tuyển:</Text>
              <Text style={styles.infoValue}>{candidate.appliedPosition}</Text>
            </View>
          )}
          {candidate.appliedDate && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Ngày ứng tuyển:</Text>
              <Text style={styles.infoValue}>{candidate.appliedDate}</Text>
            </View>
          )}
          {candidate.title && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Công việc hiện tại:</Text>
              <Text style={styles.infoValue}>{candidate.title}</Text>
            </View>
          )}
          {candidate.job_preferences && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Nguyện vọng công việc:</Text>
              <Text style={styles.infoValue}>{candidate.job_preferences}</Text>
            </View>
          )}
          {candidate.salary_expectation && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Mức lương mong muốn:</Text>
              <Text style={styles.infoValue}>
                {candidate.salary_expectation}
              </Text>
            </View>
          )}
          {candidate.work_type_preference && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Loại hình làm việc:</Text>
              <Text style={styles.infoValue}>
                {candidate.work_type_preference}
              </Text>
            </View>
          )}
          {candidate.status && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Trạng thái ứng tuyển:</Text>
              <View
                style={[
                  styles.miniStatusBadge,
                  { backgroundColor: getStatusColor(candidate.status) },
                ]}
              >
                <Text style={styles.miniStatusText}>
                  {getStatusText(candidate.status)}
                </Text>
              </View>
            </View>
          )}
          {candidate.rating > 0 && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Đánh giá:</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <MaterialIcons
                    key={star}
                    name="star"
                    size={16}
                    color={star <= candidate.rating ? "#FFD700" : "#E0E0E0"}
                  />
                ))}
                <Text style={styles.ratingText}>({candidate.rating}/5)</Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Footer Actions */}
      <View style={styles.footerActions}>
        <TouchableOpacity
          style={[styles.footerBtn, styles.downloadBtn]}
          onPress={handleDownloadCV}
          disabled={!cvUrl}
        >
          <MaterialIcons name="download" size={20} color="#fff" />
          <Text style={styles.footerBtnText}>Tải CV</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.footerBtn, styles.inviteBtn]}
          onPress={() => setShowInvite(true)}
        >
          <MaterialIcons name="event" size={20} color="#fff" />
          <Text style={styles.footerBtnText}>Mời phỏng vấn</Text>
        </TouchableOpacity>
      </View>

      <InterviewNotificationModal
        visible={showInvite}
        onClose={() => setShowInvite(false)}
        candidate={candidate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Profile Header
  profileHeader: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#e3f2fd",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e3f2fd",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#2196F3",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2196F3",
  },
  profileInfo: {
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // Section Styles
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  // Contact Section
  contactContainer: {
    gap: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    gap: 12,
  },
  contactText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },

  // Info Items
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  bioText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
  },

  // Skills
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  skillChip: {
    backgroundColor: "#e3f2fd",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  skillText: {
    fontSize: 12,
    color: "#2196F3",
    fontWeight: "500",
  },

  // Rating
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },

  // Mini Status Badge
  miniStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  miniStatusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // Footer Actions
  footerActions: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 12,
  },
  footerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  downloadBtn: {
    backgroundColor: "#FF9800",
  },
  inviteBtn: {
    backgroundColor: "#2196F3",
  },
  footerBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

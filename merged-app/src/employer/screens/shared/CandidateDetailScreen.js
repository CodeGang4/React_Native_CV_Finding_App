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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import CommonHeader from "../../components/common/CommonHeader";
import InterviewNotificationModal from "../../components/modals/InterviewNotificationModal";

export default function CandidateDetailScreen({ route, navigation }) {
  const candidate = route?.params?.candidate || {};
  const [showInvite, setShowInvite] = useState(false);

  const name = candidate.name || "Ứng viên";
  const title = candidate.title || candidate.position || "Ứng tuyển";
  const metaParts = [];
  if (candidate.level) metaParts.push((candidate.level || "").toUpperCase());
  if (candidate.experience) metaParts.push(candidate.experience);
  if (candidate.location) metaParts.push(candidate.location);
  const meta = metaParts.join(" • ");
  const skills = Array.isArray(candidate.skills) ? candidate.skills : [];
  const cvUrl = candidate.cvUrl || candidate.cv || null;

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

  return (
    <View style={styles.container}>
      <CommonHeader
        title="Hồ sơ ứng viên"
        onBack={() => navigation.goBack()}
        showAI={false}
      />
      <ScrollView style={styles.body}>
        <View style={styles.profileCard}>
          <View style={styles.headerRow}>
            <View style={styles.avatar}>
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
                <Text style={styles.avatarText}>
                  {candidate.avatar || "👤"}
                </Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{name}</Text>
              {!!title && <Text style={styles.title}>{title}</Text>}
              {!!meta && <Text style={styles.meta}>{meta}</Text>}
            </View>
          </View>
          {skills.length > 0 && (
            <View style={styles.skillsRow}>
              {skills.map((s, idx) => (
                <View key={`${s}-${idx}`} style={styles.skillTag}>
                  <Text style={styles.skillText}>{s}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Optional sections for future expansion: experience, education, projects, contact */}
        {candidate.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tóm tắt</Text>
            <Text style={styles.paragraph}>{candidate.summary}</Text>
          </View>
        ) : null}

        {(candidate.email || candidate.phone) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Liên hệ</Text>
            {candidate.email ? (
              <Text style={styles.infoRow}>Email: {candidate.email}</Text>
            ) : null}
            {candidate.phone ? (
              <Text style={styles.infoRow}>Điện thoại: {candidate.phone}</Text>
            ) : null}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={styles.footerActions}>
        <TouchableOpacity
          style={[styles.footerBtn, styles.downloadBtn]}
          onPress={handleDownloadCV}
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
        applicantName={name}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarText: {
    fontSize: 22,
  },
  name: { fontSize: 18, fontWeight: "800", color: "#333" },
  title: { fontSize: 14, color: "#666", marginTop: 4 },
  meta: { fontSize: 12, color: "#999", marginTop: 4 },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  skillTag: {
    backgroundColor: "#f4f6f8",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  skillText: { fontSize: 12, color: "#555" },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#333",
    marginBottom: 8,
  },
  paragraph: { fontSize: 14, color: "#444", lineHeight: 20 },
  infoRow: { fontSize: 14, color: "#444", marginTop: 4 },
  footerActions: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  footerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  downloadBtn: { backgroundColor: "#FF9800" },
  inviteBtn: { backgroundColor: "#2196F3" },
  footerBtnText: { color: "#fff", marginLeft: 8, fontWeight: "800" },
});

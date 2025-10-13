import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function CandidateCard({
  candidate,
  onInvite,
  onViewCV,
  onDownloadCV,
  onPress,
  showSkills = true,
  compact = false,
  rightAccessory, // optional custom right-side content
  hideViewCV = false,
}) {
  if (!candidate) return null;
  const name = candidate.name || "Ứng viên";
  const title = candidate.title || candidate.position || "Ứng tuyển";
  const metaParts = [];
  if (candidate.level) metaParts.push((candidate.level || "").toUpperCase());
  if (candidate.experience) metaParts.push(candidate.experience);
  if (candidate.location) metaParts.push(candidate.location);
  const meta = metaParts.join(" • ");

  const skills = Array.isArray(candidate.skills) ? candidate.skills : [];
  const cvUrl = candidate.cvUrl || candidate.cv || null;

  const handleViewCV = async () => {
    if (onViewCV) return onViewCV(candidate);
    if (!cvUrl) {
      Alert.alert("Chưa có CV", "Ứng viên này chưa cập nhật CV");
      return;
    }
    try {
      const supported = await Linking.canOpenURL(cvUrl);
      if (supported) await Linking.openURL(cvUrl);
      else Alert.alert("Không thể mở CV", cvUrl);
    } catch (e) {
      Alert.alert("Lỗi", "Không thể mở đường dẫn CV");
    }
  };

  const handleDownloadCV = async () => {
    if (onDownloadCV) return onDownloadCV(candidate);
    // Mặc định trên mobile sẽ mở URL để hệ thống xử lý tải/xem
    if (!cvUrl) {
      Alert.alert("Chưa có CV", "Ứng viên này chưa cập nhật CV");
      return;
    }
    try {
      const supported = await Linking.canOpenURL(cvUrl);
      if (supported) await Linking.openURL(cvUrl);
      else Alert.alert("Không thể tải CV", cvUrl);
    } catch (e) {
      Alert.alert("Lỗi", "Không thể tải CV");
    }
  };

  const handleInvite = () => {
    if (onInvite) return onInvite(candidate);
    Alert.alert("Mời phỏng vấn", `Gửi lời mời tới ${name}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      style={[styles.card, compact && styles.cardCompact]}
    >
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          {/* Avatar - check if it's a URL or emoji/text */}
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
            <Text style={styles.avatarText}>{candidate.avatar || "👤"}</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{name}</Text>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!meta && <Text style={styles.meta}>{meta}</Text>}
        </View>
        {rightAccessory ? rightAccessory : null}
      </View>

      {showSkills && skills.length > 0 && (
        <View style={styles.skillsRow}>
          {skills.map((s, idx) => (
            <View key={`${s}-${idx}`} style={styles.skillTag}>
              <Text style={styles.skillText}>{s}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actionsRow}>
        {!hideViewCV && (
          <ActionButton
            icon="description"
            color="#4CAF50"
            label="Xem CV"
            onPress={handleViewCV}
          />
        )}
        <ActionButton
          icon="download"
          color="#FF9800"
          label="Tải CV"
          onPress={handleDownloadCV}
        />
        <ActionButton
          icon="event"
          color="#2196F3"
          label="Mời PV"
          onPress={handleInvite}
        />
      </View>
    </TouchableOpacity>
  );
}

function ActionButton({ icon, color, label, onPress }) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <MaterialIcons name={icon} size={18} color={color} />
      <Text style={[styles.actionText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#eef2f3",
  },
  cardCompact: { paddingVertical: 10, paddingHorizontal: 12 },
  headerRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden", // Ensure image is clipped to circle
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    fontSize: 18,
  },
  name: { fontSize: 16, fontWeight: "700", color: "#333" },
  title: { fontSize: 13, color: "#666", marginTop: 2 },
  meta: { fontSize: 12, color: "#999", marginTop: 4 },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  skillTag: {
    backgroundColor: "#f4f6f8",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  skillText: { fontSize: 12, color: "#555" },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
  },
  actionText: { marginLeft: 6, fontWeight: "700" },
});

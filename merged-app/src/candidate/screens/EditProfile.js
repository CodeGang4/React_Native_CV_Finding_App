import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from "react-native";
import axios from "axios";
import { useAuth } from "../../shared/contexts/AuthContext";
import RNPickerSelect from "react-native-picker-select";

const PRIMARY_COLOR = "#00b14f";
const ACCENT_COLOR = "#f0f2f5";
const TEXT_COLOR = "#333333";
const GRAY_TEXT = "#6c757d";

export default function EditProfile({ navigation }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `http://192.168.1.2:3000/client/candidates/getProfile/${user.id}`
        );
        const formattedProfile = {
          ...res.data,
          date_of_birth: res.data.date_of_birth
            ? new Date(res.data.date_of_birth).toISOString().split("T")[0]
            : "",
        };
        setProfile(formattedProfile);
      } catch (error) {
        console.error("Lỗi khi load profile:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin hồ sơ.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const validateProfile = (data) => {
    if (!data.full_name?.trim()) return "Họ tên không được để trống";
    if (!data.phone?.trim()) return "Số điện thoại không được để trống";
    if (!data.date_of_birth?.match(/^\d{4}-\d{2}-\d{2}$/))
      return "Ngày sinh không hợp lệ. Định dạng: YYYY-MM-DD";
    return null;
  };

  const handleSave = async () => {
    if (!profile) return;

    const error = validateProfile(profile);
    if (error) {
      Alert.alert("Lỗi nhập liệu", error);
      return;
    }

    setSaving(true);
    try {
      const updatedProfile = {
        ...profile,
        full_name: profile.full_name?.trim() || "",
        address: profile.address?.trim() || "",
        phone: profile.phone?.trim() || "",
        education: profile.education?.trim() || "",
        experience: profile.experience?.trim() || "",
        portfolio: profile.portfolio?.trim() || "",
        gender: profile.gender || "Khác",
        date_of_birth: profile.date_of_birth || "",
        skills:
          typeof profile.skills === "string"
            ? profile.skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : profile.skills || [],
        job_preferences:
          typeof profile.job_preferences === "string"
            ? profile.job_preferences
                .split(",")
                .map((j) => j.trim())
                .filter(Boolean)
            : profile.job_preferences || [],
      };

      const res = await axios.post(
        `http://192.168.1.2:3000/client/candidates/updateProfile/${user.id}`,
        updatedProfile
      );

      if (res.status === 200) {
        Alert.alert("✅ Thành công", "Hồ sơ của bạn đã được cập nhật!");
        navigation.goBack();
      } else {
        Alert.alert(
          "Lỗi",
          `Cập nhật thất bại (mã lỗi ${res.status}). Vui lòng thử lại!`
        );
      }
    } catch (error) {
      console.error("Lỗi cập nhật profile:", error.response?.data || error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message ||
          "Không thể cập nhật hồ sơ. Kiểm tra lại kết nối."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={{ marginTop: 10, color: GRAY_TEXT }}>
          Đang tải thông tin...
        </Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={{ color: GRAY_TEXT }}>Không có dữ liệu hồ sơ</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.avatarWrapper}>
        <Image
          source={{
            uri:
              profile.portfolio ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{profile.full_name}</Text>
      </View>

      {/* Thông tin cá nhân */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

        <Text style={styles.label}>Họ tên</Text>
        <TextInput
          style={styles.input}
          value={profile.full_name}
          onChangeText={(text) => setProfile({ ...profile, full_name: text })}
        />

        <Text style={styles.label}>Ngày sinh (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={profile.date_of_birth}
          placeholder="1990-01-01"
          onChangeText={(text) =>
            setProfile({ ...profile, date_of_birth: text })
          }
        />

        <Text style={styles.label}>Giới tính</Text>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            onValueChange={(value) => setProfile({ ...profile, gender: value })}
            value={profile.gender}
            placeholder={{ label: "Chọn giới tính", value: null }}
            items={[
              { label: "Nam", value: "Nam" },
              { label: "Nữ", value: "Nữ" },
              { label: "Khác", value: "Khác" },
            ]}
            style={pickerSelectStyles}
          />
        </View>

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={profile.phone}
          onChangeText={(text) => setProfile({ ...profile, phone: text })}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Địa chỉ</Text>
        <TextInput
          style={styles.input}
          value={profile.address}
          onChangeText={(text) => setProfile({ ...profile, address: text })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin nghề nghiệp</Text>

        <Text style={styles.label}>Học vấn</Text>
        <TextInput
          style={styles.input}
          value={profile.education}
          onChangeText={(text) => setProfile({ ...profile, education: text })}
        />

        <Text style={styles.label}>Kinh nghiệm</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={profile.experience}
          onChangeText={(text) => setProfile({ ...profile, experience: text })}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Kỹ năng</Text>
        <TextInput
          style={styles.input}
          value={
            Array.isArray(profile.skills)
              ? profile.skills.join(", ")
              : profile.skills || ""
          }
          onChangeText={(text) => setProfile({ ...profile, skills: text })}
          placeholder="React Native, Node.js, SQL"
        />

        <Text style={styles.label}>Portfolio (link)</Text>
        <TextInput
          style={styles.input}
          value={profile.portfolio || ""}
          onChangeText={(text) => setProfile({ ...profile, portfolio: text })}
          placeholder="https://yourwebsite.com"
        />

        <Text style={styles.label}>Sở thích công việc</Text>
        <TextInput
          style={styles.input}
          value={
            Array.isArray(profile.job_preferences)
              ? profile.job_preferences.join(", ")
              : profile.job_preferences || ""
          }
          onChangeText={(text) =>
            setProfile({ ...profile, job_preferences: text })
          }
          placeholder="Full-time, Remote, Lương cao"
        />
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>
          {saving ? "Đang lưu..." : "💾 Lưu thay đổi"}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  avatarWrapper: {
    alignItems: "center",
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: PRIMARY_COLOR,
    backgroundColor: "#e8e8e8",
  },
  name: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "700",
    color: TEXT_COLOR,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: ACCENT_COLOR,
    paddingBottom: 5,
  },
  label: {
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 8,
    color: GRAY_TEXT,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d7dc",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: ACCENT_COLOR,
    color: TEXT_COLOR,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  saveBtn: {
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 30,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  saveBtnDisabled: {
    backgroundColor: "#a0a0a0",
    shadowColor: "#a0a0a0",
  },
  saveBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d7dc",
    borderRadius: 8,
    backgroundColor: ACCENT_COLOR,
    padding: 2,
    paddingLeft: 5,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: TEXT_COLOR,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: TEXT_COLOR,
  },
});

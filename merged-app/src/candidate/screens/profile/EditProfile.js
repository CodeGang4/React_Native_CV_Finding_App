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
  Dimensions,
} from "react-native";
import { useAuth } from "../../../shared/contexts/AuthContext";
import RNPickerSelect from "react-native-picker-select";
import CandidateApiService from "../../../shared/services/api/CandidateApiService";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY_COLOR = "#00b14f";
const SECONDARY_COLOR = "#008855";
const ACCENT_COLOR = "#f0f2f5";
const TEXT_COLOR = "#333333";
const GRAY_TEXT = "#6c757d";

const FIXED_FOOTER_HEIGHT = 80;

export default function EditProfile({ navigation }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Cần quyền truy cập",
            "Ứng dụng cần quyền truy cập thư viện ảnh để chọn avatar."
          );
        }
      }
    })();

    const fetchProfile = async () => {
      try {
        const profileData = await CandidateApiService.getCandidateById(user.id);

        const formattedProfile = {
          ...profileData,
          date_of_birth: profileData.date_of_birth
            ? new Date(profileData.date_of_birth).toISOString().split("T")[0]
            : "",
          gender: profileData.gender === 'male' ? 'Nam' : profileData.gender === 'female' ? 'Nữ' : 'Khác', 
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
    if (data.date_of_birth && !data.date_of_birth?.match(/^\d{4}-\d{2}-\d{2}$/))
      return "Ngày sinh không hợp lệ. Định dạng: YYYY-MM-DD";
    return null;
  };

  const handleUploadAvatar = async () => {
    if (uploadingAvatar) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }

    const avatarUri = result.assets[0].uri;

    setUploadingAvatar(true);
    try {
      const res = await CandidateApiService.uploadAvatar(user.id, avatarUri);

      if (res && (res.portfolio || res.portfolio_url)) {
        setProfile((prevProfile) => ({
          ...prevProfile,
          portfolio: res.portfolio || res.portfolio_url,
        }));
        Alert.alert("Thành công", "Ảnh đại diện đã được cập nhật!");
      } else {
         Alert.alert("Lỗi", "Upload thành công nhưng không nhận được URL ảnh mới.");
      }

    } catch (error) {
      console.error("Lỗi upload avatar:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể upload ảnh đại diện."
      );
    } finally {
      setUploadingAvatar(false);
    }
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
      const normalizedGender = {
          'Nam': 'male',
          'Nữ': 'female',
          'Khác': 'other',
          'nam': 'male',
          'nu': 'female',
          'khac': 'other',
          'male': 'male',
          'female': 'female',
          'other': 'other',
      }[profile.gender.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(' ', '').toLowerCase()] || 'other';


      const updatedProfile = {
        ...profile,
        
        full_name: profile.full_name?.trim() || "",
        address: profile.address?.trim() || "",
        phone: profile.phone?.trim() || "",
        education: profile.education?.trim() || "",
        experience: profile.experience?.trim() || "",
        gender: normalizedGender,
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

      await CandidateApiService.updateCandidateProfile(
        user.id,
        updatedProfile
      );

      Alert.alert("Thành công", "Hồ sơ của bạn đã được cập nhật!");
      navigation.goBack(); 

    } catch (error) {
      console.error("Lỗi cập nhật profile:", error.response?.data || error);
      
      let errorMessage = "Không thể cập nhật hồ sơ. Vui lòng kiểm tra kết nối.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message && !error.response) {
        errorMessage = error.message;
      }
      
      Alert.alert(`Lỗi ${error.response?.status || 'API'}`, errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (label, key, placeholder, keyboardType = 'default', multiline = false) => {
    if (!profile) return null;

    let value = profile[key];
    if (Array.isArray(value)) {
      value = value.join(", ");
    } else if (value === undefined || value === null) {
      value = "";
    }

    const isFocused = focusedInput === key;

    return (
      <View style={styles.inputGroup} key={key}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[
            styles.input,
            multiline && styles.textArea,
            isFocused && styles.inputFocused,
          ]}
          value={value}
          placeholder={placeholder}
          onChangeText={(text) => setProfile({ ...profile, [key]: text })}
          onFocus={() => setFocusedInput(key)}
          onBlur={() => setFocusedInput(null)}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? "top" : "center"}
        />
      </View>
    );
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
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.fullScreenContainer}>
      <ScrollView 
        style={styles.scrollViewContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: FIXED_FOOTER_HEIGHT + insets.bottom + 20 }}
      >
        <View style={styles.avatarWrapper}>
          <Image
            source={{
              uri:
                profile.portfolio ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={styles.avatar}
          />
          <TouchableOpacity
            onPress={handleUploadAvatar}
            disabled={uploadingAvatar}
            style={styles.editIconContainer}
          >
            {uploadingAvatar ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="edit" size={20} color="#fff" />
            )}
          </TouchableOpacity>
          
          <Text style={styles.name}>{profile.full_name}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          
          {renderInput("Họ tên", "full_name", "Tên đầy đủ của bạn")}
          {renderInput("Ngày sinh (YYYY-MM-DD)", "date_of_birth", "1990-01-01", "numeric")}

          <Text style={styles.label}>Giới tính</Text>
          <View style={[styles.input, styles.pickerInput]}>
            <RNPickerSelect
              onValueChange={(value) => setProfile({ ...profile, gender: value })}
              value={profile.gender}
              placeholder={{ label: "Chọn giới tính", value: null, color: GRAY_TEXT }}
              items={[
                { label: "Nam", value: "Nam" },
                { label: "Nữ", value: "Nữ" },
                { label: "Khác", value: "Khác" },
              ]}
              style={pickerSelectStyles}
            />
          </View>

          {renderInput("Số điện thoại", "phone", "090xxxxxxx", "phone-pad")}
          {renderInput("Địa chỉ", "address", "Số nhà, đường, quận/huyện, tỉnh/thành")}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin nghề nghiệp</Text>

          {renderInput("Học vấn", "education", "Ví dụ: Đại học Bách Khoa Hà Nội")}
          {renderInput("Kinh nghiệm (Tóm tắt)", "experience", "Mô tả ngắn về kinh nghiệm làm việc", 'default', true)}
          {renderInput("Kỹ năng (cách nhau bằng dấu phẩy)", "skills", "Ví dụ: React Native, Node.js, SQL")}
          {renderInput("Sở thích công việc (cách nhau bằng dấu phẩy)", "job_preferences", "Ví dụ: Full-time, Remote, Lương cao")}
        </View>
        
      </ScrollView>

      <View style={[styles.fixedFooter, { paddingBottom: insets.bottom || 15 }]}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
            )}
          </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: { 
    flex: 1, 
    backgroundColor: "#ffffff",
  },
  scrollViewContent: {
    flex: 1, 
    paddingHorizontal: 15,
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    padding: 20,
  },
  
  avatarWrapper: {
    alignItems: "center",
    marginVertical: 25,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: PRIMARY_COLOR,
    backgroundColor: ACCENT_COLOR,
  },
  name: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_COLOR,
  },

  editIconContainer: {
    position: 'absolute',
    left: '50%',
    marginLeft: 45,
    top: 95,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SECONDARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: SECONDARY_COLOR,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_COLOR,
    paddingLeft: 10,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 5,
    color: TEXT_COLOR,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: ACCENT_COLOR,
    padding: Platform.OS === 'ios' ? 14 : 10,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: ACCENT_COLOR,
    color: TEXT_COLOR,
  },
  inputFocused: {
    borderColor: PRIMARY_COLOR,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
  },
  pickerInput: {
    padding: 0, 
    justifyContent: 'center',
    height: Platform.OS === 'ios' ? 48 : 45,
  },

  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: ACCENT_COLOR,
    elevation: 10,
  },
  saveBtn: {
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  saveBtnDisabled: {
    backgroundColor: GRAY_TEXT,
  },
  saveBtnText: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "bold" 
  },
  retryButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  placeholder: {
    color: GRAY_TEXT,
  }
});

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfileScreen() {
  const { user, userRole, logout, switchRole } = useAuth();
  const [avatar, setAvatar] = useState(user?.avatar || null);

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", onPress: logout },
    ]);
  };

  const handleRoleSwitch = () => {
    const newRole = userRole === "candidate" ? "employer" : "candidate";
    const roleText =
      newRole === "candidate" ? "Người tìm việc" : "Nhà tuyển dụng";

    Alert.alert(
      "Chuyển đổi vai trò",
      `Bạn có muốn chuyển sang vai trò ${roleText}?`,
      [
        { text: "Hủy", style: "cancel" },
        { text: "Chuyển đổi", onPress: () => switchRole(newRole) },
      ]
    );
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Quyền bị từ chối",
        "Ứng dụng cần quyền truy cập thư viện ảnh."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      setAvatar(selectedUri);

      await CandidateApiService.uploadAvatar(user.id, selectedUri);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage} style={styles.avatar}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <MaterialIcons name="person" size={60} color="#fff" />
          )}
          <View style={styles.cameraIcon}>
            <MaterialIcons name="photo-camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{user?.username || user?.email}</Text>
        <Text style={styles.role}>
          {userRole === "candidate" ? "Người tìm việc" : "Nhà tuyển dụng"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tài khoản</Text>

        <TouchableOpacity style={styles.menuItem} onPress={handleRoleSwitch}>
          <MaterialIcons name="swap-horiz" size={24} color="#666" />
          <Text style={styles.menuText}>
            Chuyển sang{" "}
            {userRole === "candidate" ? "Nhà tuyển dụng" : "Người tìm việc"}
          </Text>
          <MaterialIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="edit" size={24} color="#666" />
          <Text style={styles.menuText}>Chỉnh sửa thông tin</Text>
          <MaterialIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="security" size={24} color="#666" />
          <Text style={styles.menuText}>Bảo mật</Text>
          <MaterialIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="notifications" size={24} color="#666" />
          <Text style={styles.menuText}>Thông báo</Text>
          <MaterialIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hỗ trợ</Text>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="help" size={24} color="#666" />
          <Text style={styles.menuText}>Trung tâm trợ giúp</Text>
          <MaterialIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="feedback" size={24} color="#666" />
          <Text style={styles.menuText}>Gửi phản hồi</Text>
          <MaterialIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="info" size={24} color="#666" />
          <Text style={styles.menuText}>Về chúng tôi</Text>
          <MaterialIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="exit-to-app" size={24} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 30,
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#00b14f",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    position: "relative",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#00b14f",
    borderRadius: 15,
    padding: 4,
  },
  name: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 5 },
  role: { fontSize: 14, color: "#666" },
  section: {
    backgroundColor: "#fff",
    marginBottom: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: { flex: 1, fontSize: 16, color: "#333", marginLeft: 15 },
  logoutButton: {
    backgroundColor: "#ff4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    margin: 20,
    borderRadius: 10,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

import React, { useState, useEffect } from "react";
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
import axios from "axios";
import { useAuth } from "../../shared/contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import ListCV from "./ListCV";
import EditProfile from "./EditProfile";
import NotificationsScreen from "../screens/NotificationsScreen";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, userRole, logout, switchRole } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `http://192.168.1.2:3000/client/candidates/getProfile/${user.id}`
        );
        setProfile(res.data);
      } catch (error) {
        console.error("❌ Lỗi fetch profile:", error);
        Alert.alert("Lỗi", "Không thể lấy thông tin profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

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

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          {profile?.portfolio ? (
            <Image
              source={{ uri: profile.portfolio }}
              style={styles.avatarImage}
            />
          ) : (
            <MaterialIcons name="person" size={60} color="#fff" />
          )}
        </View>
        <Text style={styles.name}>{profile?.full_name || user?.email}</Text>
        <Text style={styles.role}>
          {userRole === "candidate" ? "Người tìm việc" : "Nhà tuyển dụng"}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() =>
          navigation.navigate("ListCV", { cvUrl: profile?.cv_url })
        }
      >
        <MaterialIcons name="description" size={24} color="#666" />
        <Text style={styles.menuText}>CV của bạn</Text>
        <MaterialIcons name="chevron-right" size={24} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={handleRoleSwitch}>
        <MaterialIcons name="swap-horiz" size={24} color="#666" />
        <Text style={styles.menuText}>
          Chuyển sang{" "}
          {userRole === "candidate" ? "Nhà tuyển dụng" : "Người tìm việc"}
        </Text>
        <MaterialIcons name="chevron-right" size={24} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate("EditProfile")}
      >
        <MaterialIcons name="edit" size={24} color="#666" />
        <Text style={styles.menuText}>Chỉnh sửa thông tin</Text>
        <MaterialIcons name="chevron-right" size={24} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate("Security")}
      >
        <MaterialIcons name="security" size={24} color="#666" />
        <Text style={styles.menuText}>Bảo mật</Text>
        <MaterialIcons name="chevron-right" size={24} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate("Notifications")}
      >
        <MaterialIcons name="notifications" size={24} color="#666" />
        <Text style={styles.menuText}>Thông báo</Text>
        <MaterialIcons name="chevron-right" size={24} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate("HelpCenter")}
      >
        <MaterialIcons name="help" size={24} color="#666" />
        <Text style={styles.menuText}>Trung tâm trợ giúp</Text>
        <MaterialIcons name="chevron-right" size={24} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate("Feedback")}
      >
        <MaterialIcons name="feedback" size={24} color="#666" />
        <Text style={styles.menuText}>Gửi phản hồi</Text>
        <MaterialIcons name="chevron-right" size={24} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate("AboutUs")}
      >
        <MaterialIcons name="info" size={24} color="#666" />
        <Text style={styles.menuText}>Về chúng tôi</Text>
        <MaterialIcons name="chevron-right" size={24} color="#ccc" />
      </TouchableOpacity>

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
  },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  name: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 5 },
  role: { fontSize: 14, color: "#666" },
  section: { backgroundColor: "#fff", marginBottom: 20, paddingVertical: 10 },
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

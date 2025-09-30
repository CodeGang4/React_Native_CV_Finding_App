import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function AccountSettingsSection() {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionHeaderText}>Cài đặt tài khoản</Text>

        <TouchableOpacity style={styles.item}>
          <MaterialIcons name="workspace-premium" size={24} color="#FF9800" />
          <Text style={styles.itemText}>Nâng cấp tài khoản VIP</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <MaterialIcons name="key" size={24} color="#2196F3" />
          <Text style={styles.itemText}>Đổi mật khẩu</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <MaterialIcons name="security" size={24} color="#4CAF50" />
          <Text style={styles.itemText}>Cài đặt bảo mật</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <MaterialIcons name="email" size={24} color="#FF5722" />
          <Text style={styles.itemText}>Cài đặt thông báo email</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <MaterialIcons name="lock" size={24} color="#9C27B0" />
          <Text style={styles.itemText}>Vô hiệu hóa tài khoản</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeaderText}>Chính sách và hỗ trợ</Text>

        <TouchableOpacity style={styles.item}>
          <MaterialIcons name="description" size={24} color="#607D8B" />
          <Text style={styles.itemText}>Về TopCV</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <MaterialIcons name="gavel" size={24} color="#795548" />
          <Text style={styles.itemText}>Điều khoản dịch vụ</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <MaterialIcons name="privacy-tip" size={24} color="#009688" />
          <Text style={styles.itemText}>Chính sách bảo mật</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <MaterialIcons name="support-agent" size={24} color="#3F51B5" />
          <Text style={styles.itemText}>Trợ giúp</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <MaterialIcons name="thumb-up" size={24} color="#E91E63" />
          <Text style={styles.itemText}>Đánh giá ứng dụng</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <MaterialIcons name="update" size={24} color="#00BCD4" />
          <Text style={styles.itemText}>Kiểm tra bản cập nhật mới</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.versionSection}>
        <Text style={styles.versionText}>Phiên bản ứng dụng: 5.6.25</Text>
        <TouchableOpacity style={styles.logoutButton}>
          <MaterialIcons name="logout" size={20} color="#666" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    padding: 20,
    paddingBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemText: { flex: 1, fontSize: 16, color: "#333", marginLeft: 15 },
  versionSection: { alignItems: "center", padding: 20 },
  versionText: { fontSize: 14, color: "#666", marginBottom: 15 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logoutText: { fontSize: 16, color: "#666", marginLeft: 8 },
});

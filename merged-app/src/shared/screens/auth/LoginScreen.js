import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginScreen({ navigation }) {
  const { login, loginWithFaceID, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("candidate");

  // Hàm xử lý đăng nhập FaceID
  const handleFaceIDLogin = async () => {
    try {
      const result = await loginWithFaceID();
      if (!result.success) {
        alert(result.error || "Đăng nhập FaceID thất bại");
        return;
      }
      // Không cần chuyển hướng, navigator sẽ tự động chuyển khi user được cập nhật
    } catch (e) {
      alert(e.message || "Xác thực FaceID thất bại");
    }
  };

  const handleLogin = async () => {
    const result = await login(email, password, selectedRole);
    if (!result.success) {
      // Error already handled in login function
      return;
    }
    // Navigator will handle navigation based on user role
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={60}
      >
        <View>
          <Image
            source={require("../../../../assets/topcv_image.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>Chào mừng bạn đến với JobBridge</Text>
        </View>

        <View style={styles.roleContainer}>
          <Text style={styles.roleLabel}>Đăng nhập với vai trò:</Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                selectedRole === "candidate" && styles.roleButtonActive,
              ]}
              onPress={() => setSelectedRole("candidate")}
            >
              <MaterialIcons
                name="person-search"
                size={20}
                color={selectedRole === "candidate" ? "#fff" : "#00b14f"}
              />
              <Text
                style={[
                  styles.roleButtonText,
                  selectedRole === "candidate" && styles.roleButtonTextActive,
                ]}
              >
                Người tìm việc
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleButton,
                selectedRole === "employer" && styles.roleButtonActive,
              ]}
              onPress={() => setSelectedRole("employer")}
            >
              <MaterialIcons
                name="business"
                size={20}
                color={selectedRole === "employer" ? "#fff" : "#2196F3"}
              />
              <Text
                style={[
                  styles.roleButtonText,
                  selectedRole === "employer" && styles.roleButtonTextActive,
                ]}
              >
                Nhà tuyển dụng
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#888"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          autoCapitalize="none"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={{ flex: 1 }}
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#888"
            textContentType="password"
            autoComplete="password"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialIcons
              name={showPassword ? "visibility" : "visibility-off"}
              size={24}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={{ marginBottom: 13 }}
            onPress={handleFaceIDLogin}
          >
            <Text style={{ fontSize: 14 }}>Đăng nhập bằng FaceID</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginBottom: 13 }}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={{ fontSize: 14 }}>Quên mật khẩu?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text>Bạn chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.link}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  checkboxLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  passwordContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
    height: 50,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  checkboxContainer: {
    flexDirection: "column",
    marginBottom: 20,
    fontSize: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  link: {
    color: "#00aaff",
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: "#00cc00",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  ForgetPassword: {
    alignItems: "flex-end",
    marginTop: 10,
    marginBottom: 10,
  },
  footerText: {
    textAlign: "center",
    marginTop: 10,
    color: "#666",
  },
  logo: {
    width: 400,
    height: 100,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  roleButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 10,
    marginHorizontal: 5,
    backgroundColor: "#fff",
  },
  roleButtonActive: {
    backgroundColor: "#00b14f",
    borderColor: "#00b14f",
  },
  roleButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  roleButtonTextActive: {
    color: "#fff",
  },
});

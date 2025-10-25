import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CandidateApiService from "../../../shared/services/api/CandidateApiService";

const { width: screenWidth } = Dimensions.get("window");

export default function CVScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getFileType = (url) => {
    if (!url) return "unknown";
    const ext = url.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
    if (ext === "pdf") return "pdf";
    if (["doc", "docx"].includes(ext)) return "word";
    return "document";
  };

  const getFileExtension = (uri) => uri.split(".").pop().toLowerCase();

  const fetchCV = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const candidateData = await CandidateApiService.getCandidateById(user.id);
      if (candidateData?.cv_url) {
        setCv({
          id: user.id.toString(),
          url: candidateData.cv_url,
          name: "CV của tôi",
          type: getFileType(candidateData.cv_url),
        });
      } else {
        setCv(null);
      }
    } catch (error) {
      console.error("Error fetching CV:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCV();
  }, [user]);

  const uploadFile = async (asset) => {
    try {
      setUploading(true);
      const file = {
        uri: asset.uri,
        type: asset.mimeType || "application/octet-stream",
        name:
          asset.name ||
          `cv_${user.id}_${Date.now()}.${getFileExtension(asset.uri)}`,
      };

      const result = await CandidateApiService.uploadCV(user.id, file);
      if (!result?.url) throw new Error("No URL returned from server");

      setCv({
        id: user.id.toString(),
        url: result.url,
        name: "CV của tôi",
        type: getFileType(result.url),
      });

      Alert.alert("Thành công", "Tải lên CV thành công!");
    } catch (error) {
      console.error("Upload failed:", error);
      Alert.alert("Lỗi", "Không thể tải lên CV. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      await uploadFile(result.assets[0]);
    }
  };

  const handleUploadFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "image/*",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    });
    if (!result.canceled && result.assets[0]?.uri) {
      await uploadFile(result.assets[0]);
    }
  };

  const handleShowUploadOptions = () => {
    Alert.alert("Chọn loại file", "Bạn muốn tải lên loại file nào?", [
      { text: "Từ thư viện ảnh", onPress: handleUploadImage },
      { text: "Chọn file (PDF, DOCX...)", onPress: handleUploadFile },
      { text: "Hủy", style: "cancel" },
    ]);
  };

  const handleViewCV = () => {
    if (cv?.url) navigation.navigate("CVViewer", { url: cv.url });
  };

  const renderCVPreview = () => {
    if (!cv) return null;
    switch (cv.type) {
      case "image":
        return (
          <Image
            source={{ uri: cv.url }}
            style={styles.previewImage}
            resizeMode="contain"
            onError={() => setImageError(true)}
          />
        );
      case "pdf":
        return <MaterialIcons name="picture-as-pdf" size={64} color="#e74c3c" />;
      case "word":
        return <MaterialIcons name="description" size={64} color="#2b579a" />;
      default:
        return (
          <MaterialIcons name="insert-drive-file" size={64} color="#7f8c8d" />
        );
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00b14f" />
        <Text style={styles.loadingText}>Đang tải thông tin CV...</Text>
      </View>
    );
  }

  const bottomPadding = Math.max(insets.bottom, 16);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: cv ? 100 : 20 },
        ]}
      >
        {!cv ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="description" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>Chưa có CV nào</Text>
            <Text style={styles.emptyStateSubtext}>
              Tải lên CV đầu tiên của bạn để bắt đầu ứng tuyển
            </Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleShowUploadOptions}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="cloud-upload" size={22} color="#fff" />
                  <Text style={styles.uploadButtonText}>Tải lên CV</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cvContainer}>
            <TouchableOpacity style={styles.cvPreview} onPress={handleViewCV}>
              {renderCVPreview()}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {cv && (
        <View style={[styles.bottomActions, { paddingBottom: bottomPadding }]}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleShowUploadOptions}
          >
            <MaterialIcons name="edit" size={20} color="#007bff" />
            <Text style={styles.updateButtonText}>Cập nhật CV</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollView: { flex: 1 },
  contentContainer: { flexGrow: 1, padding: 16 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#666" },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyStateText: { fontSize: 18, fontWeight: "600", color: "#444" },
  emptyStateSubtext: { fontSize: 14, color: "#777", marginVertical: 8 },
  uploadButton: {
    flexDirection: "row",
    backgroundColor: "#00b14f",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 16,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  cvContainer: { alignItems: "center" },
  cvTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  cvPreview: {
    width: screenWidth - 32,
    height: (screenWidth - 32) * 1.4,
    borderRadius: 10,
    backgroundColor: "#f4f4f4",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: { width: "100%", height: "100%" },
  bottomActions: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#ddd",
    gap: 10,
  },
  updateButton: {
    flex: 1,
    borderColor: "#007bff",
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
  },
  updateButtonText: {
    color: "#007bff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 6,
  },
});

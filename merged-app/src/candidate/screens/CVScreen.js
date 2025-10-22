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
import { useAuth } from "../../shared/contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CandidateApiService from "../../shared/services/api/CandidateApiService";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

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

    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
      return "image";
    } else if (ext === "pdf") {
      return "pdf";
    } else if (["doc", "docx"].includes(ext)) {
      return "word";
    } else {
      return "document";
    }
  };

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
        setImageError(false);
      } else {
        setCv(null);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCV();
  }, [user]);

  const handleUploadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "image/*",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset?.uri) return;

      await uploadFile(asset);
    } catch (error) {
    }
  };

  const handleUploadImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
        aspect: [3, 4],
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset?.uri) return;

      await uploadFile(asset);
    } catch (error) {
    }
  };

  const uploadFile = async (asset) => {
    try {
      setUploading(true);

      const cvFile = {
        uri: asset.uri,
        type: asset.mimeType || "application/octet-stream",
        name:
          asset.name ||
          `cv_${user.id}_${Date.now()}.${getFileExtension(asset.uri)}`,
      };

      console.log("Starting upload...");

      const uploadResult = await CandidateApiService.uploadCV(user.id, cvFile);

      if (!uploadResult?.url) {
        throw new Error("No URL returned from server");
      }

      const newUrl = uploadResult.url;

      console.log("Testing URL accessibility:", newUrl);

      try {
        const testResponse = await fetch(newUrl, { method: "HEAD" });
        console.log("URL test status:", testResponse.status);

        if (!testResponse.ok) {
          console.warn("URL may not be accessible:", testResponse.status);
        }
      } catch (testError) {
        console.warn("URL test failed, but continuing:", testError);
      }

      setCv({
        id: user.id.toString(),
        url: newUrl,
        name: "CV của tôi",
        type: getFileType(newUrl),
      });
      setImageError(false);

      console.log("Upload successful, CV state updated");
    } catch (error) {
      console.error("Upload failed:", error);

      let errorMessage = "Không thể tải lên CV. Vui lòng thử lại.";

      if (error.message.includes("NETWORK_ERROR")) {
        errorMessage = "Lỗi kết nối mạng. Vui lòng kiểm tra internet.";
      } else if (error.message.includes("No URL")) {
        errorMessage = "Không nhận được phản hồi từ máy chủ. Vui lòng thử lại.";
      }

      Alert.alert("Tải lên thất bại", errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const getFileExtension = (uri) => {
    const filename = uri.split("/").pop();
    return filename.split(".").pop().toLowerCase();
  };

  const handleShowUploadOptions = () => {
    Alert.alert("Chọn loại file", "Bạn muốn tải lên loại file nào?", [
      {
        text: "Chọn từ thư viện ảnh",
        onPress: handleUploadImage,
      },
      {
        text: "Chọn file (PDF, DOCX...)",
        onPress: handleUploadFile,
      },
      {
        text: "Hủy",
        style: "cancel",
      },
    ]);
  };

  const handleDeleteCV = async () => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa CV này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            setUploading(true);
            setCv(null);
            setImageError(false);
          } catch (error) {
          } finally {
            setUploading(false);
          }
        },
      },
    ]);
  };

  const handleViewCV = () => {
    if (cv?.url) {
      navigation.navigate("CVViewer", { url: cv.url });
    }
  };

  const renderCVPreview = () => {
    if (!cv) return null;

    switch (cv.type) {
      case "image":
        return (
          <>
            {!imageError ? (
              <Image
                source={{ uri: cv.url }}
                style={styles.previewImage}
                resizeMode="contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={styles.fallbackContainer}>
                <MaterialIcons name="broken-image" size={48} color="#ccc" />
                <Text style={styles.fallbackText}>Không thể hiển thị ảnh</Text>
              </View>
            )}
          </>
        );

      case "pdf":
        return (
          <View style={styles.documentContainer}>
            <MaterialIcons name="picture-as-pdf" size={64} color="#e74c3c" />
            <Text style={styles.documentText}>PDF Document</Text>
            <Text style={styles.documentSubtext}>Chạm để xem</Text>
          </View>
        );

      case "word":
        return (
          <View style={styles.documentContainer}>
            <MaterialIcons name="description" size={64} color="#2b579a" />
            <Text style={styles.documentText}>Word Document</Text>
            <Text style={styles.documentSubtext}>Chạm để xem</Text>
          </View>
        );

      default:
        return (
          <View style={styles.documentContainer}>
            <MaterialIcons name="insert-drive-file" size={64} color="#7f8c8d" />
            <Text style={styles.documentText}>Document</Text>
            <Text style={styles.documentSubtext}>Chạm để xem</Text>
          </View>
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
        showsVerticalScrollIndicator={false}
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
                  <MaterialIcons name="cloud-upload" size={24} color="#fff" />
                  <Text style={styles.uploadButtonText}>Tải lên CV</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cvContainer}>
            <Text style={styles.cvTitle}>CV của bạn</Text>
            <Text style={styles.fileTypeText}>
              Loại file:{" "}
              {cv.type === "image"
                ? "Hình ảnh"
                : cv.type === "pdf"
                  ? "PDF"
                  : cv.type === "word"
                    ? "Word"
                    : "Tài liệu"}
            </Text>

            <TouchableOpacity style={styles.cvPreview} onPress={handleViewCV}>
              {renderCVPreview()}
              <View style={styles.overlay}>
                <MaterialIcons name="zoom-in" size={32} color="#fff" />
                <Text style={styles.viewText}>Chạm để xem chi tiết</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {cv && (
        <View style={[styles.bottomActions, { paddingBottom: bottomPadding }]}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleShowUploadOptions}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#007bff" />
            ) : (
              <>
                <MaterialIcons name="edit" size={20} color="#007bff" />
                <Text style={styles.updateButtonText}>Cập nhật CV</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteCV}
            disabled={uploading}
          >
            <MaterialIcons name="delete" size={20} color="#ff4444" />
            <Text style={styles.deleteButtonText}>Xóa CV</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    flex: 1,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00b14f",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    minWidth: 140,
    justifyContent: "center",
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  cvContainer: {
    alignItems: "center",
    flex: 1,
  },
  cvTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  fileTypeText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  cvPreview: {
    width: screenWidth - 32,
    height: (screenWidth - 32) * 1.4,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
  },
  documentContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  documentText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    textAlign: "center",
  },
  documentSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  fallbackContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  fallbackText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    opacity: 1,
  },
  viewText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  bottomActions: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 12,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  updateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007bff",
    minHeight: 50,
  },
  updateButtonText: {
    color: "#007bff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 6,
    textAlign: "center",
    flexShrink: 1,
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffebee",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ff4444",
    minHeight: 50,
  },
  deleteButtonText: {
    color: "#ff4444",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
    textAlign: "center",
  },
});

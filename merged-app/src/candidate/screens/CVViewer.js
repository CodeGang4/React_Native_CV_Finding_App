import React from "react";
import { 
  View, 
  StatusBar, 
  Alert, 
  ActivityIndicator, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Linking,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { useRoute, useFocusEffect } from "@react-navigation/native"; 
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { MaterialIcons } from "@expo/vector-icons";
import { WebView } from 'react-native-webview';

export default function CVViewer() {
  const route = useRoute();
  const { url } = route.params;
  const [loading, setLoading] = React.useState(true);
  const [webViewError, setWebViewError] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [key, setKey] = React.useState(0);

  const getFileType = (url) => {
    if (!url) return 'unknown';
    const ext = url.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
      return 'image';
    } else if (ext === 'pdf') {
      return 'pdf';
    } else if (['doc', 'docx', 'xlsx', 'pptx'].includes(ext)) {
      return 'office';
    } else {
      return 'document';
    }
  };

  const fileType = getFileType(url);

  useFocusEffect(
    React.useCallback(() => {
      console.log("CVViewer focused - Resetting state");
      
      setLoading(true);
      setWebViewError(false);
      setImageError(false);
      setKey(prev => prev + 1);

      return () => {
        console.log("CVViewer unfocused");
      };
    }, [url])
  );

  const handleOpenInExternalApp = async () => {
    try {
      setLoading(true);

      if (Platform.OS === 'web') {
        await Linking.openURL(url);
      } else if (Platform.OS === 'ios' && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(url);
      } else {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          await WebBrowser.openBrowserAsync(url);
        }
      }
    } catch (error) {
      console.error("Lỗi khi mở file:", error);
      Alert.alert("Lỗi", "Không thể mở file bằng ứng dụng khác.");
    } finally {
      setLoading(false);
    }
  };

  const renderErrorState = (fileDescription) => (
    <View style={styles.errorOverlay}>
      <MaterialIcons name="cloud-off" size={60} color="#e74c3c" />
      <Text style={styles.errorText}>
        Không thể tải {fileDescription}
      </Text>
      <Text style={styles.errorSubText}>
        Vui lòng kiểm tra lại kết nối hoặc thử mở bằng ứng dụng khác.
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => {
          setWebViewError(false); 
          setImageError(false);
          setLoading(true);
          setKey(prev => prev + 1);
        }}
      >
        <Text style={styles.retryButtonText}>Thử lại</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.retryButton, { marginTop: 10, backgroundColor: '#3498db' }]}
        onPress={handleOpenInExternalApp}
      >
        <Text style={styles.retryButtonText}>Mở bằng app khác</Text>
      </TouchableOpacity>
    </View>
  );

  const renderWebViewer = (viewerUrl, loadingText, fileDescription) => {
    if (webViewError) {
      return renderErrorState(fileDescription);
    }

    return (
      <View style={{ flex: 1 }}>
        <WebView
          key={`webview-${key}`}
          source={{ uri: viewerUrl }}
          style={{ flex: 1, backgroundColor: '#fff' }}
          onLoadStart={() => {
            console.log("WebView load started");
            setLoading(true);
            setWebViewError(false);
          }}
          onLoadEnd={() => {
            console.log("WebView load ended");
            setLoading(false);
          }}
          onLoad={() => {
            console.log("WebView loaded successfully");
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
            setLoading(false);
            setWebViewError(true);
          }}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00b14f" />
              <Text style={styles.loadingText}>{loadingText}</Text>
            </View>
          )}
        />
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#00b14f" />
            <Text style={styles.loadingText}>{loadingText}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderPDFViewer = () => {
    const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
    return renderWebViewer(googleDocsUrl, 'Đang tải PDF...', 'PDF');
  };

  const renderOfficeViewer = () => {
    const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    return renderWebViewer(officeViewerUrl, 'Đang tải tài liệu...', 'tài liệu Office');
  };

  const renderImageViewer = () => {
    if (imageError) {
      return renderErrorState("ảnh");
    }

    return (
      <View style={styles.imageContainer}>
        <ScrollView 
          maximumZoomScale={3} 
          minimumZoomScale={1} 
          contentContainerStyle={styles.scrollContainer}
        >
          <Image
            key={`image-${key}`}
            source={{ uri: url }}
            style={styles.image}
            resizeMode="contain"
            onLoadStart={() => {
              console.log("Image load started");
              setLoading(true);
              setImageError(false);
            }}
            onLoadEnd={() => {
              console.log("Image load ended");
              setLoading(false);
            }}
            onLoad={() => {
              console.log("Image loaded successfully");
            }}
            onError={(error) => {
              console.error("Image load error:", error.nativeEvent);
              setLoading(false);
              setImageError(true);
            }}
          />
        </ScrollView>
        
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#00b14f" />
            <Text style={styles.loadingText}>Đang tải ảnh...</Text>
          </View>
        )}
      </View>
    );
  };

  const renderContent = () => {
    console.log(`Rendering ${fileType} with key: ${key}`);

    switch (fileType) {
      case 'image':
        return renderImageViewer();
      
      case 'pdf':
        return renderPDFViewer();
      
      case 'office':
        return renderOfficeViewer();
      
      default:
        return (
          <View style={styles.documentContainer}>
            <MaterialIcons 
              name="insert-drive-file" 
              size={120} 
              color="#7f8c8d" 
            />
            
            <Text style={styles.documentTitle}>Tài liệu không hỗ trợ</Text>
            
            <Text style={styles.documentText}>
              Định dạng file này ({fileType.toUpperCase()}) không được hỗ trợ xem trực tiếp.
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.openButton]}
                onPress={handleOpenInExternalApp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="open-in-new" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Mở bằng app khác</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  documentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 30,
  },
  documentTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  documentText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 160,
    justifyContent: 'center',
    gap: 8,
  },
  openButton: {
    backgroundColor: '#00b14f',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 30,
  },
  errorText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubText: {
    color: '#bdc3c7',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#00b14f',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
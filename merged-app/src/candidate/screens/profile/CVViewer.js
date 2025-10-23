import React, { useState, useCallback, useRef, useEffect } from "react";
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
  useWindowDimensions,
} from "react-native";
import { useRoute, useFocusEffect } from "@react-navigation/native"; 
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { MaterialIcons } from "@expo/vector-icons";
import { WebView } from 'react-native-webview';

export default function CVViewer() {
  const route = useRoute();
  const { url } = route.params;
  
  const { width: screenW, height: screenH } = useWindowDimensions(); 
  const webViewRef = useRef(null);
  const hasLoadedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [webViewError, setWebViewError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageDisplaySize, setImageDisplaySize] = useState({ width: screenW, height: screenH }); 

  const getFileType = (url) => {
    if (!url) return 'unknown';
    const cleanUrl = url.split('?')[0];
    const ext = cleanUrl.split('.').pop().toLowerCase();
    
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

  const calculateImageSize = useCallback((imgWidth, imgHeight) => {
    const containerW = screenW;
    const containerH = screenH;

    const aspectRatio = imgWidth / imgHeight;
    let displayW = containerW;
    let displayH = containerW / aspectRatio;

    if (displayH > containerH) {
      displayH = containerH;
      displayW = containerH * aspectRatio;
    }

    setImageDisplaySize({ 
        width: Math.min(displayW, containerW), 
        height: Math.min(displayH, containerH) 
    });
    setLoading(false);
  }, [screenW, screenH]);

  useEffect(() => {
    console.log("CVViewer URL changed:", url);
    
    hasLoadedRef.current = false;
    setLoading(true);
    setWebViewError(false);
    setImageError(false);
    
    if (fileType === 'image') {
      Image.getSize(
        url, 
        (width, height) => {
          calculateImageSize(width, height);
          hasLoadedRef.current = true;
        }, 
        (error) => {
          console.error("Failed to get image size:", error);
          setLoading(false);
          setImageError(true);
          hasLoadedRef.current = true;
        }
      );
    } else {
      const timer = setTimeout(() => {
        setLoading(false);
        hasLoadedRef.current = true;
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [url]);

  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedRef.current) {
        console.log("Focus effect - initial load");
        return;
      }
      
      console.log("Focus effect - already loaded, no reset");
      
      return () => {
        console.log("Screen unfocused");
      };
    }, [])
  );

  const handleOpenInExternalApp = async () => {
    try {
      if (Platform.OS === 'web') {
        await Linking.openURL(url);
      } else if (Platform.OS === 'ios' && await Sharing.isAvailableAsync()) {
        await WebBrowser.openBrowserAsync(url);
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
      Alert.alert("Lỗi", "Không thể mở file bằng ứng dụng khác. Vui lòng kiểm tra lại URL.");
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
          hasLoadedRef.current = false;
          setWebViewError(false); 
          setImageError(false);
          setLoading(true);
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
          ref={webViewRef}
          key={`webview-${url}`} 
          source={{ uri: viewerUrl }}
          style={{ flex: 1, backgroundColor: '#fff' }}
          onLoadStart={() => {
            console.log("WebView load started");
            setLoading(true);
            setWebViewError(false);
          }}
          onLoadEnd={() => {
            console.log("WebView load ended successfully");
            setLoading(false);
            hasLoadedRef.current = true;
          }}
          onLoad={() => {
            console.log("WebView loaded");
            hasLoadedRef.current = true;
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
            setLoading(false);
            setWebViewError(true);
            hasLoadedRef.current = true;
          }}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00b14f" />
              <Text style={styles.loadingText}>{loadingText}</Text>
            </View>
          )}
        />
      </View>
    );
  };

  const renderPDFViewer = () => {
    const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
    
    console.log("Rendering PDF viewer with URL:", googleDocsUrl);
    return renderWebViewer(googleDocsUrl, 'Đang tải PDF...', 'PDF');
  };

  const renderOfficeViewer = () => {
    const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    
    console.log("Rendering Office viewer with URL:", officeViewerUrl);
    return renderWebViewer(officeViewerUrl, 'Đang tải tài liệu...', 'tài liệu Office');
  };

  const renderImageViewer = () => {
    if (imageError) {
      return renderErrorState("ảnh");
    }

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00b14f" />
          <Text style={styles.loadingText}>Đang tải ảnh...</Text>
        </View>
      );
    }

    return (
      <View style={styles.imageContainer}>
        <ScrollView 
          maximumZoomScale={5}
          minimumZoomScale={1} 
          contentContainerStyle={styles.scrollContainer}
          centerContent={true}
        >
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: url }}
              style={{ 
                width: imageDisplaySize.width, 
                height: imageDisplaySize.height 
              }}
              resizeMode="contain"
              onLoad={() => {
                console.log("Image loaded successfully");
                hasLoadedRef.current = true;
              }}
              onError={() => {
                console.error("Image load failed");
                setImageError(true);
                setLoading(false);
                hasLoadedRef.current = true;
              }}
            />
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderContent = () => {
    console.log(`Rendering ${fileType}, loading: ${loading}`);

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
              >
                <MaterialIcons name="open-in-new" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Mở bằng app khác</Text>
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
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
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
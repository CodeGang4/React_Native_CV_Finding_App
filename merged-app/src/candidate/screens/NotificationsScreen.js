import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Image, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from "../../shared/contexts/NotificationContext";
import { useJobActions } from "../../shared/hooks/useJobActions";
import { useAuth } from "../../shared/contexts/AuthContext";
import NotificationDebug from "../../shared/components/NotificationDebug";
import RateLimitMonitor from "../../components/debug/RateLimitMonitor";
import { useState } from 'react';

export default function NotificationsScreen() {
  const { 
    notifications, 
    unreadCount, 
    loading,
    error,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAll, 
    pushToken, 
    sendTestNotification,
    refreshNotifications,
  } = useNotifications();

  const { user, userRole } = useAuth();
  const isAuthenticated = !!user;
  
  const [refreshing, setRefreshing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Debug log for notifications
  console.log('[NotificationsScreen] Render:', {
    notificationsCount: notifications?.length || 0,
    unreadCount,
    loading,
    error,
    isAuthenticated,
    userId: user?.id
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId, isRead) => {
    if (!isRead) {
      await markAsRead(notificationId);
    }
  };

  const handleDeleteNotification = (notificationId) => {
    Alert.alert(
      'Xóa thông báo',
      'Bạn có chắc chắn muốn xóa thông báo này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => deleteNotification(notificationId)
        }
      ]
    );
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Đánh dấu tất cả đã đọc',
      'Bạn có muốn đánh dấu tất cả thông báo là đã đọc?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đồng ý', onPress: markAllAsRead }
      ]
    );
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification
      ]}
      onPress={() => handleMarkAsRead(item.id, item.read)}
      onLongPress={() => handleDeleteNotification(item.id)}
    >
      <View style={styles.avatarContainer}>
        {item.sender?.avatar ? (
          <Image 
            source={{ uri: item.sender.avatar }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.defaultAvatar]}>
            <Ionicons name="briefcase" size={20} color="#fff" />
          </View>
        )}
        {!item.read && <View style={styles.unreadDot} />}
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text style={[
            styles.notificationTitle,
            !item.read && styles.unreadTitle
          ]} numberOfLines={2}>
            {item.title}
          </Text>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteNotification(item.id)}
          >
            <Ionicons name="close" size={16} color="#999" />
          </TouchableOpacity>
        </View>
        <Text style={styles.notificationSubtitle} numberOfLines={2}>
          {item.body}
        </Text>
        <View style={styles.bottomRow}>
          <Text style={styles.timestamp}>
            {formatTimestamp(item.timestamp)}
          </Text>
          {item.type && (
            <View style={[styles.typeBadge, getTypeBadgeStyle(item.type)]}>
              <Text style={styles.typeText}>{getTypeLabel(item.type)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diffInMs = now - new Date(timestamp);
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays === 1) return '1 ngày trước';
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return new Date(timestamp).toLocaleDateString('vi-VN');
  };

  const getTypeLabel = (type) => {
    const typeLabels = {
      'job_saved': 'Đã lưu',
      'application_sent': 'Ứng tuyển',
      'application_status': 'Trạng thái',
      'interview_schedule': 'Phỏng vấn',
      'job_alert': 'Việc làm mới',
      'interview_invite': 'Mời phỏng vấn',
      'system_announcement': 'Hệ thống',
      'other': 'Khác'
    };
    return typeLabels[type] || 'Khác';
  };

  const getTypeBadgeStyle = (type) => {
    const styles = {
      'job_saved': { backgroundColor: '#E8F5E9' },
      'application_sent': { backgroundColor: '#E3F2FD' },
      'application_status': { backgroundColor: '#FFF3E0' },
      'interview_schedule': { backgroundColor: '#F3E5F5' },
      'job_alert': { backgroundColor: '#E0F2F1' },
      'interview_invite': { backgroundColor: '#FCE4EC' },
      'system_announcement': { backgroundColor: '#FFEBEE' },
      'other': { backgroundColor: '#F5F5F5' }
    };
    return styles[type] || styles.other;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.mainHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.mainTitle}>Thông báo</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.headerRight}>
            {unreadCount > 0 && (
              <TouchableOpacity 
                style={styles.markAllButton}
                onPress={handleMarkAllAsRead}
              >
                <Text style={styles.markAllText}>Đọc tất cả</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.menuButton} onPress={() => setShowDebug(!showDebug)}>
              <Ionicons name={showDebug ? "bug" : "menu"} size={24} color={showDebug ? "#ff4444" : "#333"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Auth warning */}
        {!isAuthenticated && (
          <View style={styles.authWarning}>
            <Ionicons name="warning" size={16} color="#ff9800" />
            <Text style={styles.authWarningText}>
              Vui lòng đăng nhập để xem thông báo từ hệ thống
            </Text>
          </View>
        )}

        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Lỗi: {error}</Text>
            <TouchableOpacity onPress={refreshNotifications}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading indicator */}
        {loading && notifications.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00b14f" />
            <Text style={styles.loadingText}>Đang tải thông báo...</Text>
          </View>
        )}

        {/* Debug component */}
        {showDebug && <NotificationDebug />}

        {/* Danh sách notifications */}
        {!showDebug && (
          !isAuthenticated ? (
            <View style={styles.emptyState}>
              <Ionicons name="person-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Cần đăng nhập</Text>
              <Text style={styles.emptySubtext}>
                Đăng nhập để xem thông báo từ hệ thống
              </Text>
            </View>
          ) : loading && (!notifications || notifications.length === 0) ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00b14f" />
              <Text style={styles.loadingText}>Đang tải thông báo...</Text>
            </View>
          ) : (!notifications || notifications.length === 0) ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Không có thông báo</Text>
              <Text style={styles.emptySubtext}>
                Thông báo về công việc mới và cập nhật sẽ xuất hiện ở đây
              </Text>
              <TouchableOpacity style={styles.testButton} onPress={sendTestNotification}>
                <Text style={styles.testButtonText}>Tạo thông báo test</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              renderItem={renderNotification}
              style={styles.notificationsList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#00b14f']}
                  tintColor="#00b14f"
                />
              }
              ListFooterComponent={() => (
                loading && notifications.length > 0 ? (
                  <View style={styles.loadingMore}>
                    <ActivityIndicator size="small" color="#00b14f" />
                  </View>
                ) : null
              )}
            />
          )
        )}
        
        {/* Rate Limit Monitor - Only visible in development */}
        <RateLimitMonitor enabled={__DEV__} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#ffffff',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff',
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#00b14f',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  markAllText: {
    color: '#00b14f',
    fontSize: 14,
    fontWeight: '500',
  },
  menuButton: {
    padding: 4,
  },
  authWarning: {
    backgroundColor: '#fff3cd',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  authWarningText: {
    color: '#856404',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    flex: 1,
  },
  retryText: {
    color: '#00b14f',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  loadingMore: {
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00b14f',
  },
  defaultAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    backgroundColor: '#00b14f',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
  },
  unreadNotification: {
    backgroundColor: '#f8f9fa',
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    lineHeight: 20,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '600',
    color: '#000',
  },
  notificationSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
  timestamp: { 
    fontSize: 12, 
    color: '#999',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  typeText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 72,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  emptyText: { 
    fontSize: 16, 
    color: '#666', 
    marginBottom: 8,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: { 
    fontSize: 14, 
    color: '#999', 
    textAlign: 'center',
    marginBottom: 24,
  },
  testButton: {
    backgroundColor: '#00b14f',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  testButtonText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '600' 
  },
  notificationsList: { 
    flex: 1 
  },
  listContent: {
    paddingBottom: 20
  },
});

import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Image } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from "../../shared/contexts/NotificationContext";
import { useJobActions } from "../../shared/hooks/useJobActions";

export default function NotificationsScreen() {
  // const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, pushToken, sendTestNotification } = useNotifications();
  // const { testJobSavedNotification, loading: jobActionLoading } = useJobActions();

  // const renderNotification = ({ item }) => (
  //   <TouchableOpacity
  //     style={styles.notificationItem}
  //     onPress={() => !item.read && markAsRead(item.id)}
  //   >
  //     <View style={styles.avatarContainer}>
  //       <View style={styles.avatar}>
  //         <Ionicons name="briefcase" size={20} color="#fff" />
  //       </View>
  //     </View>
      
  //     <View style={styles.contentContainer}>
  //       <Text style={styles.notificationTitle} numberOfLines={2}>
  //         {item.title}
  //       </Text>
  //       <Text style={styles.notificationSubtitle} numberOfLines={2}>
  //         {item.body}
  //       </Text>
  //       <Text style={styles.timestamp}>
  //         {formatTimestamp(item.timestamp)}
  //       </Text>
  //     </View>

  //     {!item.read && <View style={styles.unreadDot} />}
  //   </TouchableOpacity>
  // );

  // const formatTimestamp = (timestamp) => {
  //   const now = new Date();
  //   const diffInDays = Math.floor((now - timestamp) / (1000 * 60 * 60 * 24));
    
  //   if (diffInDays === 0) return 'Hôm nay';
  //   if (diffInDays === 1) return '1 ngày trước';
  //   if (diffInDays < 7) return `${diffInDays} ngày trước`;
  //   return timestamp.toLocaleDateString('vi-VN');
  // };

  // const showToken = () => {
  //   if (pushToken) {
  //     Alert.alert(
  //       'Push Token',
  //       `Your push token:\n\n${pushToken}`,
  //       [
  //         { text: 'Copy', onPress: () => console.log('Token copied:', pushToken) },
  //         { text: 'OK' }
  //       ]
  //     );
  //   } else {
  //     Alert.alert('No Token', 'Push token not available yet');
  //   }
  // };

  // const handleTestActions = () => {
  //   Alert.alert(
  //     'Test Notifications',
  //     'Chọn loại test notification',
  //     // [
  //     //   { text: 'Test cơ bản', onPress: sendTestNotification },
  //     //   { text: 'Test job saved', onPress: testJobSavedNotification },
  //     //   { text: 'Hủy', style: 'cancel' }
  //     // ]
  //   );
  // };

  // return (
  //   <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
  //     <View style={styles.container}>
  //       {/* Header đơn giản */}
  //       <View style={styles.mainHeader}>
  //         <Text style={styles.mainTitle}>Thông báo</Text>
  //         <View style={styles.headerActions}>
  //           {unreadCount > 0 && (
  //             <TouchableOpacity 
  //               style={styles.markAllButton} 
  //               onPress={markAllAsRead}
  //             >
  //               <Text style={styles.markAllText}>Đánh dấu đã đọc</Text>
  //             </TouchableOpacity>
  //           )}
  //           <TouchableOpacity style={styles.menuButton} onPress={showToken}>
  //             <Ionicons name="ellipsis-vertical" size={20} color="#333" />
  //           </TouchableOpacity>
  //         </View>
  //       </View>

  //       {/* Danh sách notifications */}
  //       {notifications.length === 0 ? (
  //         <View style={styles.emptyState}>
  //           <View style={styles.emptyIcon}>
  //             <Ionicons name="notifications-outline" size={64} color="#ccc" />
  //           </View>
  //           <Text style={styles.emptyText}>Chưa có thông báo</Text>
  //           <Text style={styles.emptySubtext}>
  //             Thông báo về công việc mới và cập nhật sẽ xuất hiện ở đây
  //           </Text>
  //           <View style={styles.testButtonContainer}>
  //             <TouchableOpacity 
  //               style={styles.testButton} 
  //               onPress={handleTestActions}
  //               disabled={jobActionLoading}
  //             >
  //               <Text style={styles.testButtonText}>
  //                 {jobActionLoading ? 'Đang tạo...' : 'Test thông báo'}
  //               </Text>
  //             </TouchableOpacity>
  //           </View>
  //         </View>
  //       ) : (
  //         <FlatList
  //           data={notifications}
  //           keyExtractor={(item) => item.id}
  //           renderItem={renderNotification}
  //           style={styles.notificationsList}
  //           showsVerticalScrollIndicator={false}
  //           contentContainerStyle={styles.listContent}
  //           ItemSeparatorComponent={() => <View style={styles.separator} />}
  //         />
  //       )}
  //     </View>
  //   </SafeAreaView>
  // );
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
  mainTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#00b14f',
    borderRadius: 16,
  },
  markAllText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  menuButton: {
    padding: 4,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00b14f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    lineHeight: 22,
  },
  notificationSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  timestamp: { 
    fontSize: 12, 
    color: '#999',
    fontWeight: '500',
  },
  unreadDot: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00b14f',
  },
  separator: {
    height: 1,
    backgroundColor: '#f5f5f5',
    marginLeft: 76, // Để separator không chạm vào avatar
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyText: { 
    fontSize: 18, 
    color: '#333', 
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: { 
    fontSize: 14, 
    color: '#666', 
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  testButton: {
    backgroundColor: '#00b14f',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  testButtonContainer: {
    gap: 8,
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

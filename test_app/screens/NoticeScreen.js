import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNotifications } from '../contexts/NotificationContext';

export default function NoticeScreen() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, pushToken, sendTestNotification } = useNotifications();

  const renderNotification = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      onPress={() => !item.read && markAsRead(item.id)}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
        </Text>
      </View>
      <Text style={styles.notificationBody}>{item.body}</Text>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const showToken = () => {
    if (pushToken) {
      Alert.alert(
        'Push Token',
        `Your push token:\n\n${pushToken}`,
        [
          { text: 'Copy', onPress: () => console.log('Token copied:', pushToken) },
          { text: 'OK' }
        ]
      );
    } else {
      Alert.alert('No Token', 'Push token not available yet');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Notices {unreadCount > 0 && `(${unreadCount} unread)`}
        </Text>
        <View style={styles.headerButtons}>
          {notifications.length > 0 && (
            <>
              <TouchableOpacity style={styles.button} onPress={markAllAsRead}>
                <Text style={styles.buttonText}>Mark All Read</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.tokenButton} onPress={showToken}>
            <Text style={styles.tokenButtonText}>Show Token</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testButton} onPress={sendTestNotification}>
            <Text style={styles.testButtonText}>Test Local</Text>
          </TouchableOpacity>
        </View>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubtext}>
            Push notifications will appear here
          </Text>
          {pushToken && (
            <Text style={styles.tokenPreview}>
              Token ready: {pushToken.substring(0, 20)}...
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          style={styles.notificationsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa'
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  headerButtons: { 
    flexDirection: 'row', 
    gap: 8, 
    flexWrap: 'wrap' 
  },
  button: { 
    backgroundColor: '#1a73e8', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 4 
  },
  buttonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  clearButton: { 
    backgroundColor: '#dc3545', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 4 
  },
  clearButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  tokenButton: { 
    backgroundColor: '#28a745', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 4 
  },
  tokenButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  testButton: { 
    backgroundColor: '#ffc107', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 4 
  },
  testButtonText: { color: '#000', fontSize: 12, fontWeight: '600' },
  emptyState: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 16 
  },
  emptyText: { fontSize: 16, color: '#666', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#999', textAlign: 'center' },
  tokenPreview: { fontSize: 12, color: '#28a745', marginTop: 16, fontFamily: 'monospace' },
  notificationsList: { flex: 1 },
  notificationItem: { 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    position: 'relative'
  },
  unreadItem: { backgroundColor: '#f8f9ff' },
  notificationHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 8 
  },
  notificationTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#333',
    flex: 1,
    marginRight: 8
  },
  timestamp: { fontSize: 12, color: '#999' },
  notificationBody: { fontSize: 14, color: '#666', lineHeight: 20 },
  unreadDot: { 
    position: 'absolute', 
    top: 16, 
    right: 16, 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: '#1a73e8' 
  },
});

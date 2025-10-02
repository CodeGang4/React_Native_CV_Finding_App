import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function NotificationScreen() {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'application',
            title: 'Đơn ứng tuyển mới',
            message: 'Nguyễn Văn A đã ứng tuyển vị trí Frontend Developer',
            time: '5 phút trước',
            isRead: false,
            avatar: null
        },
        {
            id: 2,
            type: 'interview',
            title: 'Lịch phỏng vấn',
            message: 'Cuộc phỏng vấn với Trần Thị B sẽ diễn ra lúc 14:00 ngày mai',
            time: '1 giờ trước',
            isRead: false,
            avatar: null
        },
        {
            id: 3,
            type: 'system',
            title: 'Tin đăng sắp hết hạn',
            message: 'Tin tuyển dụng "React Native Developer" sẽ hết hạn trong 3 ngày',
            time: '2 giờ trước',
            isRead: true,
            avatar: null
        },
        {
            id: 4,
            type: 'application',
            title: 'Đơn ứng tuyển mới',
            message: 'Lê Văn C đã ứng tuyển vị trí UI/UX Designer',
            time: '1 ngày trước',
            isRead: true,
            avatar: null
        },
    ]);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'application': return 'person-add';
            case 'interview': return 'schedule';
            case 'system': return 'info';
            default: return 'notifications';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'application': return '#4CAF50';
            case 'interview': return '#FF9800';
            case 'system': return '#2196F3';
            default: return '#666';
        }
    };

    const markAsRead = (notificationId) => {
        setNotifications(prev => 
            prev.map(notif => 
                notif.id === notificationId ? { ...notif, isRead: true } : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => 
            prev.map(notif => ({ ...notif, isRead: true }))
        );
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#2196F3" />
            
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Thông báo</Text>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
                        <Text style={styles.markAllText}>Đánh dấu đã đọc</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {notifications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="notifications-none" size={64} color="#ccc" />
                        <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
                        <Text style={styles.emptySubtitle}>
                            Các thông báo về ứng viên và hoạt động tuyển dụng sẽ hiện ở đây
                        </Text>
                    </View>
                ) : (
                    notifications.map((notification) => (
                        <TouchableOpacity
                            key={notification.id}
                            style={[
                                styles.notificationItem,
                                !notification.isRead && styles.unreadItem
                            ]}
                            onPress={() => markAsRead(notification.id)}
                        >
                            <View style={[
                                styles.iconContainer,
                                { backgroundColor: getNotificationColor(notification.type) + '20' }
                            ]}>
                                <MaterialIcons
                                    name={getNotificationIcon(notification.type)}
                                    size={24}
                                    color={getNotificationColor(notification.type)}
                                />
                            </View>
                            
                            <View style={styles.contentContainer}>
                                <View style={styles.titleRow}>
                                    <Text style={[
                                        styles.title,
                                        !notification.isRead && styles.unreadTitle
                                    ]}>
                                        {notification.title}
                                    </Text>
                                    {!notification.isRead && (
                                        <View style={styles.unreadDot} />
                                    )}
                                </View>
                                <Text style={styles.message} numberOfLines={2}>
                                    {notification.message}
                                </Text>
                                <Text style={styles.time}>{notification.time}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
                
                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    markAllButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    markAllText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        lineHeight: 20,
    },
    notificationItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    unreadItem: {
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
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
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    unreadTitle: {
        fontWeight: 'bold',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2196F3',
        marginLeft: 8,
        marginTop: 4,
    },
    message: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 8,
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
});
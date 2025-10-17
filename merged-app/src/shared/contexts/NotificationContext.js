import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import notificationApiService from '../services/api/NotificationApiService';
import notificationTriggerService from '../services/business/NotificationTriggerService';
import { useAuth } from './AuthContext'; // Import AuthContext

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { user, userRole } = useAuth(); // Get user and role from AuthContext
    const [notifications, setNotifications] = useState([]);
    const [pushToken, setPushToken] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const pollingIntervalRef = useRef(null);

    // Fetch notifications from backend
    const fetchNotifications = async (userId, options = {}) => {
        if (!userId) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await notificationApiService.getUserNotifications(userId, options);
            
            if (response.success) {
                // Transform backend data to match frontend format
                const transformedNotifications = response.data.map(notification => ({
                    id: notification.id,
                    title: notification.title,
                    body: notification.message,
                    data: notification.data || {},
                    timestamp: new Date(notification.created_at),
                    read: notification.is_read,
                    type: notification.type,
                    sender: notification.sender
                }));
                
                setNotifications(transformedNotifications);
                setUnreadCount(response.unread_count || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Refresh notifications
    const refreshNotifications = () => {
        if (user?.id) {
            fetchNotifications(user.id);
        }
    };

    // Start polling for notifications
    const startPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        pollingIntervalRef.current = setInterval(() => {
            if (user?.id) {
                console.log('NotificationContext: Polling for new notifications...');
                fetchNotifications(user.id);
            }
        }, 30000); // Poll every 30 seconds
    };

    // Stop polling
    const stopPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    };

    // Add new notification
    const addNotification = (notification) => {
        const newNotification = {
            id: notification.request?.identifier || Date.now().toString(),
            title: notification.request?.content?.title || 'New Notification',
            body: notification.request?.content?.body || '',
            data: notification.request?.content?.data || {},
            timestamp: new Date(),
            read: false,
        };

        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
    };

    // Mark notification as read
    const markAsRead = async (notificationId) => {
        if (!user?.id) {
            console.log('NotificationContext: Cannot mark as read - no user ID');
            return;
        }

        console.log('NotificationContext: Marking notification as read:', notificationId, 'for user:', user.id);

        try {
            const response = await notificationApiService.markAsRead(notificationId, user.id);
            console.log('NotificationContext: Mark as read response:', response);
            
            if (response && (response.success || response.data)) {
                setNotifications(prev =>
                    prev.map(notif =>
                        notif.id === notificationId
                            ? { ...notif, read: true }
                            : notif
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
                console.log('NotificationContext: Successfully marked notification as read');
            } else {
                console.log('NotificationContext: Unexpected response format:', response);
                // Still update UI optimistically even if response format is unexpected
                setNotifications(prev =>
                    prev.map(notif =>
                        notif.id === notificationId
                            ? { ...notif, read: true }
                            : notif
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('NotificationContext: Error marking notification as read:', error);
            setError(error.message);
            
            // Show user-friendly error
            if (error.message.includes('404')) {
                console.log('NotificationContext: Notification not found, removing from UI');
                setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
            }
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        if (!user?.id) {
            console.log('NotificationContext: Cannot mark all as read - no user ID');
            return;
        }

        console.log('NotificationContext: Marking all notifications as read for user:', user.id);

        try {
            const response = await notificationApiService.markAllAsRead(user.id);
            console.log('NotificationContext: Mark all as read response:', response);
            
            if (response && (response.success || response.updated_count !== undefined)) {
                setNotifications(prev =>
                    prev.map(notif => ({ ...notif, read: true }))
                );
                setUnreadCount(0);
                console.log('NotificationContext: Successfully marked all notifications as read');
            } else {
                console.log('NotificationContext: Unexpected response format:', response);
                // Still update UI optimistically
                setNotifications(prev =>
                    prev.map(notif => ({ ...notif, read: true }))
                );
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('NotificationContext: Error marking all notifications as read:', error);
            setError(error.message);
        }
    };

    // Delete notification
    const deleteNotification = async (notificationId) => {
        if (!user?.id) {
            console.log('NotificationContext: Cannot delete notification - no user ID');
            return;
        }

        console.log('NotificationContext: Deleting notification:', notificationId, 'for user:', user.id);

        try {
            const response = await notificationApiService.deleteNotification(notificationId, user.id);
            console.log('NotificationContext: Delete notification response:', response);
            
            if (response && (response.success || response.message)) {
                setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
                setUnreadCount(prev => {
                    const deletedNotification = notifications.find(n => n.id === notificationId);
                    return deletedNotification && !deletedNotification.read ? Math.max(0, prev - 1) : prev;
                });
                console.log('NotificationContext: Successfully deleted notification');
            } else {
                console.log('NotificationContext: Unexpected response format:', response);
                // Still update UI optimistically
                setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
                setUnreadCount(prev => {
                    const deletedNotification = notifications.find(n => n.id === notificationId);
                    return deletedNotification && !deletedNotification.read ? Math.max(0, prev - 1) : prev;
                });
            }
        } catch (error) {
            console.error('NotificationContext: Error deleting notification:', error);
            setError(error.message);
            
            // If 404, notification doesn't exist, remove from UI anyway
            if (error.message.includes('404')) {
                console.log('NotificationContext: Notification not found, removing from UI anyway');
                setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
            }
        }
    };

    // Clear all notifications (local only)
    const clearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    // Create notification
    const createNotification = async (notificationData) => {
        try {
            const response = await notificationApiService.createNotification(notificationData);
            
            if (response.success) {
                // Refresh notifications to get the new one
                refreshNotifications();
                return response.data;
            }
        } catch (error) {
            console.error('Error creating notification:', error);
            setError(error.message);
        }
    };

    // Test notification - improved to use backend
    const sendTestNotification = async () => {
        if (user?.id && userRole) {
            try {
                // Use the trigger service for realistic test
                await notificationTriggerService.triggerTestNotification(user.id, userRole);
                
                // Refresh notifications to show the new one
                setTimeout(() => {
                    refreshNotifications();
                }, 1000);
                
                console.log('Backend test notification created successfully');
            } catch (error) {
                console.error('Error creating backend test notification:', error);
                
                // Fallback to local notification
                try {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: "Local Test Notification",
                            body: "This is a local test notification!",
                            data: { testData: 'local notification test' },
                        },
                        trigger: { seconds: 1 },
                    });
                    console.log('Local test notification scheduled');
                } catch (localError) {
                    console.error('Error sending local test notification:', localError);
                }
            }
        } else {
            console.log('NotificationContext: Cannot send test notification - no user data');
        }
    };

    // Register for push notifications
    const registerForPushNotifications = async () => {
        try {
            // Check if we're on a physical device
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            // Request permission if not granted
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                throw new Error('Permission not granted for push notifications');
            }

            // Try to get the token with error handling for missing projectId
            try {
                const tokenData = await Notifications.getExpoPushTokenAsync({
                    projectId: '1ae121a7-b864-4b16-9cfb-474994d6b511', // You'll need to replace this with actual project ID
                });
                setPushToken(tokenData.data);
                console.log('Push token:', tokenData.data);
                return tokenData.data;
            } catch (tokenError) {
                console.warn('Could not get push token:', tokenError.message);

                // For development/testing, we can still set up local notifications
                if (tokenError.message.includes('projectId')) {
                    console.log('Missing projectId - notifications will work locally but not for remote push');
                    setPushToken('LOCAL_NOTIFICATIONS_ONLY');
                    return 'LOCAL_NOTIFICATIONS_ONLY';
                }
                throw tokenError;
            }

        } catch (error) {
            console.error('Error registering for push notifications:', error);
            // Don't throw the error - just log it and continue with local functionality
            setPushToken(null);
            return null;
        }
    };

    useEffect(() => {
        // Register for push notifications on mount
        registerForPushNotifications().catch(console.error);

        // Listen for notifications when app is in foreground
        const notificationListener = Notifications.addNotificationReceivedListener(addNotification);

        // Listen for notification responses (when user taps notification)
        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            const notification = response.notification;
            addNotification(notification);
        });

        return () => {
            // Safe cleanup - check if functions exist
            if (Notifications.removeNotificationSubscription) {
                Notifications.removeNotificationSubscription(notificationListener);
                Notifications.removeNotificationSubscription(responseListener);
            } else if (notificationListener?.remove) {
                // Alternative cleanup method for newer versions
                notificationListener.remove();
                responseListener.remove();
            }
        };
    }, []);

    // Effect to fetch notifications when user changes
    useEffect(() => {
        if (user?.id) {
            console.log('NotificationContext: User logged in, fetching notifications for:', user.id, 'role:', userRole);
            fetchNotifications(user.id);
            startPolling(); // Start polling when user is logged in
        } else {
            // Clear notifications when user logs out
            console.log('NotificationContext: User logged out, clearing notifications');
            setNotifications([]);
            setUnreadCount(0);
            setError(null);
            setLoading(false);
            stopPolling(); // Stop polling when user logs out
        }

        // Cleanup polling on unmount or user change
        return () => {
            stopPolling();
        };
    }, [user?.id, userRole]);

    // Clear error after 10 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const value = {
        notifications,
        pushToken,
        unreadCount,
        loading,
        error,
        user, // Current user from AuthContext
        userRole, // Current user role from AuthContext
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        createNotification,
        sendTestNotification,
        registerForPushNotifications,
        fetchNotifications,
        refreshNotifications,
        startPolling,
        stopPolling,
        // Trigger services for external use
        triggerJobSaved: notificationTriggerService.triggerJobSavedNotification,
        triggerJobApplication: notificationTriggerService.triggerJobApplicationNotification,
        triggerNewJob: notificationTriggerService.triggerNewJobNotification,
        triggerProfileView: notificationTriggerService.triggerProfileViewNotification,
        triggerSystemNotification: notificationTriggerService.triggerSystemNotification,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
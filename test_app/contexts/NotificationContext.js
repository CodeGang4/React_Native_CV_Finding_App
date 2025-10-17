import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';

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
  const [notifications, setNotifications] = useState([]);
  const [pushToken, setPushToken] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

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
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Test local notification (works without projectId)
  const sendTestNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: "This is a test notification from your app!",
          data: { testData: 'local notification test' },
        },
        trigger: { seconds: 1 },
      });
      console.log('Test notification scheduled');
    } catch (error) {
      console.error('Error sending test notification:', error);
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
          projectId: 'your-project-id-here', // You'll need to replace this with actual project ID
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
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const value = {
    notifications,
    pushToken,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    sendTestNotification,
    registerForPushNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
const admin = require("../supabase/firebaseConfig");
const NotificationRepository = require('../repositories/AdminRepositories/Notification.repository');
const NotificationCache = require('../cache/AdminCache/Notification.cache');
const {AppError} = require('../utils/errorHandler');

class NotificationService {
    /**
     * Send Firebase push notification
     */
    static async sendPushNotification(token, title, body, data = {}) {
        const message = {
            token,
            notification: { title, body },
            data
        };

        try {
            const response = await admin.messaging().send(message);
            console.log(" Notification sent successfully:", response);
            return response;
        } catch (error) {
            console.error(" Error sending push notification:", error);
            throw new AppError('Failed to send push notification', 500);
        }
    }

    /**
     * Create database notification
     */
    static async createNotification(notificationData) {
        const { recipient_id, recipient_type, sender_id, sender_type, type, title, message, data } = notificationData;

        if (!recipient_id || !recipient_type || !type || !title || !message) {
            throw new AppError('Missing required fields: recipient_id, recipient_type, type, title, message', 400);
        }

        const notification = await NotificationRepository.createNotification({
            recipient_id,
            recipient_type,
            sender_id,
            sender_type,
            type,
            title,
            message,
            data: data || {}
        });

        await NotificationCache.invalidateUserCache(recipient_id);
        await NotificationCache.incrementUnreadCount(recipient_id);

        return notification;
    }

    /**
     * Get user notifications with filters
     */
    static async getUserNotifications(userId, filters = {}) {
        const cached = await NotificationCache.getCachedUserNotifications(userId, filters);
        if (cached) {
            return cached;
        }

        const notifications = await NotificationRepository.getUserNotifications(userId, filters);
        await NotificationCache.cacheUserNotifications(userId, notifications, filters);

        return notifications;
    }

    /**
     * Get unread count
     */
    static async getUnreadCount(userId) {
        const cached = await NotificationCache.getCachedUnreadCount(userId);
        if (cached !== null) {
            return cached;
        }

        const count = await NotificationRepository.getUnreadCount(userId);
        await NotificationCache.cacheUnreadCount(userId, count);

        return count;
    }

    /**
     * Mark notification as read
     */
    static async markAsRead(notificationId, userId) {
        const notification = await NotificationRepository.markAsRead(notificationId, userId);
        
        await NotificationCache.invalidateUserCache(userId);
        await NotificationCache.decrementUnreadCount(userId, 1);

        return notification;
    }

    /**
     * Mark all notifications as read
     */
    static async markAllAsRead(userId) {
        const notifications = await NotificationRepository.markAllAsRead(userId);
        
        await NotificationCache.invalidateUserCache(userId);
        await NotificationCache.cacheUnreadCount(userId, 0);

        return notifications;
    }

    /**
     * Delete notification (archive)
     */
    static async deleteNotification(notificationId, userId) {
        const notification = await NotificationRepository.archiveNotification(notificationId, userId);
        await NotificationCache.invalidateUserCache(userId);

        return notification;
    }

    /**
     * Send system notification (broadcast)
     */
    static async sendSystemNotification(notificationData) {
        const { sender_id, role = 'all', type, title, message, data = {}, send_push = false } = notificationData;

        if (!type || !title || !message) {
            throw new AppError('Missing required fields: type, title, message', 400);
        }

        // Get target users
        const users = await NotificationRepository.getUsersByRole(role);

        if (users.length === 0) {
            throw new AppError('No users found for the specified role', 404);
        }

        // Create notifications for all users
        const notifications = users.map(user => ({
            recipient_id: user.id,
            recipient_type: user.role,
            sender_id,
            sender_type: 'system',
            type,
            title,
            message,
            data
        }));

        const created = await NotificationRepository.bulkCreateNotifications(notifications);

        // Invalidate cache and update unread counts
        for (const user of users) {
            await NotificationCache.invalidateUserCache(user.id);
            await NotificationCache.incrementUnreadCount(user.id);
        }

        return {
            sent_count: created.length,
            notifications: created
        };
    }
}

module.exports = NotificationService;
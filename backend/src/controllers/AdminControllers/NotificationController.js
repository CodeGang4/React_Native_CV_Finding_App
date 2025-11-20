const NotificationService = require('../../services/NotificationService');
const { asyncHandler } = require('../../utils/errorHandler');
const { sendData } = require('../../utils/response');

class NotificationController {
    sendPushNotification = asyncHandler(async (req, res) => {
        const result = await NotificationService.sendPushNotification(req.body.token, req.body.title, req.body.body, req.body.data);
        sendData(res, { message: 'Notification sent successfully', messageId: result }, 200);
    });

    createNotification = asyncHandler(async (req, res) => {
        const notification = await NotificationService.createNotification(req.body);
        sendData(res, notification, 201);
    });

    getUserNotifications = asyncHandler(async (req, res) => {
        const notifications = await NotificationService.getUserNotifications(req.params.userId, req.query);
        const unreadCount = await NotificationService.getUnreadCount(req.params.userId);
        sendData(res, { 
            notifications, 
            pagination: { page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20 },
            unread_count: unreadCount 
        }, 200);
    });

    markAsRead = asyncHandler(async (req, res) => {
        const notification = await NotificationService.markAsRead(req.params.notificationId, req.body.userId);
        sendData(res, notification, 200);
    });

    markAllAsRead = asyncHandler(async (req, res) => {
        const notifications = await NotificationService.markAllAsRead(req.params.userId);
        sendData(res, { message: `Marked ${notifications.length} notifications as read`, updated_count: notifications.length }, 200);
    });

    deleteNotification = asyncHandler(async (req, res) => {
        await NotificationService.deleteNotification(req.params.notificationId, req.body.userId);
        sendData(res, { message: 'Notification deleted successfully' }, 200);
    });

    sendSystemNotification = asyncHandler(async (req, res) => {
        const result = await NotificationService.sendSystemNotification(req.body);
        sendData(res, { message: `Sent notification to ${result.sent_count} users`, ...result }, 201);
    });
}

module.exports = new NotificationController();
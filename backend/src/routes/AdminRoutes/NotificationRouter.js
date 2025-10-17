const express = require('express');
const router = express.Router();
const NotificationController = require('../../controllers/AdminControllers/NotificationController');

// Middleware
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Routes for notifications

// Firebase push notification (legacy)
router.post('/send-push', NotificationController.sendPushNotification);

// Database notifications
router.post('/create', NotificationController.createNotification);
router.get('/user/:userId', NotificationController.getUserNotifications);
router.put('/read/:notificationId', NotificationController.markAsRead);
router.put('/read-all/:userId', NotificationController.markAllAsRead);
router.delete('/:notificationId', NotificationController.deleteNotification);

// System notifications (Admin only)
router.post('/system/broadcast', NotificationController.sendSystemNotification);

module.exports = router;

import apiClient from "./ApiClient.js";

class NotificationApiService {
    static endpoint = "/notice";

    async getUserNotifications(userId, options = {}) {
        try {
            const params = {
                page: (options.page || 1).toString(),
                limit: (options.limit || 20).toString(),
                unread_only: (options.unread_only || false).toString()
            };

            if (options.type) {
                params.type = options.type;
            }

            const response = await apiClient.get(`${NotificationApiService.endpoint}/user/${userId}`, {
                params
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching user notifications:', error);
            throw error;
        }
    }

    async createNotification(notificationData) {
        try {
            const response = await apiClient.post(`${NotificationApiService.endpoint}/create`, notificationData);
            return response.data;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    async markAsRead(notificationId, userId) {
        try {
            const response = await apiClient.put(`${NotificationApiService.endpoint}/read/${notificationId}`, {
                userId: userId
            });
            return response.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    async markAllAsRead(userId) {
        try {
            const response = await apiClient.put(`${NotificationApiService.endpoint}/read-all/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    async deleteNotification(notificationId, userId) {
        try {
            const response = await apiClient.delete(`${NotificationApiService.endpoint}/${notificationId}`, {
                data: { userId: userId }
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }

    async sendSystemNotification(systemNotificationData) {
        try {
            const response = await apiClient.post(`${NotificationApiService.endpoint}/system/broadcast`, systemNotificationData);
            return response.data;
        } catch (error) {
            console.error('Error sending system notification:', error);
            throw error;
        }
    }
}

const notificationApiService = new NotificationApiService();
export default notificationApiService;
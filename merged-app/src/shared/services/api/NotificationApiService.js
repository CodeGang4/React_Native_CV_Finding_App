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
            // Validate required fields
            if (!notificationData.recipient_id) {
                throw new Error('recipient_id is required');
            }
            if (!notificationData.recipient_type) {
                throw new Error('recipient_type is required');
            }
            if (!notificationData.title) {
                throw new Error('title is required');
            }
            if (!notificationData.message) {
                throw new Error('message is required');
            }
            
            // Ensure recipient_type is valid
            const validTypes = ['candidate', 'employer'];
            if (!validTypes.includes(notificationData.recipient_type)) {
                console.warn(`⚠️ Invalid recipient_type: ${notificationData.recipient_type}, defaulting to 'candidate'`);
                notificationData.recipient_type = 'candidate';
            }
            
            // Ensure type field has a default value
            if (!notificationData.type) {
                notificationData.type = 'other';
            }
            
            // Create payload with both snake_case and camelCase for backend compatibility
            const payload = {
                // Snake case (database column names)
                recipient_id: notificationData.recipient_id,
                recipient_type: notificationData.recipient_type,
                title: notificationData.title,
                message: notificationData.message,
                type: notificationData.type,
                data: notificationData.data,
                // Camel case (just in case backend expects this)
                recipientId: notificationData.recipient_id,
                recipientType: notificationData.recipient_type,
            };
            
            console.log('🔔 [NotificationApiService] Creating notification for:', payload.recipient_type, payload.recipient_id);
            
            const response = await apiClient.post(`${NotificationApiService.endpoint}/create`, payload);
            
            console.log('✅ [NotificationApiService] Notification created successfully:', response.data);
            return response.data;
        } catch (error) {
            // Log detailed error info
            console.error('❌ [NotificationApiService] Error creating notification:', error.message);
            
            if (error.response) {
                console.error('📋 Response status:', error.response.status);
                console.error('📋 Response data:', error.response.data);
            }
            
            // Don't throw - return error object instead to prevent app crash
            return {
                success: false,
                error: error.message,
                status: error.response?.status
            };
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
import apiClient from "./ApiClient.js";

/**
 * User API Service - Handles user-related API calls
 */
export class UserApiService {
  static endpoint = "/users";

  // Get user by ID
  static async getUserById(userId) {
    const response = await apiClient.get(`${this.endpoint}/${userId}`);
    return response.data;
  }

  // Update user
  static async updateUser(userId, userData) {
    const response = await apiClient.put(
      `${this.endpoint}/${userId}`,
      userData
    );
    return response.data;
  }

  // Delete user
  static async deleteUser(userId) {
    const response = await apiClient.delete(`${this.endpoint}/${userId}`);
    return response.data;
  }

  // Get user settings
  static async getUserSettings(userId) {
    const response = await apiClient.get(`${this.endpoint}/${userId}/settings`);
    return response.data;
  }

  // Update user settings
  static async updateUserSettings(userId, settings) {
    const response = await apiClient.put(
      `${this.endpoint}/${userId}/settings`,
      settings
    );
    return response.data;
  }

  // Upload user avatar
  static async uploadAvatar(userId, imageFile) {
    const formData = new FormData();
    formData.append("avatar", imageFile);

    const response = await apiClient.post(
      `${this.endpoint}/${userId}/avatar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  // Get user statistics
  static async getUserStats(userId) {
    const response = await apiClient.get(`${this.endpoint}/${userId}/stats`);
    return response.data;
  }

  // Get user activity history
  static async getUserActivity(userId, page = 1, limit = 20) {
    const response = await apiClient.get(
      `${this.endpoint}/${userId}/activity`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  }

  // Get user notifications
  static async getUserNotifications(userId, page = 1, limit = 20) {
    const response = await apiClient.get(
      `${this.endpoint}/${userId}/notifications`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  }

  // Mark notification as read
  static async markNotificationAsRead(userId, notificationId) {
    const response = await apiClient.put(
      `${this.endpoint}/${userId}/notifications/${notificationId}/read`
    );
    return response.data;
  }

  // Update notification settings
  static async updateNotificationSettings(userId, settings) {
    const response = await apiClient.put(
      `${this.endpoint}/${userId}/notification-settings`,
      settings
    );
    return response.data;
  }
}

export default UserApiService;

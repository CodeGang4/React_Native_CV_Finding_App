import apiClient from "./ApiClient.js";

/**
 * User API Service - Handles user-related API calls
 */
export class UserApiService {
  static endpoint = "/client/user";

  // Get user profile by ID
  static async getUserById(userId) {
    const response = await apiClient.get(`${this.endpoint}/getInfor/${userId}`);
    return response.data;
  }

  // Update user profile
  static async updateUser(userId, userData) {
    const response = await apiClient.post(
      `${this.endpoint}/updateProfile/${userId}`,
      userData
    );
    return response.data;
  }

  // Update user information (role, etc.)
  static async updateUserInfo(userId, userInfo) {
    const response = await apiClient.post(
      `${this.endpoint}/updateInfor/${userId}`,
      userInfo
    );
    return response.data;
  }

  // Get user profile (alias for getUserById)
  static async getUserProfile(userId) {
    return this.getUserById(userId);
  }

  // Upload user portfolio
  static async uploadPortfolio(userId, portfolioFile) {
    const formData = new FormData();
    formData.append("portfolio", portfolioFile);

    const response = await apiClient.post(
      `${this.endpoint}/uploadPortfolio/${userId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  // Upload user CV
  static async uploadCV(userId, cvFile) {
    const formData = new FormData();
    formData.append("cv", cvFile);

    const response = await apiClient.post(
      `${this.endpoint}/uploadCV/${userId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  // Features not implemented in backend yet
  // Use NotificationApiService for notifications
}

export default UserApiService;

import apiClient from "./ApiClient.js";

/**
 * Auth API Service - Handles authentication-related API calls
 */
export class AuthApiService {
  static endpoint = "/client/auth";

  // Login
  static async login(email, password) {
    const response = await apiClient.post(`${this.endpoint}/login`, {
      email,
      password,
    });
    return response.data;
  }

  // Register
  static async register(userData) {
    const response = await apiClient.post(
      `${this.endpoint}/register`,
      userData
    );
    return response.data;
  }

  // Logout
  static async logout() {
    const response = await apiClient.post(`${this.endpoint}/logout`);
    return response.data;
  }

  // Refresh token
  static async refreshToken(refreshToken) {
    const response = await apiClient.post(`${this.endpoint}/refresh`, {
      refreshToken,
    });
    return response.data;
  }

  // Forgot password
  static async forgotPassword(email) {
    const response = await apiClient.post(`${this.endpoint}/forgot-password`, {
      email,
    });
    return response.data;
  }

  // Reset password
  static async resetPassword(token, newPassword) {
    const response = await apiClient.post(`${this.endpoint}/reset-password`, {
      token,
      newPassword,
    });
    return response.data;
  }

  // Verify email
  static async verifyEmail(token) {
    const response = await apiClient.post(`${this.endpoint}/verify-email`, {
      token,
    });
    return response.data;
  }

  // Change password
  static async changePassword(currentPassword, newPassword) {
    const response = await apiClient.post(`${this.endpoint}/change-password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  // Get user profile
  static async getProfile() {
    const response = await apiClient.get(`${this.endpoint}/profile`);
    return response.data;
  }

  // Update user profile
  static async updateProfile(profileData) {
    const response = await apiClient.put(
      `${this.endpoint}/profile`,
      profileData
    );
    return response.data;
  }
}

export default AuthApiService;

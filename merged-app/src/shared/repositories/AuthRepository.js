import BaseRepository from "./BaseRepository.js";
import { AuthApiService } from "../services/api/AuthApiService.js";

/**
 * Auth Repository - Handles authentication data operations with caching
 */
export class AuthRepository extends BaseRepository {
  constructor() {
    super("auth");
  }

  // Login
  async login(email, password) {
    const cacheKey = `login_${email}`;

    try {
      const result = await AuthApiService.login(email, password);

      // Cache user data after successful login
      this.setCache(`user_${result.user.id}`, result.user);
      this.setCache("current_user", result.user);

      return result;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Register
  async register(userData) {
    try {
      const result = await AuthApiService.register(userData);

      // Cache user data after successful registration
      if (result.user) {
        this.setCache(`user_${result.user.id}`, result.user);
        this.setCache("current_user", result.user);
      }

      return result;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      const result = await AuthApiService.logout();

      // Clear auth-related cache
      this.clearCache("current_user");
      this.clearCacheByPattern("user_");

      return result;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  // Refresh token
  async refreshToken(refreshToken) {
    try {
      const result = await AuthApiService.refreshToken(refreshToken);

      // Update cached user data
      if (result.user) {
        this.setCache(`user_${result.user.id}`, result.user);
        this.setCache("current_user", result.user);
      }

      return result;
    } catch (error) {
      console.error("Refresh token error:", error);
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      return await AuthApiService.forgotPassword(email);
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      return await AuthApiService.resetPassword(token, newPassword);
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      const result = await AuthApiService.verifyEmail(token);

      // Update cached user data
      if (result.user) {
        this.setCache(`user_${result.user.id}`, result.user);
        this.setCache("current_user", result.user);
      }

      return result;
    } catch (error) {
      console.error("Verify email error:", error);
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      return await AuthApiService.changePassword(currentPassword, newPassword);
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  }

  // Get user profile
  async getProfile() {
    const cacheKey = "current_user_profile";

    // Try cache first
    const cached = this.getCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const profile = await AuthApiService.getProfile();

      // Cache the profile
      this.setCache(cacheKey, profile);
      this.setCache("current_user", profile);

      return profile;
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const result = await AuthApiService.updateProfile(profileData);

      // Update cache
      this.setCache("current_user_profile", result);
      this.setCache("current_user", result);
      this.setCache(`user_${result.id}`, result);

      return result;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  }

  // Get current user from cache
  getCurrentUser() {
    return this.getCache("current_user");
  }

  // Set current user in cache
  setCurrentUser(user) {
    this.setCache("current_user", user);
    this.setCache(`user_${user.id}`, user);
  }

  // Clear current user cache
  clearCurrentUser() {
    this.clearCache("current_user");
    this.clearCache("current_user_profile");
  }
}

export default AuthRepository;

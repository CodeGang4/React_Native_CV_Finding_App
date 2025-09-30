import BaseRepository from "./BaseRepository.js";
import { UserApiService } from "../services/api/UserApiService.js";

/**
 * User Repository - Handles user data operations with caching
 */
export class UserRepository extends BaseRepository {
  constructor() {
    super("user");
  }

  // Get user by ID
  async getUserById(userId, forceRefresh = false) {
    const cacheKey = `user_${userId}`;

    // Try cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const user = await UserApiService.getUserById(userId);

      // Cache the user data
      this.setCache(cacheKey, user);

      return user;
    } catch (error) {
      console.error(`Get user ${userId} error:`, error);
      throw error;
    }
  }

  // Update user
  async updateUser(userId, userData) {
    try {
      const result = await UserApiService.updateUser(userId, userData);

      // Update cache
      this.setCache(`user_${userId}`, result);

      // Update current user cache if it's the same user
      const currentUser = this.getCache("current_user");
      if (currentUser && currentUser.id === userId) {
        this.setCache("current_user", result);
      }

      return result;
    } catch (error) {
      console.error(`Update user ${userId} error:`, error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      const result = await UserApiService.deleteUser(userId);

      // Clear user from cache
      this.clearCache(`user_${userId}`);

      // Clear current user cache if it's the same user
      const currentUser = this.getCache("current_user");
      if (currentUser && currentUser.id === userId) {
        this.clearCache("current_user");
      }

      return result;
    } catch (error) {
      console.error(`Delete user ${userId} error:`, error);
      throw error;
    }
  }

  // Get user settings
  async getUserSettings(userId, forceRefresh = false) {
    const cacheKey = `user_settings_${userId}`;

    // Try cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const settings = await UserApiService.getUserSettings(userId);

      // Cache the settings
      this.setCache(cacheKey, settings);

      return settings;
    } catch (error) {
      console.error(`Get user settings ${userId} error:`, error);
      throw error;
    }
  }

  // Update user settings
  async updateUserSettings(userId, settings) {
    try {
      const result = await UserApiService.updateUserSettings(userId, settings);

      // Update cache
      this.setCache(`user_settings_${userId}`, result);

      return result;
    } catch (error) {
      console.error(`Update user settings ${userId} error:`, error);
      throw error;
    }
  }

  // Upload user avatar
  async uploadAvatar(userId, imageFile) {
    try {
      const result = await UserApiService.uploadAvatar(userId, imageFile);

      // Update user cache with new avatar URL
      const cachedUser = this.getCache(`user_${userId}`);
      if (cachedUser) {
        cachedUser.avatarUrl = result.avatarUrl;
        this.setCache(`user_${userId}`, cachedUser);

        // Update current user cache if it's the same user
        const currentUser = this.getCache("current_user");
        if (currentUser && currentUser.id === userId) {
          currentUser.avatarUrl = result.avatarUrl;
          this.setCache("current_user", currentUser);
        }
      }

      return result;
    } catch (error) {
      console.error(`Upload avatar for user ${userId} error:`, error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats(userId, forceRefresh = false) {
    const cacheKey = `user_stats_${userId}`;

    // Try cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const stats = await UserApiService.getUserStats(userId);

      // Cache the stats with shorter TTL (5 minutes)
      this.setCache(cacheKey, stats, 5 * 60 * 1000);

      return stats;
    } catch (error) {
      console.error(`Get user stats ${userId} error:`, error);
      throw error;
    }
  }

  // Get user activity history
  async getUserActivity(userId, page = 1, limit = 20) {
    const cacheKey = `user_activity_${userId}_${page}_${limit}`;

    // Try cache first
    const cached = this.getCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const activity = await UserApiService.getUserActivity(
        userId,
        page,
        limit
      );

      // Cache with shorter TTL (2 minutes)
      this.setCache(cacheKey, activity, 2 * 60 * 1000);

      return activity;
    } catch (error) {
      console.error(`Get user activity ${userId} error:`, error);
      throw error;
    }
  }

  // Get user notifications
  async getUserNotifications(
    userId,
    page = 1,
    limit = 20,
    forceRefresh = false
  ) {
    const cacheKey = `user_notifications_${userId}_${page}_${limit}`;

    // Try cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const notifications = await UserApiService.getUserNotifications(
        userId,
        page,
        limit
      );

      // Cache with shorter TTL (1 minute)
      this.setCache(cacheKey, notifications, 60 * 1000);

      return notifications;
    } catch (error) {
      console.error(`Get user notifications ${userId} error:`, error);
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(userId, notificationId) {
    try {
      const result = await UserApiService.markNotificationAsRead(
        userId,
        notificationId
      );

      // Clear notifications cache to force refresh
      this.clearCacheByPattern(`user_notifications_${userId}_`);

      return result;
    } catch (error) {
      console.error(
        `Mark notification ${notificationId} as read error:`,
        error
      );
      throw error;
    }
  }

  // Update notification settings
  async updateNotificationSettings(userId, settings) {
    try {
      const result = await UserApiService.updateNotificationSettings(
        userId,
        settings
      );

      // Update user settings cache
      const cachedSettings = this.getCache(`user_settings_${userId}`);
      if (cachedSettings) {
        cachedSettings.notifications = result;
        this.setCache(`user_settings_${userId}`, cachedSettings);
      }

      return result;
    } catch (error) {
      console.error(
        `Update notification settings for user ${userId} error:`,
        error
      );
      throw error;
    }
  }

  // Clear user cache
  clearUserCache(userId) {
    this.clearCache(`user_${userId}`);
    this.clearCache(`user_settings_${userId}`);
    this.clearCache(`user_stats_${userId}`);
    this.clearCacheByPattern(`user_activity_${userId}_`);
    this.clearCacheByPattern(`user_notifications_${userId}_`);
  }
}

export default UserRepository;

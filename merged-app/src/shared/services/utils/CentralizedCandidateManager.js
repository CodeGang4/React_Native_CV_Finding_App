/**
 * Centralized Candidate Count Manager for merged-app
 * Giải quyết hoàn toàn HTTP 429 errors
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

class CentralizedCandidateManager {
  constructor() {
    this.jobCandidateCounts = new Map();
    this.subscribers = new Map();
    this.isUpdating = false;
    this.lastUpdateTime = 0;
    this.updateInterval = 30000; // 30 giây
    this.batchUpdateTimer = null;
    this.pendingJobIds = new Set();

    // Import ApplicationRepository dynamically để tránh circular imports
    this.applicationRepository = null;
    this.initializeRepository();

    // Auto update interval
    this.startAutoUpdate();
  }

  static getInstance() {
    if (!CentralizedCandidateManager.instance) {
      CentralizedCandidateManager.instance = new CentralizedCandidateManager();
    }
    return CentralizedCandidateManager.instance;
  }

  async initializeRepository() {
    try {
      const { default: ApplicationRepository } = await import(
        "../../repositories/ApplicationRepository"
      );
      this.applicationRepository = ApplicationRepository;
      console.log(" ApplicationRepository initialized successfully");
    } catch (error) {
      console.error(" Failed to initialize ApplicationRepository:", error);
      // Try alternative import path
      try {
        const ApplicationRepository = await import(
          "../../repositories/ApplicationRepository"
        ).then((module) => module.ApplicationRepository || module.default);
        this.applicationRepository = ApplicationRepository;
        console.log(" ApplicationRepository initialized with fallback");
      } catch (fallbackError) {
        console.error(
          " Fallback ApplicationRepository import also failed:",
          fallbackError
        );
      }
    }
  }

  /**
   * Subscribe component để nhận updates real-time
   */
  subscribe(jobId, callback) {
    if (!this.subscribers.has(jobId)) {
      this.subscribers.set(jobId, new Set());
    }
    this.subscribers.get(jobId).add(callback);

    // Thêm vào pending để update batch
    this.pendingJobIds.add(jobId);
    this.scheduleBatchUpdate();

    // Trả về current data nếu có
    const currentData = this.jobCandidateCounts.get(jobId);
    if (currentData) {
      callback(currentData);
    }

    // Return unsubscribe function
    return () => {
      const jobSubscribers = this.subscribers.get(jobId);
      if (jobSubscribers) {
        jobSubscribers.delete(callback);
        if (jobSubscribers.size === 0) {
          this.subscribers.delete(jobId);
        }
      }
    };
  }

  /**
   * Lên lịch batch update để tránh spam requests
   */
  scheduleBatchUpdate() {
    if (this.batchUpdateTimer) {
      clearTimeout(this.batchUpdateTimer);
    }

    this.batchUpdateTimer = setTimeout(() => {
      this.performBatchUpdate();
    }, 500); // Đợi 500ms để collect thêm requests
  }

  /**
   * Thực hiện batch update cho tất cả jobs cần data
   */
  async performBatchUpdate() {
    if (this.isUpdating || this.pendingJobIds.size === 0) {
      return;
    }

    // Check if ApplicationRepository is available
    if (!this.applicationRepository) {
      console.warn(
        " ApplicationRepository not available, skipping batch update"
      );
      // Still notify subscribers with default data to prevent hanging UI
      const jobIds = Array.from(this.pendingJobIds);
      this.pendingJobIds.clear();

      jobIds.forEach((jobId) => {
        const subscribers = this.subscribers.get(jobId);
        if (subscribers) {
          const defaultData = this.getDefaultCounts();
          subscribers.forEach((callback) => {
            try {
              callback(defaultData);
            } catch (error) {
              console.error("Error calling subscriber callback:", error);
            }
          });
        }
      });
      return;
    }

    const jobIds = Array.from(this.pendingJobIds);
    this.pendingJobIds.clear();
    this.isUpdating = true;

    try {
      console.log(
        `🚀 [CentralizedCandidateManager] Batch updating ${jobIds.length} jobs`
      );

      const results = await this.fetchBatchCandidateCounts(jobIds);

      // Update cache và notify subscribers
      for (const [jobId, counts] of results) {
        this.jobCandidateCounts.set(jobId, {
          ...counts,
          lastUpdated: Date.now(),
        });

        // Save to AsyncStorage for persistence
        await this.saveCacheToStorage(
          jobId,
          this.jobCandidateCounts.get(jobId)
        );

        // Notify all subscribers for this job
        const subscribers = this.subscribers.get(jobId);
        if (subscribers) {
          subscribers.forEach((callback) => {
            try {
              callback(this.jobCandidateCounts.get(jobId));
            } catch (error) {
              console.error("Error calling subscriber callback:", error);
            }
          });
        }
      }

      this.lastUpdateTime = Date.now();
      console.log(
        ` [CentralizedCandidateManager] Updated ${results.size} job counts`
      );
    } catch (error) {
      console.error(
        " [CentralizedCandidateManager] Batch update failed:",
        error
      );

      // Retry với exponential backoff
      const retryDelay = Math.min(
        5000 * Math.pow(2, this.retryAttempts || 0),
        30000
      );
      setTimeout(() => {
        this.pendingJobIds = new Set(jobIds); // Re-add failed jobs
        this.scheduleBatchUpdate();
      }, retryDelay);

      this.retryAttempts = (this.retryAttempts || 0) + 1;
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Fetch candidate counts cho multiple jobs
   */
  async fetchBatchCandidateCounts(jobIds) {
    const results = new Map();

    try {
      // Process từng job với delay để tránh rate limit
      for (const jobId of jobIds) {
        try {
          // Check cache first
          const cached = this.jobCandidateCounts.get(jobId);
          if (cached && Date.now() - cached.lastUpdated < 60000) {
            results.set(jobId, cached);
            continue;
          }

          // Check AsyncStorage cache
          const storageData = await this.loadCacheFromStorage(jobId);
          if (storageData && Date.now() - storageData.lastUpdated < 120000) {
            results.set(jobId, storageData);
            continue;
          }

          // Fetch from repository with safety check
          if (!this.applicationRepository) {
            console.warn(
              ` ApplicationRepository not available for job ${jobId}, using default counts`
            );
            results.set(jobId, this.getDefaultCounts());
            continue;
          }

          const candidates =
            await this.applicationRepository.getCandidatesByJobId(jobId);
          const counts = this.calculateCandidateCounts(candidates);
          results.set(jobId, counts);

          // Delay between requests
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Error fetching candidates for job ${jobId}:`, error);

          // Trả về cached data hoặc default
          const cached = this.jobCandidateCounts.get(jobId);
          results.set(jobId, cached || this.getDefaultCounts());
        }
      }
    } catch (error) {
      console.error("Batch fetch failed:", error);
      throw error;
    }

    return results;
  }

  /**
   * Calculate candidate counts từ raw data
   */
  calculateCandidateCounts(candidates) {
    if (!Array.isArray(candidates)) {
      return this.getDefaultCounts();
    }

    const counts = {
      total: candidates.length,
      submitted: 0,
      reviewed: 0,
      interviewing: 0,
      hired: 0,
    };

    candidates.forEach((candidate) => {
      const status = candidate.status?.toLowerCase();
      switch (status) {
        case "submitted":
        case "applied":
          counts.submitted++;
          break;
        case "reviewed":
        case "under_review":
          counts.reviewed++;
          break;
        case "interviewing":
        case "interview_scheduled":
          counts.interviewing++;
          break;
        case "hired":
        case "accepted":
          counts.hired++;
          break;
      }
    });

    return counts;
  }

  /**
   * Default counts khi không có data
   */
  getDefaultCounts() {
    return {
      total: 0,
      submitted: 0,
      reviewed: 0,
      interviewing: 0,
      hired: 0,
    };
  }

  /**
   * Save cache to AsyncStorage
   */
  async saveCacheToStorage(jobId, data) {
    try {
      await AsyncStorage.setItem(
        `job_candidates_${jobId}`,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error("Failed to save cache to storage:", error);
    }
  }

  /**
   * Load cache from AsyncStorage
   */
  async loadCacheFromStorage(jobId) {
    try {
      const data = await AsyncStorage.getItem(`job_candidates_${jobId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to load cache from storage:", error);
      return null;
    }
  }

  /**
   * Auto update tất cả active subscriptions
   */
  startAutoUpdate() {
    setInterval(() => {
      if (this.subscribers.size > 0 && !this.isUpdating) {
        // Chỉ update jobs có subscribers
        const activeJobIds = Array.from(this.subscribers.keys());
        if (activeJobIds.length > 0) {
          this.pendingJobIds = new Set(activeJobIds);
          this.scheduleBatchUpdate();
        }
      }
    }, this.updateInterval);
  }

  /**
   * Force refresh một job cụ thể
   */
  async refreshJob(jobId) {
    this.pendingJobIds.add(jobId);
    this.scheduleBatchUpdate();
  }

  /**
   * Get current counts cho một job (sync)
   */
  getCurrentCounts(jobId) {
    return this.jobCandidateCounts.get(jobId) || this.getDefaultCounts();
  }

  /**
   * Clear cache và reset state
   */
  clearCache() {
    this.jobCandidateCounts.clear();
    this.pendingJobIds.clear();
    if (this.batchUpdateTimer) {
      clearTimeout(this.batchUpdateTimer);
    }
  }

  /**
   * Get stats cho debugging
   */
  getStats() {
    return {
      cachedJobs: this.jobCandidateCounts.size,
      activeSubscribers: this.subscribers.size,
      pendingUpdates: this.pendingJobIds.size,
      isUpdating: this.isUpdating,
      lastUpdateTime: this.lastUpdateTime,
    };
  }
}

export default CentralizedCandidateManager;

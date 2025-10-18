import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * AI Analysis Cache Manager
 * Quản lý cache kết quả phân tích AI để tiết kiệm quota
 */
export class AnalysisCacheManager {
  static CACHE_PREFIX = "ai_analysis_";
  static CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 giờ (ms)
  static MAX_CACHE_SIZE = 100; // Tối đa 100 kết quả phân tích

  /**
   * Tạo cache key dựa trên thông tin ứng viên và criteria
   */
  static generateCacheKey(candidateId, searchCriteria = {}) {
    const criteriaStr = JSON.stringify(searchCriteria);
    const hash = this.simpleHash(criteriaStr);
    return `${this.CACHE_PREFIX}${candidateId}_${hash}`;
  }

  /**
   * Simple hash function cho cache key
   */
  static simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Lưu kết quả phân tích vào cache
   */
  static async saveAnalysis(candidateId, analysisResult, searchCriteria = {}) {
    try {
      const cacheKey = this.generateCacheKey(candidateId, searchCriteria);
      const cacheData = {
        result: analysisResult,
        timestamp: Date.now(),
        candidateId,
        searchCriteria,
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));

      // Cập nhật danh sách cache keys
      await this.updateCacheIndex(cacheKey);

      console.log(`💾 Cached analysis for candidate ${candidateId}`);
      return true;
    } catch (error) {
      console.error("❌ Error saving analysis cache:", error);
      return false;
    }
  }

  /**
   * Lấy kết quả phân tích từ cache
   */
  static async getAnalysis(candidateId, searchCriteria = {}) {
    try {
      const cacheKey = this.generateCacheKey(candidateId, searchCriteria);
      const cacheData = await AsyncStorage.getItem(cacheKey);

      if (!cacheData) {
        return null;
      }

      const parsedData = JSON.parse(cacheData);
      const now = Date.now();

      // Kiểm tra cache có hết hạn không
      if (now - parsedData.timestamp > this.CACHE_DURATION) {
        await this.removeAnalysis(candidateId, searchCriteria);
        console.log(`⏰ Cache expired for candidate ${candidateId}`);
        return null;
      }

      console.log(`📂 Cache hit for candidate ${candidateId}`);
      return parsedData.result;
    } catch (error) {
      console.error("❌ Error getting analysis cache:", error);
      return null;
    }
  }

  /**
   * Xóa kết quả phân tích khỏi cache
   */
  static async removeAnalysis(candidateId, searchCriteria = {}) {
    try {
      const cacheKey = this.generateCacheKey(candidateId, searchCriteria);
      await AsyncStorage.removeItem(cacheKey);

      // Cập nhật danh sách cache keys
      await this.removeCacheIndex(cacheKey);

      console.log(`🗑️ Removed cache for candidate ${candidateId}`);
      return true;
    } catch (error) {
      console.error("❌ Error removing analysis cache:", error);
      return false;
    }
  }

  /**
   * Cập nhật index của cache keys
   */
  static async updateCacheIndex(cacheKey) {
    try {
      const indexKey = "ai_cache_index";
      const indexData = await AsyncStorage.getItem(indexKey);
      let cacheIndex = indexData ? JSON.parse(indexData) : [];

      // Thêm key mới nếu chưa có
      if (!cacheIndex.includes(cacheKey)) {
        cacheIndex.push(cacheKey);
      }

      // Giới hạn số lượng cache
      if (cacheIndex.length > this.MAX_CACHE_SIZE) {
        const oldKeys = cacheIndex.splice(
          0,
          cacheIndex.length - this.MAX_CACHE_SIZE
        );
        // Xóa các cache cũ
        for (const oldKey of oldKeys) {
          await AsyncStorage.removeItem(oldKey);
        }
        console.log(`🧹 Cleaned ${oldKeys.length} old cache entries`);
      }

      await AsyncStorage.setItem(indexKey, JSON.stringify(cacheIndex));
    } catch (error) {
      console.error("❌ Error updating cache index:", error);
    }
  }

  /**
   * Xóa key khỏi cache index
   */
  static async removeCacheIndex(cacheKey) {
    try {
      const indexKey = "ai_cache_index";
      const indexData = await AsyncStorage.getItem(indexKey);
      if (indexData) {
        let cacheIndex = JSON.parse(indexData);
        cacheIndex = cacheIndex.filter((key) => key !== cacheKey);
        await AsyncStorage.setItem(indexKey, JSON.stringify(cacheIndex));
      }
    } catch (error) {
      console.error("❌ Error removing from cache index:", error);
    }
  }

  /**
   * Cache toàn bộ kết quả phân tích nhiều ứng viên
   */
  static async saveBatchAnalysis(candidates, searchCriteria = {}) {
    try {
      const promises = candidates.map((candidate) =>
        this.saveAnalysis(candidate.id, candidate, searchCriteria)
      );
      await Promise.all(promises);
      console.log(`💾 Cached ${candidates.length} candidate analyses`);
      return true;
    } catch (error) {
      console.error("❌ Error saving batch analysis:", error);
      return false;
    }
  }

  /**
   * Lấy toàn bộ kết quả cache cho danh sách ứng viên
   */
  static async getBatchAnalysis(candidateIds, searchCriteria = {}) {
    try {
      const promises = candidateIds.map((id) =>
        this.getAnalysis(id, searchCriteria)
      );
      const results = await Promise.all(promises);

      const cachedResults = [];
      const missingIds = [];

      candidateIds.forEach((id, index) => {
        if (results[index]) {
          cachedResults.push(results[index]);
        } else {
          missingIds.push(id);
        }
      });

      console.log(
        `📂 Found ${cachedResults.length} cached, ${missingIds.length} missing`
      );
      return { cachedResults, missingIds };
    } catch (error) {
      console.error("❌ Error getting batch analysis:", error);
      return { cachedResults: [], missingIds: candidateIds };
    }
  }

  /**
   * Xóa toàn bộ cache
   */
  static async clearAllCache() {
    try {
      const indexKey = "ai_cache_index";
      const indexData = await AsyncStorage.getItem(indexKey);

      if (indexData) {
        const cacheIndex = JSON.parse(indexData);
        const promises = cacheIndex.map((key) => AsyncStorage.removeItem(key));
        await Promise.all(promises);
        await AsyncStorage.removeItem(indexKey);

        console.log(`🧹 Cleared ${cacheIndex.length} cache entries`);
      }

      return true;
    } catch (error) {
      console.error("❌ Error clearing cache:", error);
      return false;
    }
  }

  /**
   * Lấy thống kê cache
   */
  static async getCacheStats() {
    try {
      const indexKey = "ai_cache_index";
      const indexData = await AsyncStorage.getItem(indexKey);

      if (!indexData) {
        return { totalEntries: 0, totalSize: 0 };
      }

      const cacheIndex = JSON.parse(indexData);
      let totalSize = 0;

      for (const key of cacheIndex) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSize += data.length;
        }
      }

      return {
        totalEntries: cacheIndex.length,
        totalSize,
        maxEntries: this.MAX_CACHE_SIZE,
        cacheDuration: this.CACHE_DURATION / (1000 * 60 * 60) + " hours",
      };
    } catch (error) {
      console.error("❌ Error getting cache stats:", error);
      return { totalEntries: 0, totalSize: 0 };
    }
  }
}

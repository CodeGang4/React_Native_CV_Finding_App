/**
 * Base Repository - Abstract base class for all repositories
 */

export class BaseRepository {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes default
  }

  // Cache management
  getCacheKey(method, params = {}) {
    return `${method}_${JSON.stringify(params)}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const { data, timestamp } = cached;
    if (Date.now() - timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return data;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clearCache(pattern = null) {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    // Clear cache entries matching pattern
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // HTTP methods with error handling
  async get(endpoint, params = {}, useCache = true) {
    try {
      const cacheKey = this.getCacheKey(`GET_${endpoint}`, params);

      if (useCache) {
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
      }

      const response = await this.apiClient.get(endpoint, { params });
      const data = response.data;

      if (useCache) {
        this.setCache(cacheKey, data);
      }

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post(endpoint, data) {
    try {
      const response = await this.apiClient.post(endpoint, data);

      // Clear related cache
      this.clearCache(endpoint.split("/")[0]);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put(endpoint, data) {
    try {
      const response = await this.apiClient.put(endpoint, data);

      // Clear related cache
      this.clearCache(endpoint.split("/")[0]);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(endpoint) {
    try {
      const response = await this.apiClient.delete(endpoint);

      // Clear related cache
      this.clearCache(endpoint.split("/")[0]);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handling
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return new Error(data.message || data.error || `HTTP ${status} Error`);
    } else if (error.request) {
      // Network error
      return new Error("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.");
    } else {
      // Other error
      return new Error(error.message || "Đã xảy ra lỗi không xác định");
    }
  }

  // Pagination helpers
  buildPaginationParams(page = 1, limit = 20, filters = {}) {
    return {
      page,
      limit,
      offset: (page - 1) * limit,
      ...filters,
    };
  }

  // Query building helpers
  buildQueryString(params) {
    const query = new URLSearchParams();

    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((item) => query.append(key, item));
        } else {
          query.append(key, value);
        }
      }
    });

    return query.toString();
  }
}

export default BaseRepository;

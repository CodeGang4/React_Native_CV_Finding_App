import { errorTracker } from "../../utils/ErrorTracker";
import { RateLimitHandler } from "../../utils/RateLimitHandler";

/**
 * API Client Configuration with Rate Limiting
 */

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
    this.interceptors = {
      request: [],
      response: [],
    };

    // Initialize rate limit handler
    // this.rateLimitHandler = new RateLimitHandler({
    //   maxConcurrentRequests: 10, // Giảm số request đồng thời
    //   requestDelay: 100, // Delay 100ms giữa các request
    //   retryDelays: [1000, 2000, 4000, 8000, 16000], // Exponential backoff
    // });
    this.rateLimitHandler = new RateLimitHandler({
      maxConcurrentRequests: 5,
      requestDelay: 200,
      retryDelays: [],
    });
  }

  setBaseURL(url) {
    this.baseURL = url;
  }

  setAuthToken(token) {
    if (token) {
      this.defaultHeaders["Authorization"] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders["Authorization"];
    }
  }

  addRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor);
  }

  addResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor);
  }

  async request(config) {
    // Wrap the original request with rate limiting
    return this.rateLimitHandler.executeRequest(
      async () => {
        return this._executeRequest(config);
      },
      {
        priority: config.priority || "normal",
        retryable: config.retryable !== false, // Default to retryable
        url: config.url,
        method: config.method || "GET",
      }
    );
  }

  async _executeRequest(config) {
    // Build full URL
    const url = config.url.startsWith("http")
      ? config.url
      : `${this.baseURL}${config.url}`;

    // Merge headers
    const headers = {
      ...this.defaultHeaders,
      ...config.headers,
    };

    // Build request config
    let requestConfig = {
      method: config.method || "GET",
      headers,
      ...config,
    };

    // Apply request interceptors
    for (const interceptor of this.interceptors.request) {
      requestConfig = await interceptor(requestConfig);
    }

    // Handle query parameters
    if (config.params && Object.keys(config.params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.keys(config.params).forEach((key) => {
        const value = config.params[key];
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((item) => searchParams.append(key, item));
          } else {
            searchParams.append(key, value);
          }
        }
      });

      const separator = url.includes("?") ? "&" : "?";
      requestConfig.url = `${url}${separator}${searchParams.toString()}`;
    } else {
      requestConfig.url = url;
    }

    // Handle request body
    if (
      requestConfig.data &&
      requestConfig.headers["Content-Type"] === "application/json"
    ) {
      requestConfig.body = JSON.stringify(requestConfig.data);
    } else if (requestConfig.data) {
      requestConfig.body = requestConfig.data;
    }

    try {
      // Make the request
      const response = await fetch(requestConfig.url, {
        method: requestConfig.method,
        headers: requestConfig.headers,
        body: requestConfig.body,
        ...requestConfig.options,
      });

      // Check if response is ok
      if (!response.ok) {
        const error = new Error(
          `HTTP ${response.status}: ${response.statusText}`
        );
        error.response = {
          status: response.status,
          statusText: response.statusText,
          data: await this.parseResponseData(response),
        };
        // Thêm config vào error để có thể check trong interceptor
        error.config = requestConfig;
        throw error;
      }

      // Parse response
      const data = await this.parseResponseData(response);

      let result = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };

      // Apply response interceptors
      for (const interceptor of this.interceptors.response) {
        if (typeof interceptor === "function") {
          result = await interceptor(result);
        } else if (interceptor.onFulfilled) {
          result = await interceptor.onFulfilled(result);
        }
      }

      return result;
    } catch (error) {
      // Apply error interceptors
      for (const interceptor of this.interceptors.response) {
        if (interceptor.onError) {
          error = await interceptor.onError(error);
        } else if (typeof interceptor === "function") {
          // Nếu là function, gọi để handle error
          try {
            error = await interceptor(error);
          } catch (e) {
            // Interceptor có thể throw error mới
            error = e;
          }
        }
      }
      throw error;
    }
  }

  async parseResponseData(response) {
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else if (contentType && contentType.includes("text/")) {
      return await response.text();
    } else {
      return await response.blob();
    }
  }

  // Convenience methods with rate limiting support
  async get(url, config = {}) {
    return this.request({
      ...config,
      method: "GET",
      url,
    });
  }

  async post(url, data, config = {}) {
    return this.request({
      ...config,
      method: "POST",
      url,
      data,
      priority: config.priority || "high", // POST requests have higher priority
    });
  }

  async put(url, data, config = {}) {
    return this.request({
      ...config,
      method: "PUT",
      url,
      data,
      priority: config.priority || "high", // PUT requests have higher priority
    });
  }

  async patch(url, data, config = {}) {
    return this.request({
      ...config,
      method: "PATCH",
      url,
      data,
      priority: config.priority || "high", // PATCH requests have higher priority
    });
  }

  async delete(url, config = {}) {
    return this.request({
      ...config,
      method: "DELETE",
      url,
      priority: config.priority || "normal",
    });
  }

  // Rate limiting control methods
  getRateLimitStatus() {
    return this.rateLimitHandler.getQueueStatus();
  }

  setRateLimitConfig(config) {
    this.rateLimitHandler.updateConfig(config);
  }

  pauseRequests() {
    this.rateLimitHandler.pause();
  }

  resumeRequests() {
    this.rateLimitHandler.resume();
  }
}

import Constants from "expo-constants";

// Create default instance
const apiClient = new ApiClient(
  Constants.expoConfig?.extra?.API || "http://localhost:3000/client"
);

// Add default interceptors
apiClient.addRequestInterceptor(async (config) => {
  // Add timestamp to prevent caching
  if (config.method === "GET") {
    config.params = config.params || {};
    config.params._t = Date.now();
  }

  console.log(`[API Request] ${config.method} ${config.url}`);
  return config;
});

apiClient.addResponseInterceptor({
  onFulfilled: async (response) => {
    console.log(`[API Response] ${response.status} ${response.statusText}`);
    return response;
  },
  onError: async (error) => {
    // Chỉ skip log cho DELETE job với 404 (specific case)
    const isDeleteJob404 =
      error.config?.skipErrorLog === true &&
      error.response?.status === 404 &&
      error.config?.method === "DELETE" &&
      error.config?.url?.includes("/job/deleteJob/");

    if (isDeleteJob404) {
      console.debug(
        `[Expected Behavior] Delete job returned 404 (backend logic issue but job deleted successfully)`
      );

      // Không track expected behavior để giảm noise
      // Nếu cần debug có thể uncomment dòng dưới:
      // errorTracker.track(error, { type: 'EXPECTED_DELETE_JOB_404', severity: 'warning' });
    } else {
      // Log tất cả errors khác bình thường
      console.error(`[API Error] ${error.message}`);

      // Track tất cả API errors để debug sau này
      errorTracker.trackAPIError(
        error,
        error.config?.url,
        error.config?.method
      );
    }

    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      apiClient.setAuthToken(null);
      // You might want to redirect to login or refresh token here
    }

    throw error; // Re-throw error thay vì return Promise.reject
  },
});

export { ApiClient, apiClient };
export default apiClient;

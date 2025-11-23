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

    // Initialize rate limit handler with balanced settings
    this.rateLimitHandler = new RateLimitHandler({
      maxConcurrentRequests: 5, // Allow 5 concurrent requests
      requestDelay: 200, // 200ms delay between requests
      maxRetries: 3, // Retry up to 3 times for 429 errors
      retryDelays: [1000, 2000, 4000], // Shorter backoff: 1s, 2s, 4s
    });
  }

  setBaseURL(url) {
    this.baseURL = url;
  }

  setAuthToken(token) {
    if (token) {
      this.defaultHeaders["Authorization"] = `Bearer ${token}`;
      console.log(
        "[ApiClient] Auth token set:",
        token.substring(0, 20) + "..."
      );
    } else {
      delete this.defaultHeaders["Authorization"];
      console.log("[ApiClient] Auth token cleared");
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

    // Debug log for default headers
    if (config.url.includes("/payment/")) {
      console.log(
        "[ApiClient] Before merge - defaultHeaders:",
        this.defaultHeaders
      );
      console.log("[ApiClient] Before merge - config.headers:", config.headers);
    }

    // Merge headers
    const headers = {
      ...this.defaultHeaders,
      ...config.headers,
    };

    // Debug log for authentication
    if (config.url.includes("/payment/")) {
      console.log("[ApiClient] Payment request headers:", {
        hasAuth: !!headers.Authorization,
        authPreview: headers.Authorization
          ? headers.Authorization.substring(0, 30) + "..."
          : "MISSING",
        url: config.url,
      });
    }

    // Build request config - IMPORTANT: spread config first, then override headers
    let requestConfig = {
      ...config, // Spread config properties first
      method: config.method || "GET",
      headers, // Then set merged headers (overrides config.headers)
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

    // Debug log for important endpoints
    if (config.url.includes("/payment/")) {
      console.log("[ApiClient] Payment request:", {
        url: requestConfig.url,
        method: requestConfig.method,
        hasBody: !!requestConfig.body,
      });
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

    // Check if response has content
    const contentLength = response.headers.get("content-length");
    if (contentLength === "0") {
      return null;
    }

    // Clone response to check if body is empty
    const clonedResponse = response.clone();
    const text = await clonedResponse.text();

    // If body is empty, return null instead of trying to parse
    if (!text || text.trim() === "") {
      console.warn("[ApiClient] Empty response body received");
      return null;
    }

    if (contentType && contentType.includes("application/json")) {
      try {
        return await response.json();
      } catch (error) {
        console.error("[ApiClient] JSON parse error:", error.message);
        console.error("[ApiClient] Response text:", text);
        throw new Error(`Invalid JSON response: ${error.message}`);
      }
    } else if (contentType && contentType.includes("text/")) {
      return text;
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

    // THÊM: Skip log cho get questions với 404
    const isGetQuestions404 =
      error.response?.status === 404 &&
      error.config?.method === "GET" &&
      error.config?.url?.includes(
        "/admin/questions/getQuestionsByIndustryAndLevel"
      );

    if (isDeleteJob404 || isGetQuestions404) {
      console.debug(
        `[Expected Behavior] API returned 404 - ${error.config?.url}`
      );

      // Trả về response giả với data rỗng thay vì throw error
      return {
        data: [],
        status: 200,
        statusText: "OK",
        config: error.config,
        headers: {},
      };
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
      console.log('[ApiClient] 401 error - Token may be expired');
      
      // Try to refresh token using Supabase
      try {
        const { getSupabaseClient } = require('../../../../../supabase/config');
        const supabase = getSupabaseClient();
        
        console.log('[ApiClient] Attempting to refresh session...');
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !session) {
          console.error('[ApiClient] Session refresh failed:', refreshError?.message);
          // Clear token and let user re-login
          apiClient.setAuthToken(null);
          throw error;
        }
        
        console.log('[ApiClient] Session refreshed successfully');
        // Update token
        apiClient.setAuthToken(session.access_token);
        
        // Retry the original request with new token
        const originalRequest = error.config;
        originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
        
        console.log('[ApiClient] Retrying original request with new token');
        return apiClient._executeRequest(originalRequest);
      } catch (refreshErr) {
        console.error('[ApiClient] Failed to refresh and retry:', refreshErr.message);
        apiClient.setAuthToken(null);
        throw error;
      }
    }

    throw error; // Re-throw error thay vì return Promise.reject
  },
});

export { ApiClient, apiClient };
export default apiClient;

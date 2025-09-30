/**
 * API Client Configuration
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
        result = await interceptor(result);
      }

      return result;
    } catch (error) {
      // Apply error interceptors
      for (const interceptor of this.interceptors.response) {
        if (interceptor.onError) {
          error = await interceptor.onError(error);
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

  // Convenience methods
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
    });
  }

  async put(url, data, config = {}) {
    return this.request({
      ...config,
      method: "PUT",
      url,
      data,
    });
  }

  async patch(url, data, config = {}) {
    return this.request({
      ...config,
      method: "PATCH",
      url,
      data,
    });
  }

  async delete(url, config = {}) {
    return this.request({
      ...config,
      method: "DELETE",
      url,
    });
  }
}

// Create default instance
const apiClient = new ApiClient(
  process.env.API_BASE_URL || "http://localhost:3000/api"
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
    console.error(`[API Error] ${error.message}`);

    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      apiClient.setAuthToken(null);
      // You might want to redirect to login or refresh token here
    }

    return Promise.reject(error);
  },
});

export { ApiClient, apiClient };
export default apiClient;

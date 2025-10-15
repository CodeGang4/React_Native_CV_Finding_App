/**
 * Request Queue Manager - Quản lý tất cả API requests để tránh rate limiting
 */
class RequestQueueManager {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.cache = new Map();
    this.DELAY_BETWEEN_REQUESTS = 300; // 300ms delay
    this.CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes cache
  }

  /**
   * Thêm request vào queue
   */
  async enqueue(requestFn, cacheKey = null) {
    // Check cache first
    if (cacheKey && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.CACHE_EXPIRY) {
        console.log(`[RequestQueue] Cache hit for: ${cacheKey}`);
        return cached.data;
      }
    }

    return new Promise((resolve, reject) => {
      this.queue.push({
        request: requestFn,
        cacheKey,
        resolve,
        reject,
      });

      this.processQueue();
    });
  }

  /**
   * Xử lý queue tuần tự với delay
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const { request, cacheKey, resolve, reject } = this.queue.shift();

      try {
        console.log(
          `[RequestQueue] Processing request, queue length: ${this.queue.length}`
        );

        const result = await request();

        // Cache result if cacheKey provided
        if (cacheKey) {
          this.cache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
          });
        }

        resolve(result);

        // Delay before next request
        if (this.queue.length > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.DELAY_BETWEEN_REQUESTS)
          );
        }
      } catch (error) {
        console.error(`[RequestQueue] Request failed:`, error);
        reject(error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log(`[RequestQueue] Cache cleared`);
  }

  /**
   * Clear specific cache key
   */
  clearCacheKey(cacheKey) {
    if (this.cache.has(cacheKey)) {
      this.cache.delete(cacheKey);
      console.log(`[RequestQueue] Cache key "${cacheKey}" cleared`);
    }
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
export const requestQueue = new RequestQueueManager();

export default requestQueue;

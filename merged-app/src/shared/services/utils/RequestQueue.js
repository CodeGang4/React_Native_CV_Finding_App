/**
 * Advanced Request Queue Manager - Intelligent batching and rate limiting
 */
class RequestQueueManager {
  constructor() {
    this.queue = [];
    this.batchQueue = new Map(); // For similar requests
    this.isProcessing = false;
    this.cache = new Map();
    this.DELAY_BETWEEN_REQUESTS = 500; // 500ms delay for safety
    this.CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes cache
    this.MAX_CONCURRENT = 2; // Maximum concurrent requests
    this.BATCH_TIMEOUT = 100; // 100ms to collect batch requests
    this.BATCH_MAX_SIZE = 5; // Maximum requests per batch
    this.activeRequests = 0;
    this.batchTimers = new Map();

    // Performance monitoring
    this.stats = {
      totalRequests: 0,
      batchedRequests: 0,
      cacheHits: 0,
      errors: 0,
    };
  }

  /**
   * Add request to queue with intelligent batching
   */
  async enqueue(requestFn, options = {}) {
    const {
      cacheKey = null,
      batchKey = null, // For batching similar requests
      priority = "normal", // high, normal, low
      timeout = 30000,
      retries = 2,
    } = options;

    this.stats.totalRequests++;

    // Check cache first
    if (cacheKey && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.CACHE_EXPIRY) {
        console.log(`[RequestQueue] Cache hit for: ${cacheKey}`);
        this.stats.cacheHits++;
        return cached.data;
      }
    }

    // Handle batch requests
    if (batchKey && this.shouldBatch(batchKey)) {
      return this.enqueueBatch(requestFn, batchKey, {
        cacheKey,
        priority,
        timeout,
        retries,
      });
    }

    return new Promise((resolve, reject) => {
      const requestItem = {
        id: Date.now() + Math.random(),
        request: requestFn,
        cacheKey,
        priority,
        timeout,
        retries,
        resolve,
        reject,
        timestamp: Date.now(),
      };

      // Add to appropriate position based on priority
      if (priority === "high") {
        this.queue.unshift(requestItem);
      } else {
        this.queue.push(requestItem);
      }

      console.log(
        `[RequestQueue] Added to queue, length: ${this.queue.length}, priority: ${priority}`
      );
      this.processQueue();
    });
  }

  /**
   * Batch similar requests together
   */
  async enqueueBatch(requestFn, batchKey, options) {
    if (!this.batchQueue.has(batchKey)) {
      this.batchQueue.set(batchKey, {
        requests: [],
        timer: null,
      });
    }

    const batch = this.batchQueue.get(batchKey);

    return new Promise((resolve, reject) => {
      batch.requests.push({
        request: requestFn,
        options,
        resolve,
        reject,
      });

      // Clear existing timer
      if (batch.timer) {
        clearTimeout(batch.timer);
      }

      // Set new timer or process immediately if batch is full
      if (batch.requests.length >= this.BATCH_MAX_SIZE) {
        this.processBatch(batchKey);
      } else {
        batch.timer = setTimeout(() => {
          this.processBatch(batchKey);
        }, this.BATCH_TIMEOUT);
      }
    });
  }

  /**
   * Process batched requests
   */
  async processBatch(batchKey) {
    const batch = this.batchQueue.get(batchKey);
    if (!batch || batch.requests.length === 0) return;

    console.log(
      `[RequestQueue] Processing batch ${batchKey} with ${batch.requests.length} requests`
    );

    this.stats.batchedRequests += batch.requests.length;

    // Clear timer
    if (batch.timer) {
      clearTimeout(batch.timer);
    }

    // Execute requests with controlled concurrency
    const results = await this.executeBatchWithConcurrency(batch.requests);

    // Clean up batch
    this.batchQueue.delete(batchKey);
  }

  /**
   * Execute batch with concurrency control
   */
  async executeBatchWithConcurrency(requests) {
    const results = [];
    let index = 0;

    const executeNext = async () => {
      if (index >= requests.length) return;

      const currentIndex = index++;
      const { request, options, resolve, reject } = requests[currentIndex];

      try {
        const result = await this.executeRequest(request, options);
        resolve(result);
        results[currentIndex] = { success: true, data: result };
      } catch (error) {
        reject(error);
        results[currentIndex] = { success: false, error };
        this.stats.errors++;
      }

      // Small delay between batch items
      await new Promise((resolve) => setTimeout(resolve, 50));
    };

    // Execute with concurrency limit
    const concurrentPromises = [];
    for (let i = 0; i < Math.min(this.MAX_CONCURRENT, requests.length); i++) {
      concurrentPromises.push(executeNext());
    }

    // Continue processing remaining requests
    await Promise.all([
      ...concurrentPromises,
      ...Array.from(
        { length: Math.max(0, requests.length - this.MAX_CONCURRENT) },
        executeNext
      ),
    ]);

    return results;
  }

  /**
   * Check if request should be batched
   */
  shouldBatch(batchKey) {
    // Don't batch if queue is small or processing is fast
    return this.queue.length > 3 || this.activeRequests >= this.MAX_CONCURRENT;
  }

  /**
   * Process queue with intelligent concurrency control
   */
  async processQueue() {
    if (this.activeRequests >= this.MAX_CONCURRENT || this.queue.length === 0) {
      return;
    }

    // Process multiple requests concurrently up to limit
    while (this.activeRequests < this.MAX_CONCURRENT && this.queue.length > 0) {
      const requestItem = this.queue.shift();
      this.processRequest(requestItem);
    }
  }

  /**
   * Process individual request
   */
  async processRequest(requestItem) {
    this.activeRequests++;
    const {
      request,
      cacheKey,
      resolve,
      reject,
      retries = 2,
      timeout = 30000,
    } = requestItem;

    try {
      console.log(
        `[RequestQueue] Processing request, active: ${this.activeRequests}, queue: ${this.queue.length}`
      );

      const result = await this.executeRequest(request, {
        cacheKey,
        retries,
        timeout,
      });
      resolve(result);
    } catch (error) {
      console.error(`[RequestQueue] Request failed:`, error.message);
      this.stats.errors++;
      reject(error);
    } finally {
      this.activeRequests--;

      // Process next in queue
      setTimeout(() => {
        this.processQueue();
      }, this.DELAY_BETWEEN_REQUESTS);
    }
  }

  /**
   * Execute request with retry logic and timeout
   */
  async executeRequest(requestFn, options = {}) {
    const { cacheKey, retries = 2, timeout = 30000 } = options;
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Add timeout wrapper
        const result = await Promise.race([
          requestFn(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timeout")), timeout)
          ),
        ]);

        // Cache result if cacheKey provided
        if (cacheKey) {
          this.cache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
          });
        }

        return result;
      } catch (error) {
        lastError = error;

        // Don't retry on certain errors
        if (error.message.includes("401") || error.message.includes("403")) {
          break;
        }

        if (attempt < retries) {
          console.warn(
            `[RequestQueue] Retry attempt ${attempt + 1}/${
              retries + 1
            } for request`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          ); // Exponential backoff
        }
      }
    }

    throw lastError;
  }

  /**
   * Add high priority request (skip queue)
   */
  async addUrgent(requestFn, options = {}) {
    return this.enqueue(requestFn, { ...options, priority: "high" });
  }

  /**
   * Batch multiple similar requests
   */
  async batchSimilar(requests, batchKey) {
    const promises = requests.map(({ requestFn, options }) =>
      this.enqueue(requestFn, { ...options, batchKey })
    );

    return Promise.allSettled(promises);
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
   * Get comprehensive stats
   */
  getStats() {
    return {
      ...this.stats,
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      cacheSize: this.cache.size,
      batchQueueSize: this.batchQueue.size,
      cacheHitRate:
        this.stats.totalRequests > 0
          ? ((this.stats.cacheHits / this.stats.totalRequests) * 100).toFixed(
              2
            ) + "%"
          : "0%",
    };
  }

  /**
   * Clear all pending batches
   */
  clearBatches() {
    this.batchQueue.forEach((batch) => {
      if (batch.timer) {
        clearTimeout(batch.timer);
      }
    });
    this.batchQueue.clear();
    console.log("[RequestQueue] All batches cleared");
  }

  /**
   * Priority queue management
   */
  getQueueInfo() {
    const priorities = { high: 0, normal: 0, low: 0 };
    this.queue.forEach((item) => {
      priorities[item.priority] = (priorities[item.priority] || 0) + 1;
    });

    return {
      total: this.queue.length,
      byPriority: priorities,
      oldestRequest:
        this.queue.length > 0
          ? Date.now() - this.queue[this.queue.length - 1].timestamp
          : 0,
    };
  }
}

// Singleton instance
export const requestQueue = new RequestQueueManager();

export default requestQueue;

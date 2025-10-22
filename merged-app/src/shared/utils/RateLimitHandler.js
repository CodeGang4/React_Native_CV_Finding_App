/**
 * Rate Limit Handler - Xử lý giới hạn tần suất request
 */
export class RateLimitHandler {
  constructor(config = {}) {
    // Configuration
    this.config = {
      maxConcurrentRequests: config.maxConcurrentRequests || 10,
      requestDelay: config.requestDelay || 100,
      maxRetries: config.maxRetries || 0,
      retryDelays: config.retryDelays || [],
      priorityWeights: config.priorityWeights || {
        high: 3,
        normal: 2,
        low: 1
      }
    };

    // State tracking
    this.requestQueue = new Map(); // Track requests per endpoint
    this.requestTimestamps = []; // Track request timing
    this.isPaused = false;
    this.activeRequests = new Set(); // Track active request IDs
    
    // Statistics
    this.stats = {
      successCount: 0,
      failedCount: 0,
      retryCount: 0,
      activeRequests: 0,
      queueLength: 0,
      lastError: null,
      isThrottled: false
    };
    
    // Priority queue
    this.queue = {
      items: [],
      processing: false
    };
  }

  /**
   * Execute request with rate limiting protection
   */
  async executeRequest(requestFn, options = {}) {
    const {
      priority = 'normal',
      retryable = true,
      url = '',
      method = 'GET'
    } = options;

    const requestId = `${Date.now()}-${Math.random()}`;

    try {
      // Check if paused
      if (this.isPaused) {
        await this.waitForResume();
      }

      // Add to queue if too many concurrent requests
      if (this.activeRequests.size >= this.config.maxConcurrentRequests) {
        return await this.addToQueue(requestFn, { priority, retryable, url, method, requestId });
      }

      // Execute request
      return await this._executeWithRetry(requestFn, { priority, retryable, url, method, requestId });

    } catch (error) {
      this.stats.lastError = error.message;
      this.stats.failedCount++;
      this.updateStats();
      throw error;
    }
  }

  /**
   * Execute request with retry logic
   */
  async _executeWithRetry(requestFn, options) {
    const { retryable, requestId } = options;
    let lastError;
    const maxRetries = retryable ? this.config.maxRetries : 0;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Track active request
        this.activeRequests.add(requestId);
        this.stats.activeRequests = this.activeRequests.size;

        // Add delay between requests
        if (attempt > 0) {
          const delay = this.calculateRetryDelay(attempt - 1);
          console.log(`[RateLimitHandler] Retry attempt ${attempt} after ${delay}ms`);
          await this.sleep(delay);
          this.stats.retryCount++;
        } else if (this.config.requestDelay > 0) {
          await this.sleep(this.config.requestDelay);
        }

        // Execute the request
        const result = await requestFn();
        
        // Success
        this.stats.successCount++;
        this.stats.isThrottled = false;
        this.updateRequestTimestamps();
        return result;

      } catch (error) {
        lastError = error;

        // Check if it's a rate limit error
        if (this.isRateLimitError(error)) {
          console.log(`[RateLimitHandler] Rate limit detected, attempt ${attempt + 1}/${maxRetries + 1}`);
          this.stats.isThrottled = true;
          
          if (attempt < maxRetries && retryable) {
            continue; // Retry
          }
        }

        // Non-retryable error or max retries exceeded
        if (!retryable || attempt >= maxRetries) {
          throw error;
        }

      } finally {
        // Remove from active requests
        this.activeRequests.delete(requestId);
        this.stats.activeRequests = this.activeRequests.size;
        this.updateStats();
      }
    }

    throw lastError;
  }

  /**
   * Add request to priority queue
   */
  async addToQueue(requestFn, options) {
    const { priority = 'normal' } = options;
    
    return new Promise((resolve, reject) => {
      const queueItem = {
        requestFn,
        options,
        priority,
        weight: this.config.priorityWeights[priority] || 1,
        resolve,
        reject,
        timestamp: Date.now()
      };

      this.queue.items.push(queueItem);
      this.queue.items.sort((a, b) => b.weight - a.weight); // Sort by priority
      this.stats.queueLength = this.queue.items.length;
      
      console.log(`[RequestQueue] Added to queue, length: ${this.queue.items.length}, priority: ${priority}`);
      
      this.processQueue();
    });
  }

  /**
   * Process the request queue
   */
  async processQueue() {
    if (this.queue.processing || this.queue.items.length === 0) {
      return;
    }

    this.queue.processing = true;

    while (this.queue.items.length > 0 && this.activeRequests.size < this.config.maxConcurrentRequests) {
      const item = this.queue.items.shift();
      this.stats.queueLength = this.queue.items.length;
      
      console.log(`[RequestQueue] Processing request, queue length: ${this.queue.items.length}`);

      // Execute request asynchronously
      this._executeWithRetry(item.requestFn, item.options)
        .then(result => item.resolve(result))
        .catch(error => {
          console.error(`[RequestQueue] Request failed:`, error);
          item.reject(error);
        });

      // Small delay between processing queue items
      if (this.queue.items.length > 0) {
        await this.sleep(50);
      }
    }

    this.queue.processing = false;
  }

  /**
   * Calculate retry delay with exponential backoff and jitter
   */
  calculateRetryDelay(attempt) {
    const baseDelay = this.config.retryDelays[attempt] || this.config.retryDelays[this.config.retryDelays.length - 1];
    const jitter = Math.random() * 0.3; // 30% jitter
    return Math.floor(baseDelay * (1 + jitter));
  }

  /**
   * Check if error is a rate limit error
   */
  isRateLimitError(error) {
    if (!error.response) return false;
    
    const status = error.response.status;
    return status === 429 || status === 503 || status === 502;
  }

  /**
   * Update request timestamps for rate limiting
   */
  updateRequestTimestamps() {
    const now = Date.now();
    this.requestTimestamps.push(now);
    
    // Keep only timestamps from last minute
    const oneMinuteAgo = now - 60000;
    this.requestTimestamps = this.requestTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
  }

  /**
   * Check if should throttle request based on recent activity
   */
  shouldThrottleRequest() {
    const oneMinuteAgo = Date.now() - 60000;
    const recentRequests = this.requestTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
    
    // Throttle if more than 60 requests per minute
    return recentRequests.length > 60;
  }

  /**
   * Wait for throttling to subside
   */
  async waitForThrottle() {
    console.log(`[RateLimitHandler] Throttling detected, waiting...`);
    await this.sleep(2000); // Wait 2 seconds
  }

  /**
   * Wait for resume if paused
   */
  async waitForResume() {
    while (this.isPaused) {
      await this.sleep(100);
    }
  }

  /**
   * Update statistics
   */
  updateStats() {
    this.stats.activeRequests = this.activeRequests.size;
    this.stats.queueLength = this.queue.items.length;
  }

  /**
   * Get current queue and rate limit status
   */
  getQueueStatus() {
    return {
      queueLength: this.queue.items.length,
      activeRequests: this.activeRequests.size,
      isThrottled: this.stats.isThrottled,
      successCount: this.stats.successCount,
      failedCount: this.stats.failedCount,
      retryCount: this.stats.retryCount,
      lastError: this.stats.lastError,
      config: this.config
    };
  }

  /**
   * Pause all requests
   */
  pause() {
    this.isPaused = true;
    console.log(`[RateLimitHandler] Requests paused`);
  }

  /**
   * Resume requests
   */
  resume() {
    this.isPaused = false;
    console.log(`[RateLimitHandler] Requests resumed`);
    this.processQueue(); // Process any queued requests
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log(`[RateLimitHandler] Configuration updated:`, this.config);
  }

  /**
   * Clear all queued requests
   */
  clearQueue() {
    const rejectedCount = this.queue.items.length;
    
    // Reject all queued requests
    this.queue.items.forEach(item => {
      item.reject(new Error('Request cancelled - queue cleared'));
    });
    
    this.queue.items = [];
    this.stats.queueLength = 0;
    
    console.log(`[RateLimitHandler] Cleared ${rejectedCount} queued requests`);
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    const totalRequests = this.stats.successCount + this.stats.failedCount;
    const successRate = totalRequests > 0 ? (this.stats.successCount / totalRequests) * 100 : 0;
    
    return {
      totalRequests,
      successRate: Math.round(successRate * 100) / 100,
      averageRetries: totalRequests > 0 ? this.stats.retryCount / totalRequests : 0,
      currentLoad: {
        active: this.activeRequests.size,
        queued: this.queue.items.length,
        capacity: this.config.maxConcurrentRequests
      }
    };
  }

  /**
   * Utility sleep function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default RateLimitHandler;
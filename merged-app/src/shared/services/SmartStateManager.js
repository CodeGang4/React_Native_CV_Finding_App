/**
 * Smart State Manager - Advanced state management with intelligent caching
 * Prevents API spam, provides instant updates, handles rate limiting gracefully
 */

class SmartStateManager {
  constructor() {
    this.states = new Map(); // Global state store
    this.cache = new Map(); // Local cache with TTL
    this.subscribers = new Map(); // Component subscribers
    this.syncQueue = new Set(); // Background sync queue
    this.config = {
      maxCacheSize: 500,
      defaultTTL: 300000, // 5 minutes
      backgroundSyncInterval: 30000, // 30 seconds
      optimisticTimeout: 5000, // 5 seconds for optimistic updates
    };

    this.startBackgroundSync();
    this.startCacheCleanup();
  }

  /**
   * Get state with smart caching and background sync
   */
  async get(key, fetchFunction, options = {}) {
    const {
      ttl = this.config.defaultTTL,
      forceRefresh = false,
      enableOptimistic = true,
      fallbackValue = null,
    } = options;

    // Check cache first (instant response)
    const cached = this.getFromCache(key);
    if (cached && !forceRefresh) {
      console.log(` [SmartState] Cache hit for ${key}`);

      // Background refresh if cache is getting old
      if (this.shouldBackgroundRefresh(cached)) {
        this.queueBackgroundSync(key, fetchFunction, options);
      }

      return cached.data;
    }

    // Check if already in sync queue to avoid duplicates
    const syncKey = `${key}_${JSON.stringify(options)}`;
    if (this.syncQueue.has(syncKey)) {
      console.log(
        `⏳ [SmartState] Already syncing ${key}, returning cached or fallback`
      );
      return cached?.data || fallbackValue;
    }

    try {
      console.log(`[SmartState] Fetching fresh data for ${key}`);

      // Add to sync queue
      this.syncQueue.add(syncKey);

      const data = await fetchFunction();

      // Cache the result
      this.setCache(key, data, ttl);

      // Update state
      this.setState(key, data);

      // Remove from sync queue
      this.syncQueue.delete(syncKey);

      return data;
    } catch (error) {
      console.warn(` [SmartState] Fetch failed for ${key}:`, error.message);

      // Remove from sync queue
      this.syncQueue.delete(syncKey);

      // Return cached data if available, otherwise fallback
      if (cached) {
        console.log(` [SmartState] Using stale cache for ${key}`);
        return cached.data;
      }

      return fallbackValue;
    }
  }

  /**
   * Set state with optimistic updates
   */
  async set(key, data, updateFunction = null, options = {}) {
    const {
      optimistic = true,
      rollbackOnError = true,
      ttl = this.config.defaultTTL,
    } = options;

    // Store original state for rollback
    const originalState = this.getState(key);

    try {
      // Optimistic update
      if (optimistic) {
        console.log(`[SmartState] Optimistic update for ${key}`);
        this.setState(key, data);
        this.setCache(key, data, ttl);
      }

      // Actual API update
      if (updateFunction) {
        const result = await updateFunction(data);

        // Update with server response
        this.setState(key, result);
        this.setCache(key, result, ttl);

        return result;
      }

      return data;
    } catch (error) {
      console.error(` [SmartState] Update failed for ${key}:`, error.message);

      // Rollback optimistic update
      if (optimistic && rollbackOnError && originalState !== undefined) {
        console.log(
          `[SmartState] Rolling back optimistic update for ${key}`
        );
        this.setState(key, originalState);
        this.setCache(key, originalState, ttl);
      }

      throw error;
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(key, callback, options = {}) {
    const { immediate = true, deep = false } = options;

    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }

    const subscriber = {
      callback,
      options,
      id: Date.now() + Math.random(),
    };

    this.subscribers.get(key).add(subscriber);

    // Immediate callback with current state
    if (immediate) {
      const currentState = this.getState(key);
      if (currentState !== undefined) {
        callback(currentState);
      }
    }

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(key);
      if (subscribers) {
        subscribers.delete(subscriber);
        if (subscribers.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  /**
   * Background sync for stale data
   */
  queueBackgroundSync(key, fetchFunction, options = {}) {
    const syncKey = `${key}_bg_${Date.now()}`;

    setTimeout(async () => {
      try {
        console.log(`[SmartState] Background sync for ${key}`);
        const data = await fetchFunction();

        this.setCache(key, data, options.ttl || this.config.defaultTTL);
        this.setState(key, data);
      } catch (error) {
        console.warn(
          ` [SmartState] Background sync failed for ${key}:`,
          error.message
        );
      }
    }, 100); // Small delay to avoid immediate spam
  }

  /**
   * Batch operations for efficiency
   */
  async batch(operations) {
    const results = {};
    const promises = [];

    for (const [key, operation] of Object.entries(operations)) {
      promises.push(
        operation()
          .then((result) => {
            results[key] = { success: true, data: result };
          })
          .catch((error) => {
            results[key] = { success: false, error: error.message };
          })
      );
    }

    await Promise.allSettled(promises);
    return results;
  }

  // Internal methods
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check TTL
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached;
  }

  setCache(key, data, ttl = this.config.defaultTTL) {
    // Prevent cache overflow
    if (this.cache.size >= this.config.maxCacheSize) {
      this.evictOldestCache();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
      hits: 0,
    });
  }

  shouldBackgroundRefresh(cached) {
    const age = Date.now() - cached.timestamp;
    const ttl = cached.expiry - cached.timestamp;
    return age > ttl * 0.7; // Refresh when 70% of TTL has passed
  }

  setState(key, data) {
    this.states.set(key, data);
    this.notifySubscribers(key, data);
  }

  getState(key) {
    return this.states.get(key);
  }

  notifySubscribers(key, data) {
    const subscribers = this.subscribers.get(key);
    if (!subscribers) return;

    subscribers.forEach((subscriber) => {
      try {
        subscriber.callback(data);
      } catch (error) {
        console.error(` [SmartState] Subscriber error for ${key}:`, error);
      }
    });
  }

  evictOldestCache() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, cached] of this.cache.entries()) {
      if (cached.timestamp < oldestTime) {
        oldestTime = cached.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`🗑️ [SmartState] Evicted oldest cache: ${oldestKey}`);
    }
  }

  startBackgroundSync() {
    setInterval(() => {
      // Clean up old sync queue items
      const now = Date.now();
      this.syncQueue.forEach((item) => {
        if (
          typeof item === "object" &&
          item.timestamp &&
          now - item.timestamp > 60000
        ) {
          this.syncQueue.delete(item);
        }
      });
    }, this.config.backgroundSyncInterval);
  }

  startCacheCleanup() {
    setInterval(() => {
      let cleanedCount = 0;
      const now = Date.now();

      for (const [key, cached] of this.cache.entries()) {
        if (now > cached.expiry) {
          this.cache.delete(key);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        console.log(
          `🧹 [SmartState] Cleaned ${cleanedCount} expired cache entries`
        );
      }
    }, 60000); // Clean every minute
  }

  // Utility methods
  clear(key = null) {
    if (key) {
      this.states.delete(key);
      this.cache.delete(key);
    } else {
      this.states.clear();
      this.cache.clear();
    }
  }

  getStats() {
    return {
      statesCount: this.states.size,
      cacheCount: this.cache.size,
      subscribersCount: Array.from(this.subscribers.values()).reduce(
        (sum, subs) => sum + subs.size,
        0
      ),
      syncQueueSize: this.syncQueue.size,
    };
  }
}

// Global instance
const smartStateManager = new SmartStateManager();

export default smartStateManager;

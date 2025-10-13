/**
 * Feature Flags - Control app features
 */
export const FEATURE_FLAGS = {
  // Application counting feature - disable to prevent rate limiting
  ENABLE_APPLICATION_COUNTING: true,

  // Batch size for API calls when application counting is enabled
  APPLICATION_BATCH_SIZE: 2,

  // Delay between batches (ms)
  APPLICATION_BATCH_DELAY: 1000,

  // Cache TTL for application counts (seconds)
  APPLICATION_CACHE_TTL: 300, // 5 minutes

  // Max retries for failed application count requests
  APPLICATION_MAX_RETRIES: 2,
};

/**
 * Get feature flag value
 */
export const getFeatureFlag = (flagName) => {
  return FEATURE_FLAGS[flagName] ?? false;
};

/**
 * Check if application counting is enabled
 */
export const isApplicationCountingEnabled = () => {
  return getFeatureFlag("ENABLE_APPLICATION_COUNTING");
};

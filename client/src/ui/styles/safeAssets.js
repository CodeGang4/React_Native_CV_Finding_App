/**
 * Asset Images - Safe way to import images
 * Using dynamic imports to avoid bundling issues
 */

// Simple placeholder image as base64 (1x1 pixel transparent)
export const PLACEHOLDER_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHZ6EOwdgAAAABJRU5ErkJggg==";

// Function to safely get asset
export const getAssetSafely = (assetName) => {
  try {
    switch (assetName) {
      case "icon":
        // Will be added back once we confirm path works
        return null;
      default:
        return null;
    }
  } catch (error) {
    console.warn("Asset loading error:", error);
    return null;
  }
};

export default {
  PLACEHOLDER_IMAGE,
  getAssetSafely,
};

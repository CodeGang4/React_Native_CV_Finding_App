/**
 * Assets Constants - TEMPORARILY DISABLED
 * This file may cause bundling issues with require paths
 * Use safeAssets.js instead or import assets directly in components
 */

/*
// Temporarily commented out to avoid require issues

// Export asset paths as strings for reference
export const ASSET_PATHS = {
  ICON: "./assets/icon.png",
  ADAPTIVE_ICON: "./assets/adaptive-icon.png",
  FAVICON: "./assets/favicon.png",
  SPLASH_ICON: "./assets/splash-icon.png",
};

// Safe asset loading function
export const getAssetSafely = (assetName) => {
  try {
    switch (assetName) {
      case "ICON":
        return require("../../../../assets/icon.png");
      case "ADAPTIVE_ICON":
        return require("../../../../assets/adaptive-icon.png");
      case "FAVICON":
        return require("../../../../assets/favicon.png");
      case "SPLASH_ICON":
        return require("../../../../assets/splash-icon.png");
      default:
        return null;
    }
  } catch (error) {
    console.warn(`Failed to load asset: ${assetName}`, error);
    return null;
  }
};

export default { ASSET_PATHS, getAssetSafely };
*/

// Placeholder exports to avoid import errors
export const ASSET_PATHS = {};
export const getAssetSafely = () => null;
export default { ASSET_PATHS, getAssetSafely };

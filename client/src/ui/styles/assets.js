/**
 * Assets Constants - Centralized asset imports
 * Note: This file may cause bundling issues due to nested require paths
 * Consider importing assets directly in components if needed
 */

// For now, export asset paths as strings for reference
export const ASSET_PATHS = {
  ICON: "../../../assets/icon.png",
  ADAPTIVE_ICON: "../../../assets/adaptive-icon.png",
  FAVICON: "../../../assets/favicon.png",
  SPLASH_ICON: "../../../assets/splash-icon.png",
};

// Export individual asset requires (use this pattern in components)
export const getAssetRequire = (assetName) => {
  switch (assetName) {
    case "ICON":
      return require("../../../assets/icon.png");
    case "ADAPTIVE_ICON":
      return require("../../../assets/adaptive-icon.png");
    case "FAVICON":
      return require("../../../assets/favicon.png");
    case "SPLASH_ICON":
      return require("../../../assets/splash-icon.png");
    default:
      return null;
  }
};

export default { ASSET_PATHS, getAssetRequire };

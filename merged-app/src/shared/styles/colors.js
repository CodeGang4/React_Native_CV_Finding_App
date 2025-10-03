/**
 * Color Constants - App color palette
 * Migrated from shared/constants/colors.js
 */

export const colors = {
  // Primary colors
  primary: "#30C36B",
  primaryLight: "#4DD68F",
  primaryDark: "#229F58",

  // Secondary colors
  secondary: "#00b14f",
  secondaryLight: "#33C76D",
  secondaryDark: "#008F3F",

  // Text colors
  textPrimary: "#1F2937",
  textSecondary: "#666",
  textLight: "#9CA3AF",
  textWhite: "#FFFFFF",

  // Background colors
  background: "#FFFFFF",
  backgroundLight: "#F9FAFB",
  backgroundGray: "#F3F4F6",

  // Border colors
  border: "#e5e7eb",
  borderLight: "#F3F4F6",
  borderDark: "#D1D5DB",

  // Status colors
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",

  // Semantic colors
  white: "#FFFFFF",
  black: "#000000",
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },

  // Shadow colors
  shadow: "rgba(0,0,0,0.08)",
  shadowLight: "rgba(0,0,0,0.04)",
  shadowDark: "rgba(0,0,0,0.12)",

  // Overlay colors
  overlay: "rgba(0,0,0,0.5)",
  overlayLight: "rgba(0,0,0,0.3)",

  // Job-specific colors
  job: {
    featured: "#F59E0B",
    urgent: "#EF4444",
    normal: "#6B7280",
  },

  // Status-specific colors
  status: {
    active: "#10B981",
    inactive: "#6B7280",
    pending: "#F59E0B",
    rejected: "#EF4444",
    draft: "#9CA3AF",
  },

  // Level-specific colors
  level: {
    junior: "#3B82F6",
    mid: "#8B5CF6",
    senior: "#EF4444",
  },
};

export default colors;

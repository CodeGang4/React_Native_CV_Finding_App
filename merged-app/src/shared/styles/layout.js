/**
 * Layout Constants - App layout and spacing
 * Migrated and expanded from shared/constants/layout.js
 */

import { Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const layout = {
  // Screen dimensions
  screen: {
    width: screenWidth,
    height: screenHeight,
  },

  // Spacing scale (following 8pt grid system)
  spacing: {
    xs: 4, // Extra small
    sm: 8, // Small
    md: 16, // Medium
    lg: 24, // Large
    xl: 32, // Extra large
    xxl: 48, // Extra extra large
    xxxl: 64, // Extra extra extra large
  },

  // Padding presets
  padding: {
    screen: 16, // Default screen padding
    container: 20, // Container padding
    card: 16, // Card internal padding
    modal: 24, // Modal padding
    section: 20, // Section padding
  },

  // Margin presets
  margin: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  // Border radius
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    round: 50,
    circle: 999,
  },

  // Component sizes
  sizes: {
    // Icons
    icon: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 32,
      xl: 40,
    },

    // Avatars
    avatar: {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 56,
      xl: 80,
    },

    // Buttons
    button: {
      height: {
        sm: 32,
        md: 40,
        lg: 48,
        xl: 56,
      },
      minWidth: {
        sm: 80,
        md: 100,
        lg: 120,
        xl: 150,
      },
    },

    // Input fields
    input: {
      height: {
        sm: 36,
        md: 44,
        lg: 52,
      },
    },

    // Cards
    card: {
      minHeight: 120,
      maxWidth: 400,
    },

    // Modals
    modal: {
      maxWidth: screenWidth - 40,
      maxHeight: screenHeight * 0.9,
    },
  },

  // Header heights
  header: {
    height: 56,
    heightLarge: 64,
    statusBarHeight: 24, // Default, should be detected dynamically
  },

  // Tab bar
  tabBar: {
    height: 60,
    heightWithSafeArea: 80,
  },

  // Breakpoints for responsive design
  breakpoints: {
    phone: 0,
    tablet: 768,
    desktop: 1024,
  },

  // Z-index layers
  zIndex: {
    background: -1,
    default: 0,
    content: 1,
    header: 10,
    overlay: 100,
    modal: 1000,
    toast: 2000,
    tooltip: 3000,
  },

  // Animation durations (in milliseconds)
  animation: {
    fast: 150,
    normal: 250,
    slow: 400,
    slower: 600,
  },

  // Shadow presets
  shadow: {
    sm: {
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // Common styles
  styles: {
    // Center content
    center: {
      justifyContent: "center",
      alignItems: "center",
    },

    // Flex shortcuts
    flex1: { flex: 1 },
    flexRow: { flexDirection: "row" },
    flexColumn: { flexDirection: "column" },

    // Position shortcuts
    absolute: { position: "absolute" },
    relative: { position: "relative" },

    // Full size
    fullSize: {
      width: "100%",
      height: "100%",
    },

    // Screen container
    screenContainer: {
      flex: 1,
      backgroundColor: "#FFFFFF",
    },

    // Safe area
    safeArea: {
      flex: 1,
      paddingTop: 24, // Should be detected dynamically
    },
  },
};

// Helper functions
export const getResponsiveSize = (phone, tablet = phone, desktop = tablet) => {
  if (screenWidth >= layout.breakpoints.desktop) return desktop;
  if (screenWidth >= layout.breakpoints.tablet) return tablet;
  return phone;
};

export const isTablet = () => screenWidth >= layout.breakpoints.tablet;
export const isDesktop = () => screenWidth >= layout.breakpoints.desktop;
export const isPhone = () => screenWidth < layout.breakpoints.tablet;

export default layout;

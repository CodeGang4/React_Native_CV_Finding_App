/**
 * Debug Utilities - Helper functions for debugging in development
 */

import { errorTracker } from "./ErrorTracker";

class DebugUtils {
  // Show recent errors in console
  showRecentErrors(count = 10) {
    if (!__DEV__) return;

    console.group("Recent Errors");
    const errors = errorTracker.getRecentErrors(count);

    if (errors.length === 0) {
      console.log(" No recent errors");
    } else {
      errors.forEach((error, index) => {
        console.group(`${index + 1}. ${error.message} (${error.timestamp})`);
        console.log("Context:", error.context);
        console.groupEnd();
      });
    }
    console.groupEnd();
  }

  // Show API errors specifically
  showAPIErrors() {
    if (!__DEV__) return;

    const apiErrors = errorTracker.getErrorsByContext("type", "API_ERROR");
    console.group("🌐 API Errors");

    if (apiErrors.length === 0) {
      console.log(" No API errors");
    } else {
      apiErrors.forEach((error, index) => {
        console.group(
          `${index + 1}. ${error.context.method} ${error.context.endpoint}`
        );
        console.log("Status:", error.context.status);
        console.log("Message:", error.message);
        console.log("Time:", error.timestamp);
        console.groupEnd();
      });
    }
    console.groupEnd();
  }

  // Show error summary
  showErrorSummary() {
    if (!__DEV__) return;

    const summary = errorTracker.getSummary();
    console.group("Error Summary");
    console.log("Total Errors:", summary.totalErrors);
    console.log("Errors by Type:", summary.errorsByType);
    console.log("Recent Errors:", summary.recentErrors.length);
    console.groupEnd();
  }

  // Clear all tracked errors
  clearErrors() {
    if (!__DEV__) return;

    errorTracker.clear();
    console.log("🧹 Error tracker cleared");
  }

  // Make debug functions available globally in development
  exposeGlobalDebug() {
    if (!__DEV__) return;

    global.__DEBUG__ = {
      showRecentErrors: this.showRecentErrors.bind(this),
      showAPIErrors: this.showAPIErrors.bind(this),
      showErrorSummary: this.showErrorSummary.bind(this),
      clearErrors: this.clearErrors.bind(this),
      errorTracker,
    };

    console.log("🔧 Debug utilities available via global.__DEBUG__");
    console.log(
      "Available methods: showRecentErrors(), showAPIErrors(), showErrorSummary(), clearErrors()"
    );
  }
}

export const debugUtils = new DebugUtils();
export default debugUtils;

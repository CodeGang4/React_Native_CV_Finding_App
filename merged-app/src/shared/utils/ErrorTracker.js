/**
 * Error Tracker - Centralized error tracking and reporting
 */

class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 100; // Keep last 100 errors
  }

  track(error, context = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context,
      id: Date.now() + Math.random(),
    };

    this.errors.unshift(errorEntry);

    // Keep only maxErrors entries
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log to console in development - nhưng chỉ log chi tiết cho errors thật sự
    if (__DEV__) {
      const severity = context.severity || "error";

      if (severity === "warning") {
        // Chỉ log ngắn gọn cho warnings
        console.debug(` Warning tracked: ${error.message}`, {
          context: context.type,
        });
      } else {
        // Log chi tiết cho errors thật sự
        console.group(`Error Tracked: ${error.message}`);
        console.log("Context:", context);
        console.log("Stack:", error.stack);
        console.groupEnd();
      }
    }
  }

  getRecentErrors(count = 10) {
    return this.errors.slice(0, count);
  }

  getErrorsByContext(contextKey, contextValue) {
    return this.errors.filter(
      (error) => error.context[contextKey] === contextValue
    );
  }

  clear() {
    this.errors = [];
  }

  // Special tracking for API errors
  trackAPIError(error, endpoint, method) {
    this.track(error, {
      type: "API_ERROR",
      endpoint,
      method,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });
  }

  // Get summary for debugging
  getSummary() {
    const summary = {
      totalErrors: this.errors.length,
      recentErrors: this.errors.slice(0, 5),
      errorsByType: {},
    };

    this.errors.forEach((error) => {
      const type = error.context.type || "UNKNOWN";
      summary.errorsByType[type] = (summary.errorsByType[type] || 0) + 1;
    });

    return summary;
  }
}

export const errorTracker = new ErrorTracker();
export default errorTracker;

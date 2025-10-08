import { useState, useEffect, useCallback } from "react";
import Constants from "expo-constants";

/**
 * Custom hook for managing job views
 */
export const useJobViews = (jobId, initialViews = 0) => {
  const [views, setViews] = useState(initialViews);
  const [isIncrementing, setIsIncrementing] = useState(false);

  // Increment job views when component mounts
  const incrementViews = useCallback(async () => {
    if (!jobId || isIncrementing) return;

    setIsIncrementing(true);

    try {
      const baseUrl =
        Constants.expoConfig?.extra?.API?.replace("/client", "") ||
        "http://localhost:3000";

      const response = await fetch(`${baseUrl}/job/views/${jobId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`📈 Views incremented for job ${jobId}:`, data);

        // Handle different response formats from backend
        if (data.views !== undefined) {
          setViews(data.views);
        } else if (data.success && data.views !== undefined) {
          setViews(data.views);
        } else {
          // If no views in response, increment local state
          setViews((prev) => prev + 1);
        }
      } else {
        console.warn(
          `⚠️ Failed to increment views for job ${jobId}:`,
          response.status
        );
        // Fallback: increment local state
        setViews((prev) => prev + 1);
      }
    } catch (error) {
      console.error(`❌ Error incrementing views for job ${jobId}:`, error);
      // Fallback: increment local state
      setViews((prev) => prev + 1);
    } finally {
      setIsIncrementing(false);
    }
  }, [jobId, isIncrementing]);

  // Auto-increment views when component mounts
  useEffect(() => {
    if (jobId) {
      incrementViews();
    }
  }, [jobId]); // Only run when jobId changes

  // Update local views when initialViews changes
  useEffect(() => {
    setViews(initialViews);
  }, [initialViews]);

  return {
    views,
    incrementViews,
    isIncrementing,
  };
};

export default useJobViews;

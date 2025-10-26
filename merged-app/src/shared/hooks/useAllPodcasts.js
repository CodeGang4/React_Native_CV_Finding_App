import { useState, useEffect } from "react";
import HomeApiService from "../services/api/HomeApiService.js";

/**
 * Custom hook to fetch and manage ALL podcasts data for podcasts listing page
 */
export const useAllPodcasts = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllPodcasts = async () => {
    try {
      setLoading(true);
      setError(null);

      const allPodcasts = await HomeApiService.getPodcasts();

      // Transform data for UI
      const transformPodcast = (podcast) => ({
        id: podcast.id,
        title: podcast.title || "Chưa có tiêu đề",
        podcast_url: podcast.podcast_url,
        duration: formatDuration(
          podcast.duration || podcast.length || "00:00:00"
        ),
        thumbnail: podcast.thumbnail || null,
        description: podcast.description || "",
        created_at: podcast.created_at,
      });

      setPodcasts(allPodcasts.map(transformPodcast));

      console.log("[useAllPodcasts] All data loaded successfully");
    } catch (err) {
      setError(err.message);
      console.error("[useAllPodcasts] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format duration
  const formatDuration = (duration) => {
    // If duration is already in HH:MM:SS format, return as is
    if (typeof duration === "string" && duration.includes(":")) {
      return duration;
    }

    // If duration is in seconds, convert to HH:MM:SS
    if (typeof duration === "number") {
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;

      if (hours > 0) {
        return `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      } else {
        return `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;
      }
    }

    // Default fallback
    return "00:00:00";
  };

  useEffect(() => {
    fetchAllPodcasts();
  }, []);

  return {
    podcasts,
    loading,
    error,
    refetch: fetchAllPodcasts,
  };
};

export default useAllPodcasts;

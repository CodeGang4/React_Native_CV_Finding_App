import { useState } from "react";

export default function useRefresh(refreshFunctions = []) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all(refreshFunctions.map((fn) => fn()));
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  return { refreshing, handleRefresh };
}

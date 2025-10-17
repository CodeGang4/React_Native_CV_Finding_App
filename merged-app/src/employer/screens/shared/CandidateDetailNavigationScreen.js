import React from "react";
import CandidateDetailScreen from "./CandidateDetailScreen";

// Navigation wrapper cho CandidateDetailScreen từ HomePage
export default function CandidateDetailNavigationScreen({ candidate, onBack }) {
  // Tạo mock route và navigation objects
  const mockRoute = {
    params: { candidate },
  };

  const mockNavigation = {
    goBack: onBack,
    canGoBack: () => true,
  };

  return (
    <CandidateDetailScreen route={mockRoute} navigation={mockNavigation} />
  );
}

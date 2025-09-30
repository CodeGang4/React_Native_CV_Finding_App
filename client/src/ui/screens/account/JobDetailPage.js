import React from "react";
import JobDetailScreen from "../shared/JobDetailScreen";

export default function JobDetailPage({ job, onBack, onEdit, onDelete }) {
  return (
    <JobDetailScreen
      job={job}
      onBack={onBack}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

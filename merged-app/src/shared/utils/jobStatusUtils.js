/**
 * Job Status Utilities
 * Centralized logic for calculating job status
 */

/**
 * Calculate job status based on various factors
 * @param {Object} job - Job object
 * @returns {string} Status text
 */
export const calculateJobStatus = (job) => {
  // Check if job is explicitly expired in backend
  if (job?.is_expired === true) {
    return "Hết hạn";
  }

  // Check if job deadline has passed (client-side check)
  const deadline = job?.deadline || job?.expired_date || job?.exprired_date;
  if (deadline) {
    try {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      if (deadlineDate < now) {
        return "Hết hạn";
      }
    } catch (error) {
      console.warn("Error parsing deadline:", deadline);
    }
  }

  // Check explicit status first
  if (job?.status === "inactive" || job?.status === "closed") {
    return job.status === "inactive" ? "Tạm dừng" : "Đã đóng";
  }

  if (job?.status === "draft") {
    return "Bản nháp";
  }

  // Check acceptance status
  if (job?.isAccepted === false || job?.status === "Chờ duyệt") {
    return "Chờ duyệt";
  }

  // Default to active status
  return "Đang tuyển";
};

/**
 * Get status color based on status text
 * @param {string} status - Status text
 * @returns {string} Color hex code
 */
export const getStatusColor = (status) => {
  switch (status) {
    case "Đang tuyển":
      return "#4CAF50";
    case "Hết hạn":
      return "#F44336";
    case "Chờ duyệt":
      return "#FF9800";
    case "Tạm dừng":
    case "Đã đóng":
      return "#757575";
    case "Bản nháp":
      return "#2196F3";
    default:
      return "#666";
  }
};

/**
 * Check if job is expired
 * @param {Object} job - Job object
 * @returns {boolean} True if job is expired
 */
export const isJobExpired = (job) => {
  // Check backend flag first
  if (job?.is_expired === true) {
    return true;
  }

  // Check deadline
  const deadline = job?.deadline || job?.expired_date || job?.exprired_date;
  if (!deadline) {
    return false;
  }

  try {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    return deadlineDate < now;
  } catch (error) {
    console.warn("Error parsing deadline:", deadline);
    return false;
  }
};

/**
 * Check if job is active (can receive applications)
 * @param {Object} job - Job object
 * @returns {boolean} True if job is active
 */
export const isJobActive = (job) => {
  const status = calculateJobStatus(job);
  return status === "Đang tuyển";
};

/**
 * Get job status with color information
 * @param {Object} job - Job object
 * @returns {Object} Object with text and color properties
 */
export const getJobStatusWithColor = (job) => {
  const status = calculateJobStatus(job);
  const color = getStatusColor(status);

  return {
    text: status,
    color: color,
  };
};

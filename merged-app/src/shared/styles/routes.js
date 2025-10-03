/**
 * Routes Constants - App navigation routes
 * Migrated from shared/constants/routes.js
 */

export const ROUTES = {
  Home: { name: "Home", label: "Trang chủ", icon: "home" },
  JobPosting: { name: "JobPosting", label: "Tuyển dụng", icon: "work" },
  Connect: { name: "Connect", label: "Ứng viên", icon: "people" },
  Notification: {
    name: "Notification",
    label: "Thông báo",
    icon: "notifications-none",
  },
  Account: { name: "Account", label: "Tài khoản", icon: "person" },
};

// Thứ tự xuất hiện trên TabBar (nếu cần dùng ở nơi khác)
export const TAB_ORDER = [
  ROUTES.Home.name,
  ROUTES.JobPosting.name,
  ROUTES.Connect.name,
  ROUTES.Notification.name,
  ROUTES.Account.name,
];

export default ROUTES;

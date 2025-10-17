/**
 * Hook to integrate notifications with authentication
 * DEPRECATED: NotificationContext now automatically syncs with AuthContext
 * Use useAuth() and useNotifications() directly instead
 */
import { useAuth } from '../contexts/AuthContext';

export const useNotificationAuth = () => {
  const { user, userRole } = useAuth();

  console.warn('useNotificationAuth is deprecated. Use useAuth() and useNotifications() directly instead.');

  return {
    user,
    userRole,
    isAuthenticated: !!user,
    userId: user?.id,
    isCandidate: userRole === 'candidate',
    isEmployer: userRole === 'employer',
  };
};

export default useNotificationAuth;
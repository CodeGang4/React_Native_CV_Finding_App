import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserApiService from '../services/api/UserApiService';

export const useEmployerPremiumAccess = () => {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  const checkPremiumAccess = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        console.log(' No user ID found');
        setHasAccess(false);
        return false;
      }

      console.log('Checking employer premium access for user:', user.id);
      
      // Get user profile to check level
      const profile = await UserApiService.getUserById(user.id);
      console.log(' Employer profile level:', profile.user?.level);
      
      setUserProfile(profile);
      
      // Check if user has premium access (chung cho tất cả user)
      const isPremium = profile.user?.level === 'premium';
      setHasAccess(isPremium);
      
      console.log(' Premium access:', isPremium);
      return isPremium;
      
    } catch (error) {
      console.error(' Error checking employer premium access:', error);
      setHasAccess(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkPremiumAccess();
    } else {
      setLoading(false);
      setHasAccess(false);
    }
  }, [user]);

  const refreshAccess = () => {
    return checkPremiumAccess();
  };

  return {
    hasAccess,
    loading,
    userProfile,
    refreshAccess,
    checkPremiumAccess,
  };
};
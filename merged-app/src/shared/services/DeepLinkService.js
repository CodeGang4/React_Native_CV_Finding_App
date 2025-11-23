import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import config from '../config/environment';

/**
 * Deep Link Configuration
 */
export const linking = {
  prefixes: [
    `${config.deepLinkScheme}://`, // Custom scheme: jobbridge://
    config.webUrl, // Web URL
    config.deepLinkPrefix, // Environment-specific prefix
  ],
  
  config: {
    screens: {
      // Auth screens
      Login: 'login',
      Signup: 'signup',
      RoleSelection: 'role-selection',
      
      // Candidate App
      CandidateApp: {
        screens: {
          CandidateHome: 'home',
          Notifications: 'notices',
          InterviewPractice: 'interview',
          ProfileStack: {
            screens: {
              Profile: 'profile',
              CVScreen: 'cv',
              CVViewer: 'cv-viewer',
              EditProfile: 'edit-profile',
              UpgradeAccount: 'upgrade',
              AppliedJobs: 'applied-jobs',
              SaveJobs: 'saved-jobs',
              PaymentSuccess: 'payment/success',
              PaymentFailed: 'payment/failed',
              PaymentHistory: 'payment/history',
            }
          }
        }
      },
      
      // Employer App
      EmployerApp: {
        screens: {
          Home: 'employer/home',
          Jobs: 'employer/jobs',
          Candidates: 'employer/candidates',
          Profile: 'employer/profile',
        }
      },
    },
  },
  
  // Handle deep link events
  async getInitialURL() {
    // Check if app was opened via deep link
    const url = await Linking.getInitialURL();
    if (url) {
      console.log('Initial deep link URL:', url);
    }
    return url;
  },
  
  subscribe(listener) {
    // Listen for deep link events while app is running
    const onReceiveURL = ({ url }) => {
      console.log('Received deep link URL:', url);
      listener(url);
    };

    // Add event listener
    const subscription = Linking.addEventListener('url', onReceiveURL);

    return () => {
      // Cleanup
      subscription.remove();
    };
  },
};

/**
 * Hook to handle deep links in components
 */
export const useDeepLinking = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Handle initial URL when app is opened from closed state
    const handleInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          console.log('Handling initial URL:', initialUrl);
          handleDeepLink(initialUrl);
        }
      } catch (error) {
        console.error('Error handling initial URL:', error);
      }
    };

    // Handle URL when app is already open
    const handleURL = (event) => {
      console.log('Handling URL event:', event.url);
      handleDeepLink(event.url);
    };

    // Subscribe to URL events
    const subscription = Linking.addEventListener('url', handleURL);
    
    // Check for initial URL
    handleInitialURL();

    // Cleanup
    return () => {
      subscription.remove();
    };
  }, [navigation]);

  const handleDeepLink = (url) => {
    if (!url) return;

    try {
      const { hostname, path, queryParams } = Linking.parse(url);
      
      console.log('🔗 Parsed deep link:', { 
        hostname, 
        path, 
        queryParams 
      });

      // Handle payment success
      if (path?.includes('payment/success')) {
        const session_id = queryParams?.session_id;
        if (session_id) {
          console.log(' Navigating to PaymentSuccess with session:', session_id);
          navigation.navigate('CandidateApp', {
            screen: 'ProfileStack',
            params: {
              screen: 'PaymentSuccess',
              params: { session_id }
            }
          });
        } else {
          console.warn(' Payment success URL missing session_id');
        }
      }
      
      // Handle payment failure/cancellation
      else if (path?.includes('payment/failed') || path?.includes('payment/cancel')) {
        const reason = queryParams?.reason || 'cancelled';
        console.log(' Navigating to PaymentFailed with reason:', reason);
        navigation.navigate('CandidateApp', {
          screen: 'ProfileStack',
          params: {
            screen: 'PaymentFailed',
            params: { reason }
          }
        });
      }
      
      // Handle payment history
      else if (path?.includes('payment/history')) {
        console.log(' Navigating to PaymentHistory');
        navigation.navigate('CandidateApp', {
          screen: 'ProfileStack',
          params: {
            screen: 'PaymentHistory'
          }
        });
      }
      
      // Handle upgrade account
      else if (path?.includes('upgrade')) {
        console.log('⬆️ Navigating to UpgradeAccount');
        navigation.navigate('CandidateApp', {
          screen: 'ProfileStack',
          params: {
            screen: 'UpgradeAccount'
          }
        });
      }
      
      // Handle other paths
      else {
        console.log('Unhandled deep link path:', path);
      }
    } catch (error) {
      console.error('Error parsing deep link:', error);
    }
  };

  return { handleDeepLink };
};

/**
 * Utility to create deep link URLs
 */
export const createDeepLink = (path, params = {}) => {
  const baseUrl = __DEV__ ? config.deepLinkPrefix : `${config.deepLinkScheme}://`;
  const queryString = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  return `${baseUrl}/${path}${queryString ? `?${queryString}` : ''}`;
};

/**
 * Test deep links (for debugging)
 */
export const testDeepLinks = async () => {
  const testCases = [
    {
      name: 'Payment Success',
      url: createDeepLink('payment/success', { session_id: 'cs_test_123' }),
    },
    {
      name: 'Payment Failed',
      url: createDeepLink('payment/failed', { reason: 'cancelled' }),
    },
    {
      name: 'Payment History',
      url: createDeepLink('payment/history'),
    },
  ];

  console.log('🧪 Testing Deep Links...\n');

  for (const test of testCases) {
    console.log(`Testing: ${test.name}`);
    console.log(`URL: ${test.url}`);
    
    try {
      const parsed = Linking.parse(test.url);
      console.log('Parsed:', parsed);
      
      const canOpen = await Linking.canOpenURL(test.url);
      console.log(`Can open: ${canOpen}\n`);
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
};

export default linking;

import Constants from 'expo-constants';

/**
 * Environment Configuration
 * Centralized config for different environments
 */

const ENV = {
  development: {
    apiUrl: Constants.expoConfig?.extra?.API || 'http://1192.168.84.28:3000',
    deepLinkScheme: 'jobbridge',
        deepLinkPrefix: 'exp://192.168.84.28:8081', // Update with your local IP
    webUrl: 'http://localhost:3000',
    stripePublishableKey: 'pk_test_...', // Add your test key
  },
  
  staging: {
    apiUrl: 'https://staging-api.jobbridge.app',
    deepLinkScheme: 'jobbridge',
    deepLinkPrefix: 'https://staging.jobbridge.app',
    webUrl: 'https://staging.jobbridge.app',
    stripePublishableKey: 'pk_test_...', // Add your test key
  },
  
  production: {
    apiUrl: 'https://api.jobbridge.app',
    deepLinkScheme: 'jobbridge',
    deepLinkPrefix: 'https://jobbridge.app',
    webUrl: 'https://jobbridge.app',
    stripePublishableKey: 'pk_live_...', // Add your live key
  },
};

const getEnvVars = () => {
  // Check for explicit environment variable
  const appEnv = process.env.APP_ENV;
  
  if (appEnv === 'staging') {
    return ENV.staging;
  } else if (appEnv === 'production' || !__DEV__) {
    return ENV.production;
  } else {
    return ENV.development;
  }
};

const config = getEnvVars();

// Log current environment in development
if (__DEV__) {
  console.log('Environment:', __DEV__ ? 'development' : 'production');
  console.log('API URL:', config.apiUrl);
  console.log('Deep Link Prefix:', config.deepLinkPrefix);
}

export default config;

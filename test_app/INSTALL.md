Installation and run steps (PowerShell on Windows):

# From project root (d:\Workspace\React_Native_CV_Finding_App\test_app)

# 1) Install required Expo navigation dependencies

expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context react-native-gesture-handler

# 2) If needed, install the JS package for native-stack (optional, sometimes installed via expo)

npm install @react-navigation/native-stack

# 3) Start the app

npm run start

# Notes

- After installing, if you run into gesture-handler errors, restart Metro and clear cache: expo start -c
- The app now contains:
  - App.js (sets up navigation)
  - screens/HomeScreen.js (jobs list)
  - screens/JobDetailScreen.js (job detail)
  - components/JobCard.js (simple job card)

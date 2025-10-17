# Push Notifications Setup Guide

This app now supports push notifications that display in the Notice tab. Here's how to set it up and test it.

## Features
- ✅ Push notification registration with proper permissions
- ✅ Notifications display in the Notice tab
- ✅ Badge count on Notice tab
- ✅ Mark as read/unread functionality
- ✅ Clear all notifications
- ✅ Show push token for testing

## Setup Instructions

### 1. Install Dependencies (if not already installed)
```powershell
expo install expo-notifications
```

### 2. For Testing on Physical Device
**IMPORTANT**: Push notifications don't work in Expo Go for SDK 53+. You need a development build:

```powershell
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Create development build
eas build --platform android --profile development
```

### 3. Testing Push Notifications

#### Method 1: Using Expo Push Tool (Easiest)
1. Open the app and go to Notice tab
2. Tap "Show Token" to get your push token
3. Go to: https://expo.dev/notifications
4. Paste your token and send a test notification

#### Method 2: Using curl (Advanced)
```powershell
curl -X POST https://exp.host/--/api/v2/push/send -H "Content-Type: application/json" -d '{
  "to": "ExponentPushToken[YOUR_TOKEN_HERE]",
  "title": "Test Notification",
  "body": "This is a test notification from your CV app!"
}'
```

#### Method 3: Using Node.js Script
Create a test script:
```javascript
const axios = require('axios');

async function sendPushNotification(token, title, body) {
  try {
    const response = await axios.post('https://exp.host/--/api/v2/push/send', {
      to: token,
      title: title,
      body: body,
      data: { customData: 'any custom data here' }
    });
    console.log('Notification sent:', response.data);
  } catch (error) {
    console.error('Error sending notification:', error.response?.data || error.message);
  }
}

// Usage
sendPushNotification(
  'ExponentPushToken[YOUR_TOKEN_HERE]',
  'Job Alert',
  'A new job matching your criteria has been posted!'
);
```

## How It Works

### App Flow
1. App starts → Request notification permissions
2. Get Expo push token → Store for sending notifications
3. Listen for incoming notifications → Add to Notice tab
4. User can view, mark as read, or clear notifications

### Code Structure
- `contexts/NotificationContext.js` - Manages notification state
- `screens/NoticeScreen.js` - Displays notifications with UI
- `App.js` - Integrates notification context and shows badge

### Key Features
- **Foreground notifications**: Show in Notice tab when app is open
- **Background notifications**: Added to Notice tab when user opens app
- **Badge counting**: Red badge shows unread count
- **Push token display**: For testing and server integration

## Production Setup

### For production apps, you'll need:
1. **FCM setup** (Android): Add google-services.json
2. **APNs setup** (iOS): Configure push certificates
3. **Server integration**: Send notifications from your backend

### Backend Integration Example
```javascript
// Send job alerts to users
async function sendJobAlert(userTokens, jobTitle, jobCompany) {
  const notifications = userTokens.map(token => ({
    to: token,
    title: 'New Job Alert',
    body: `${jobTitle} at ${jobCompany}`,
    data: { 
      type: 'job_alert',
      jobId: 'some-job-id'
    }
  }));

  // Send to Expo push service
  await axios.post('https://exp.host/--/api/v2/push/send', notifications);
}
```

## Troubleshooting

### Common Issues
1. **"Must use physical device"** - Use real device, not simulator
2. **No token generated** - Check permissions were granted
3. **Notifications not appearing** - Ensure using development build, not Expo Go
4. **Badge not updating** - Check NotificationContext is properly wrapped

### Debug Steps
1. Check console for push token
2. Verify permissions are granted
3. Test with Expo push tool first
4. Check notification appears in Notice tab

## Notes
- Notifications automatically appear in Notice tab
- Tap notification to mark as read
- Use "Show Token" button to get token for testing
- Badge shows unread count up to 99+
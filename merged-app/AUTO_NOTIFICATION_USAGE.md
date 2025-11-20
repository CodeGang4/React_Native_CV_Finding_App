# Auto Notification Service - Usage Guide

## 📌 Overview
Universal service to automatically send notifications based on actions. Just import and call after any action - no manual triggers needed!

## 🚀 Installation
```javascript
import AutoNotificationService from '../services/AutoNotificationService';
```

## 📝 Usage Examples

### 1️⃣ After Creating Job (Employer)
```javascript
const createJob = async (jobData) => {
  // Create job
  const newJob = await JobApiService.createJob(jobData);
  
  // ✅ AUTO: Send notification to all candidates
  await AutoNotificationService.notifyJobPosted(newJob, employerId);
  
  return newJob;
};
```

### 2️⃣ After Applying to Job (Candidate)
```javascript
const applyToJob = async (jobId, candidateId) => {
  // Apply to job
  const application = await ApplicationApiService.createApplication({
    candidate_id: candidateId,
    job_id: jobId
  });
  
  // ✅ AUTO: Send notification to employer + confirmation to candidate
  await AutoNotificationService.notifyJobApplication({
    candidateId: candidateId,
    candidateName: user.full_name,
    employerId: job.employer_id,
    jobId: jobId,
    jobTitle: job.title,
    applicationId: application.id
  });
  
  return application;
};
```

### 3️⃣ After Saving Job (Candidate)
```javascript
const saveJob = async (jobId) => {
  // Save job
  await JobApiService.saveJob(jobId, candidateId);
  
  // ✅ AUTO: Notify employer that someone is interested
  await AutoNotificationService.notifyJobSaved({
    candidateId: user.id,
    candidateName: user.full_name,
    employerId: job.employer_id,
    jobId: jobId,
    jobTitle: job.title
  });
};
```

### 4️⃣ After Updating Application Status (Employer)
```javascript
const updateApplicationStatus = async (applicationId, status) => {
  // Update status
  await ApplicationApiService.updateStatus(applicationId, status);
  
  // ✅ AUTO: Notify candidate about status change
  await AutoNotificationService.notifyApplicationStatus({
    candidateId: application.candidate_id,
    candidateName: candidate.name,
    applicationId: applicationId,
    jobTitle: job.title,
    employerId: employer.id
  }, status); // 'accepted', 'rejected', 'reviewing', 'interview'
};
```

### 5️⃣ After Viewing Profile (Employer)
```javascript
const viewCandidateProfile = async (candidateId) => {
  // View profile logic
  const profile = await ProfileApiService.getProfile(candidateId);
  
  // ✅ AUTO: Notify candidate that employer viewed their profile
  await AutoNotificationService.notifyProfileViewed({
    candidateId: candidateId,
    candidateName: profile.full_name,
    employerId: employer.id,
    employerName: employer.company_name,
    jobId: jobId, // optional
    jobTitle: job?.title // optional
  });
  
  return profile;
};
```

### 6️⃣ Job Expiring Warning (System/Cron Job)
```javascript
const checkExpiringJobs = async () => {
  const expiringJobs = await JobApiService.getExpiringJobs();
  
  for (const job of expiringJobs) {
    // ✅ AUTO: Notify employer to renew job
    await AutoNotificationService.notifyJobExpiring({
      jobId: job.id,
      jobTitle: job.title,
      employerId: job.employer_id,
      daysLeft: 3
    });
  }
};
```

### 7️⃣ Welcome New User
```javascript
const registerUser = async (userData, userType) => {
  // Register user
  const newUser = await AuthApiService.register(userData);
  
  // ✅ AUTO: Send welcome notification
  await AutoNotificationService.notifyWelcome(
    newUser.id,
    userType, // 'candidate' or 'employer'
    newUser.full_name
  );
  
  return newUser;
};
```

### 8️⃣ Custom Generic Notification
```javascript
// Send to specific user
await AutoNotificationService.sendNotification({
  recipient_id: userId,
  recipient_type: 'candidate', // or 'employer'
  title: '🎁 Khuyến mãi đặc biệt',
  message: 'Nhận ưu đãi 50% cho gói Premium!',
  type: 'promotion',
  sender_type: 'system',
  data: { promo_code: 'SALE50' }
});

// Broadcast to all candidates
await AutoNotificationService.sendNotification({
  recipient_type: 'all_candidates',
  title: '🎉 Sự kiện việc làm',
  message: 'Tham gia Job Fair 2025 - 1000+ vị trí tuyển dụng!',
  type: 'event',
  sender_type: 'system',
  data: { event_id: '123' }
});

// Broadcast to all employers
await AutoNotificationService.sendNotification({
  recipient_type: 'all_employers',
  title: '📢 Tính năng mới',
  message: 'Thử ngay AI Matching để tìm ứng viên phù hợp!',
  type: 'feature_announcement',
  sender_type: 'system',
  data: { feature: 'ai_matching' }
});
```

## 🎯 Available Methods

| Method | Description | Recipients |
|--------|-------------|------------|
| `notifyJobPosted()` | Job posted by employer | All candidates + Employer (confirmation) |
| `notifyJobApplication()` | Candidate applied to job | Employer + Candidate (confirmation) |
| `notifyJobSaved()` | Candidate saved/bookmarked job | Employer |
| `notifyApplicationStatus()` | Application status changed | Candidate |
| `notifyProfileViewed()` | Employer viewed candidate profile | Candidate |
| `notifyJobExpiring()` | Job posting about to expire | Employer |
| `notifyWelcome()` | New user registered | New user |
| `sendNotification()` | Generic custom notification | Any (specified in params) |

## 📋 Recipient Types

- `candidate` - Single candidate
- `employer` - Single employer
- `all_candidates` - Broadcast to all candidates
- `all_employers` - Broadcast to all employers

## ✨ Features

✅ **Auto-refresh**: Triggers global notification refresh after sending
✅ **Error handling**: Catches and logs errors without breaking app flow
✅ **Type safety**: Clear parameters for each method
✅ **Console logging**: Debug-friendly with emojis
✅ **Flexible**: Support both specific and broadcast notifications

## 🔔 Notification UI Refresh

Service automatically calls `global.refreshNotifications()` after sending notifications:
- Candidates see new job alerts immediately
- Employers see new applications in real-time
- No polling delay (15 seconds) for triggered notifications

## 💡 Best Practices

1. **Always call after action completes**
   ```javascript
   // ✅ Good
   const job = await createJob(data);
   await AutoNotificationService.notifyJobPosted(job, employerId);
   
   // ❌ Bad - notification before job is created
   await AutoNotificationService.notifyJobPosted(job, employerId);
   const job = await createJob(data);
   ```

2. **Don't block UI for notifications**
   ```javascript
   // ✅ Good - fire and forget
   createJob(data).then(job => {
     AutoNotificationService.notifyJobPosted(job, employerId);
   });
   
   // or with await in try-catch
   try {
     const job = await createJob(data);
     await AutoNotificationService.notifyJobPosted(job, employerId);
   } catch (error) {
     // Handle error
   }
   ```

3. **Include all required data**
   ```javascript
   // ✅ Good - complete data
   await AutoNotificationService.notifyJobApplication({
     candidateId: user.id,
     candidateName: user.full_name,
     employerId: job.employer_id,
     jobId: job.id,
     jobTitle: job.title,
     applicationId: application.id
   });
   
   // ❌ Bad - missing data
   await AutoNotificationService.notifyJobApplication({
     candidateId: user.id,
     jobId: job.id
   });
   ```

## 🐛 Debugging

Service logs all actions with emojis:
- 🔔 Starting notification send
- ✅ Success
- ❌ Error

Check console for logs like:
```
🔔 [AutoNotify] Job Posted: Senior Developer
✅ [AutoNotify] Job Posted notification sent
```

## 🎨 Customization

To add new notification types:

```javascript
// In AutoNotificationService.js
async notifyCustomEvent(data) {
  try {
    console.log('🔔 [AutoNotify] Custom Event:', data.title);
    
    await notificationApiService.createNotification({
      recipient_id: data.userId,
      recipient_type: data.userType,
      title: data.title,
      message: data.message,
      type: 'custom_event',
      sender_type: 'system',
      data: data.extraData
    });
    
    this._triggerRefresh();
    console.log('✅ [AutoNotify] Custom Event sent');
  } catch (error) {
    console.error('❌ [AutoNotify] Custom Event failed:', error);
  }
}
```

Then use it:
```javascript
await AutoNotificationService.notifyCustomEvent({
  userId: '123',
  userType: 'candidate',
  title: 'Custom Event',
  message: 'Something happened!',
  extraData: { key: 'value' }
});
```

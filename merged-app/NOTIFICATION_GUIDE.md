# 🔔 Notification System - Hướng dẫn sử dụng

## 📋 Tổng quan

Hệ thống notification đã được cập nhật để hoạt động thực tế hơn với:

- ✅ **Tích hợp với AuthContext** - Tự động sync user và role
- ✅ **Backend API Service** - Lưu trữ notification trong database
- ✅ **Real-time polling** - Tự động check notification mới (30 giây/lần)
- ✅ **Trigger Service** - Tự động tạo notification khi có action
- ✅ **Job Actions Hook** - Tích hợp notification với job actions

## 🚀 Cách test notification thực tế

### **1. Test cơ bản (Local + Backend)**
```javascript
// Trong notification screen, nhấn button "Test thông báo"
// Hoặc gọi trực tiếp:
const { sendTestNotification } = useNotifications();
await sendTestNotification();
```

### **2. Test Job Saved (Thực tế nhất)**
```javascript
// Trong candidate notification screen
const { testJobSavedNotification } = useJobActions();
await testJobSavedNotification();
```

### **3. Test trong code (Manual trigger)**
```javascript
import { useNotifications } from '../../shared/contexts/NotificationContext';

const { triggerJobSaved } = useNotifications();

// Trigger khi candidate save job
await triggerJobSaved(
  candidateId,
  jobId, 
  { title: 'React Developer', company_name: 'Tech Corp' },
  employerId
);
```

## 🔧 Tích hợp với job actions thực tế

### **Save Job với notification:**
```javascript
import { useJobActions } from '../../shared/hooks/useJobActions';

const { saveJobWithNotification } = useJobActions();

const handleSaveJob = async () => {
  const result = await saveJobWithNotification(
    jobId,
    jobData, // { title, company_name, etc. }
    employerId
  );
  
  if (result.success) {
    console.log('Job saved and notification sent!');
  }
};
```

### **Apply Job với notification:**
```javascript
const { applyJobWithNotification } = useJobActions();

const handleApplyJob = async () => {
  const result = await applyJobWithNotification(
    jobId,
    jobData,
    employerId,
    applicationData // CV, cover letter, etc.
  );
  
  if (result.success) {
    console.log('Application submitted and notification sent!');
  }
};
```

## 📡 Backend API Endpoints

Hệ thống sử dụng các endpoint sau:

```
GET    /notice/user/{userId}           - Lấy notifications của user
POST   /notice/create                  - Tạo notification mới
PUT    /notice/read/{notificationId}   - Đánh dấu đã đọc
PUT    /notice/read-all/{userId}       - Đánh dấu tất cả đã đọc
DELETE /notice/{notificationId}        - Xóa notification
```

## 🎯 Các loại notification

### **Candidate nhận:**
- 💼 **new_job** - Job mới phù hợp
- 👀 **profile_view** - Employer xem profile
- 📨 **interview_invite** - Lời mời phỏng vấn
- 📋 **application_update** - Cập nhật đơn ứng tuyển

### **Employer nhận:**
- 🔖 **job_saved** - Candidate save job
- 📋 **job_application** - Đơn ứng tuyển mới
- ✅ **job_approved** - Job được duyệt
- 🚫 **job_rejected** - Job bị từ chối

## 🔄 Auto-sync và Real-time

- **Polling**: Tự động check notification mới mỗi 30 giây
- **Auth sync**: Tự động sync với user login/logout
- **Badge update**: Số badge trên tab icon tự động cập nhật
- **Local cache**: Notifications được cache local khi offline

## 🛠️ Troubleshooting

### **Notification không hiện:**
1. Check console logs xem có error API không
2. Verify user đã login và có đúng role
3. Check backend server có chạy không
4. Test với button "Test thông báo" trước

### **Badge không update:**
1. Check `unreadCount` trong NotificationContext
2. Verify TabNavigator đã import đúng context
3. Force refresh bằng `refreshNotifications()`

### **Polling không hoạt động:**
1. Check user có login không (polling chỉ chạy khi có user)
2. Xem console log có message polling không
3. Check `startPolling()` được gọi chưa

## 📱 Demo Flow

1. **Login** → Notification context tự động fetch notifications
2. **Candidate save job** → Employer nhận notification "Job được quan tâm"
3. **Employer đăng job mới** → Candidates nhận notification "Job mới phù hợp"
4. **Real-time update** → Notifications tự động refresh mỗi 30s

## 🎨 UI Features

- ✅ Badge đỏ trên tab icon khi có unread
- ✅ Dot xanh bên cạnh notification chưa đọc  
- ✅ Pull to refresh
- ✅ Empty state với các option test
- ✅ Loading states
- ✅ Error handling

---

💡 **Tip**: Để test đầy đủ, hãy có 2 device/emulator - 1 candidate và 1 employer, thực hiện actions trên candidate và xem notification trên employer!
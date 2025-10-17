# 🚀 Rate Limiting Implementation Guide

## 📋 **Tổng quan**
Hệ thống Rate Limiting đã được tích hợp vào project để xử lý lỗi "Too Many Requests" (HTTP 429).

## 🛠️ **Các thành phần đã được cài đặt**

### 1. **RateLimitHandler** (`src/shared/utils/RateLimitHandler.js`)
- ✅ Exponential backoff retry với jitter
- ✅ Request queuing với priority
- ✅ Throttling protection  
- ✅ Request batching
- ✅ Monitoring và statistics

### 2. **ApiClient** (đã được nâng cấp)
- ✅ Tích hợp RateLimitHandler
- ✅ Auto retry cho HTTP 429
- ✅ Priority support (high, normal, low)
- ✅ Rate limit status monitoring

### 3. **RateLimitMonitor** (`src/components/debug/RateLimitMonitor.js`)
- ✅ Real-time monitoring trong development
- ✅ Visual feedback cho rate limit status
- ✅ Manual pause/resume controls

## 🎯 **Cách sử dụng**

### **1. Sử dụng Priority cho API calls**
```javascript
// High priority (urgent requests)
await JobApiService.createJob(jobData, companyId); // Auto high priority
await JobApiService.getJobById(jobId); // Auto high priority

// Normal priority  
await JobApiService.getAllJobs(params); // Auto normal priority

// Custom priority
await apiClient.get('/some-endpoint', { 
  priority: 'low' // hoặc 'normal', 'high'
});
```

### **2. Control Rate Limiting**
```javascript
import { apiClient } from '../services/api/ApiClient';

// Kiểm tra trạng thái
const status = apiClient.getRateLimitStatus();
console.log('Queue length:', status.queueLength);
console.log('Active requests:', status.activeRequests);

// Tạm dừng requests (emergency)
apiClient.pauseRequests();

// Tiếp tục requests
apiClient.resumeRequests();

// Cập nhật config
apiClient.setRateLimitConfig({
  maxConcurrentRequests: 5,  // Giảm số request đồng thời
  requestDelay: 200         // Tăng delay giữa requests
});
```

### **3. Monitoring trong Development**
- Mở app trong development mode
- Nhấn vào icon 📊 ở góc trên bên phải
- Monitor real-time rate limit status
- Sử dụng Pause/Resume để test

## ⚙️ **Configuration Options**

### **RateLimitHandler Config**
```javascript
{
  maxConcurrentRequests: 10,    // Số request đồng thời tối đa
  requestDelay: 100,           // Delay giữa các request (ms)
  retryDelays: [1000, 2000, 4000, 8000, 16000], // Exponential backoff
  maxRetries: 5,               // Số lần retry tối đa
  priorityWeights: {           // Trọng số ưu tiên
    high: 3,
    normal: 2,
    low: 1
  }
}
```

## 🐛 **Debugging**

### **Common Issues & Solutions**

#### **1. Vẫn gặp HTTP 429**
```javascript
// Giảm số concurrent requests
apiClient.setRateLimitConfig({
  maxConcurrentRequests: 3,  // Giảm từ 10 xuống 3
  requestDelay: 300         // Tăng delay lên 300ms
});
```

#### **2. App chậm do rate limiting**
```javascript
// Tăng concurrent requests nếu server stable
apiClient.setRateLimitConfig({
  maxConcurrentRequests: 15, // Tăng lên 15
  requestDelay: 50          // Giảm delay xuống 50ms
});
```

#### **3. Priority không hoạt động**
- Kiểm tra config `priorityWeights`
- Đảm bảo set priority trong API calls
- Check RateLimitMonitor để verify

### **Debug Commands**
```javascript
// Trong console hoặc debugger
console.log(apiClient.getRateLimitStatus());
console.log(apiClient.rateLimitHandler.config);
console.log(apiClient.rateLimitHandler.queue.items.length);
```

## 📈 **Performance Tips**

### **1. Request Batching**
```javascript
// Thay vì gọi từng request riêng lẻ
await Promise.all([
  JobApiService.getJobById(1),
  JobApiService.getJobById(2), 
  JobApiService.getJobById(3)  // Có thể trigger rate limit
]);

// Hãy sử dụng batch API nếu có
await JobApiService.getJobsByIds([1, 2, 3]);
```

### **2. Smart Priority Usage**
```javascript
// Critical user actions
await apiClient.post('/job', data, { priority: 'high' });

// Background data loading  
await apiClient.get('/jobs', { priority: 'low' });

// Normal user interactions
await apiClient.get('/job/123', { priority: 'normal' });
```

### **3. Optimize for User Experience**
```javascript
// Preload data với low priority
useEffect(() => {
  JobApiService.getAllJobs({ priority: 'low' });
}, []);

// User click thì high priority
const handleJobClick = (jobId) => {
  JobApiService.getJobById(jobId); // Auto high priority
};
```

## 🚀 **Production Deployment**

### **Before Release:**
1. ✅ Test với RateLimitMonitor enabled
2. ✅ Verify retry logic hoạt động
3. ✅ Check performance impact
4. ✅ Monitor error rates
5. ✅ Set appropriate config cho production

### **Production Config:**
```javascript
// Trong app.config.js hoặc Constants
const PROD_RATE_LIMIT_CONFIG = {
  maxConcurrentRequests: 8,
  requestDelay: 150,
  maxRetries: 3,
  retryDelays: [1000, 3000, 9000]
};
```

## 📞 **Support**

Nếu gặp issues:
1. Check RateLimitMonitor trong development
2. Review console logs cho rate limit errors  
3. Adjust config theo pattern sử dụng
4. Test với different priority levels

---
**Rate Limiting đã sẵn sàng! 🎉**
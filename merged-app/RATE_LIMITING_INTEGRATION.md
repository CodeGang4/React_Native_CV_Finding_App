# Rate Limiting Integration - Candidate Side

## 📋 Tổng Quan

Rate limiting đã được tích hợp thành công vào phía candidate để xử lý vấn đề "Too Many Requests" (429) và các lỗi API throttling khác.

## ✅ Các Thay Đổi Đã Thực Hiện

### 1. **RateLimitMonitor Component** 
Component đã tồn tại tại `src/components/debug/RateLimitMonitor.js` và đã được tích hợp vào các screen chính của candidate:

#### Candidate Screens đã tích hợp RateLimitMonitor:
- ✅ `CandidateHomeScreen.js` - Trang chủ candidate
- ✅ `ApplicationsScreen.js` - Trang đơn ứng tuyển
- ✅ `NotificationsScreen.js` - Trang thông báo

#### Cách sử dụng:
```javascript
import RateLimitMonitor from '../../components/debug/RateLimitMonitor';

// Trong component
<RateLimitMonitor enabled={__DEV__} />
```

### 2. **ApiClient Configuration**
File: `src/shared/services/api/ApiClient.js`

**Cấu hình rate limiting đã được cập nhật:**
```javascript
this.rateLimitHandler = new RateLimitHandler({
  maxConcurrentRequests: 10,  // Cho phép tối đa 10 request đồng thời
  requestDelay: 100,           // Delay 100ms giữa các request
  retryDelays: [1000, 2000, 4000, 8000, 16000], // Exponential backoff
});
```

**Trước đây (conservative settings):**
```javascript
// Old settings - Quá conservative
maxConcurrentRequests: 5
requestDelay: 200
retryDelays: []  // Không có retry
```

### 3. **API Services đã sử dụng ApiClient**
Tất cả API services đã sử dụng apiClient với rate limiting:

✅ **Candidate Services:**
- `JobApiService.js` - Lấy danh sách jobs, save jobs
- `ApplicationApiService.js` - Quản lý đơn ứng tuyển
- `CandidateApiService.js` - Thông tin candidate
- `NotificationApiService.js` - Thông báo

✅ **Shared Services:**
- `AuthApiService.js` - Authentication
- `UserApiService.js` - User profile
- `CompanyApiService.js` - Company info
- `InterviewApiService.js` - Interview questions
- `HomeApiService.js` - Home page data

## 🎯 Tính Năng

### Rate Limiting Features:
1. **Request Queuing** - Xếp hàng các request khi quá tải
2. **Priority System** - Ưu tiên POST/PUT/PATCH requests
3. **Exponential Backoff** - Tự động retry với delay tăng dần
4. **Concurrent Limiting** - Giới hạn số request đồng thời
5. **Request Throttling** - Delay giữa các request

### RateLimitMonitor Features:
- 📊 **Real-time Statistics:**
  - Active Requests (đang xử lý)
  - Queue Length (đang chờ)
  - Success/Failed Count
  - Retry Count
  - Throttle Status

- 🎮 **Control Functions:**
  - ⏸️ Pause Requests - Tạm dừng tất cả request
  - ▶️ Resume Requests - Tiếp tục xử lý request

- 🎨 **Visual Indicators:**
  - 🟢 Green - Hoạt động bình thường
  - 🟡 Yellow - Queue đang tăng
  - 🟠 Orange - Active requests cao
  - 🔴 Red - Bị throttled

## 📱 Cách Sử Dụng

### Development Mode:
1. RateLimitMonitor tự động hiển thị ở góc phải màn hình (development mode)
2. Click vào icon 📊 để mở/đóng monitor
3. Xem real-time statistics khi app đang gọi API
4. Dùng Pause/Resume để test rate limiting behavior

### Production Mode:
- RateLimitMonitor tự động ẩn (`enabled={__DEV__}`)
- Rate limiting vẫn hoạt động ngầm bảo vệ app khỏi throttling

## 🔍 Debugging

### Kiểm tra Rate Limiting:
```javascript
// Xem status của rate limiter
const status = apiClient.getRateLimitStatus();
console.log('Rate Limit Status:', status);
// Output: { activeRequests, queueLength, successCount, failedCount, retryCount, isThrottled, lastError }
```

### Tùy chỉnh Configuration:
```javascript
// Thay đổi config runtime (ví dụ khi test)
apiClient.setRateLimitConfig({
  maxConcurrentRequests: 5,
  requestDelay: 200
});
```

### Pause/Resume Requests:
```javascript
// Tạm dừng tất cả requests
apiClient.pauseRequests();

// Tiếp tục xử lý
apiClient.resumeRequests();
```

## 🎨 UI Integration

### RateLimitMonitor UI:
```
┌─────────────────────────┐
│ Rate Limit Monitor   [✕]│
├─────────────────────────┤
│ 🏃 Active: 3            │
│ ⏳ Queue: 5             │
│ ✅ Success: 142         │
│ ❌ Failed: 2            │
│ 🔄 Retries: 4           │
│                         │
│ 🚫 THROTTLED (if true) │
│ 💥 Last Error: ...      │
├─────────────────────────┤
│  [⏸️ Pause] [▶️ Resume] │
└─────────────────────────┘
```

### Toggle Button (collapsed):
```
 ┌──┐
 │📊│  <- Click để mở monitor
 └──┘
```

## 🚀 Performance Impact

### Improvements:
- ✅ Giảm lỗi 429 (Too Many Requests)
- ✅ Tự động retry khi network errors
- ✅ Tránh overwhelm backend với concurrent requests
- ✅ Better user experience với queue system

### Overhead:
- Minimal (< 100ms delay per request)
- Queue processing trong background
- Memory footprint nhỏ

## 📖 Tài Liệu Tham Khảo

Xem thêm chi tiết tại: [RATE_LIMITING_GUIDE.md](./RATE_LIMITING_GUIDE.md)

### Files liên quan:
- `src/shared/utils/RateLimitHandler.js` - Core rate limiting logic
- `src/shared/services/api/ApiClient.js` - API client với rate limiting
- `src/components/debug/RateLimitMonitor.js` - Debug UI component

## ✨ Next Steps

### Đề xuất cải tiến:
1. ⚡ **Adaptive Rate Limiting** - Tự động điều chỉnh config dựa trên response headers
2. 📊 **Analytics** - Track rate limit statistics lên backend
3. 🔔 **User Notifications** - Thông báo user khi bị throttled
4. 💾 **Persistent Storage** - Lưu statistics vào AsyncStorage

### Monitoring:
- Theo dõi `retryCount` và `failedCount` trong production
- Alert khi `isThrottled` = true quá lâu
- Log `lastError` để debug

## 🎉 Kết Luận

Rate limiting đã được tích hợp hoàn chỉnh vào phía candidate:
- ✅ ApiClient đã có RateLimitHandler với config tối ưu
- ✅ RateLimitMonitor được thêm vào 3 screens chính
- ✅ Tất cả API services đều được bảo vệ
- ✅ Development tools để debug và monitor

**App candidate giờ đây có khả năng xử lý rate limiting tốt như employer side! 🚀**

# 💳 Payment Integration Guide

## 📋 **Tổng quan**

Hệ thống thanh toán đã được tích hợp với Stripe cho phép user nâng cấp tài khoản Premium/Pro.

## 🎯 **Các Components đã được tạo**

### **1. Payment Screens**

#### **PaymentSuccessScreen** (`src/shared/screens/payment/PaymentSuccessScreen.js`)
- ✅ Hiển thị thông tin thanh toán thành công
- ✅ Verify payment với backend
- ✅ Hiển thị transaction details
- ✅ Show premium benefits
- ✅ Animation effects
- ✅ Navigation to home hoặc payment history

**Usage:**
```javascript
navigation.navigate('PaymentSuccess', { session_id: 'cs_test_xxx' });
```

#### **PaymentFailedScreen** (`src/shared/screens/payment/PaymentFailedScreen.js`)
- ✅ Hiển thị khi thanh toán thất bại hoặc bị cancel
- ✅ Support 2 modes: 'failed' và 'cancelled'
- ✅ Show common payment issues
- ✅ Retry button
- ✅ Contact support option

**Usage:**
```javascript
// When payment fails
navigation.navigate('PaymentFailed', { reason: 'failed' });

// When user cancels
navigation.navigate('PaymentFailed', { reason: 'cancelled' });
```

#### **PaymentHistoryScreen** (`src/shared/screens/payment/PaymentHistoryScreen.js`)
- ✅ Hiển thị lịch sử thanh toán
- ✅ Pull-to-refresh
- ✅ Status badges (succeeded, pending, failed)
- ✅ Transaction details
- ✅ Empty state handling

### **2. Payment API Service** (`src/shared/services/api/PaymentApiService.js`)

```javascript
// Create checkout session
const checkout = await PaymentApiService.createCheckout(2500, 'usd');
// Returns: { payment_id, session_id, checkout_url }

// Verify payment
const payment = await PaymentApiService.verifyPayment(sessionId);

// Get payment history
const history = await PaymentApiService.getPaymentHistory();

// Get payment by ID
const payment = await PaymentApiService.getPaymentById(paymentId);

// Cancel payment
await PaymentApiService.cancelPayment(paymentId);

// Get subscription status
const subscription = await PaymentApiService.getSubscriptionStatus();
```

### **3. Updated UpgradeAccount Screen**

- ✅ Payment integration
- ✅ Multiple plans support (Pro, Premium)
- ✅ Stripe checkout redirect
- ✅ Loading states
- ✅ Confirmation dialogs
- ✅ Payment history link

## 🔄 **Payment Flow**

### **Complete User Journey:**

```
1. User clicks "Nâng cấp ngay" trên UpgradeAccount
   ↓
2. Confirmation alert hiển thị
   ↓
3. Call PaymentApiService.createCheckout()
   ↓
4. Backend tạo Stripe session + lưu payment record (status='pending')
   ↓
5. App mở Stripe checkout URL trong browser (Linking.openURL)
   ↓
6. User nhập thông tin thanh toán trên Stripe
   ↓
7. Stripe xử lý thanh toán
   ↓
8. Stripe gửi webhook về backend
   ↓
9. Backend update payment status='succeeded' hoặc 'failed'
   ↓
10. Stripe redirect user về:
    - success_url: /payment/success?session_id=xxx
    - cancel_url: /payment/cancel
   ↓
11. App handle deep link và navigate đến:
    - PaymentSuccessScreen (nếu thành công)
    - PaymentFailedScreen (nếu thất bại/cancel)
```

## ⚙️ **Backend Requirements**

### **Required API Endpoints:**

1. **POST /payment/checkout**
   - Input: `{ amount, currency }`
   - Output: `{ success, payment_id, session_id, checkout_url }`

2. **GET /payment/success?session_id=xxx**
   - Verify và update user level
   - Output: `{ success, payment_status, payment }`

3. **POST /payment/webhook**
   - Stripe webhook handler
   - Update payment status

4. **GET /payment/history**
   - Get user's payment history
   - Output: `{ success, payments: [...] }`

5. **GET /payment/:paymentId**
   - Get payment details
   - Output: `{ success, payment }`

### **Database Table:**

```sql
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  amount_cents bigint NOT NULL,
  currency char(3) NOT NULL DEFAULT 'usd',
  provider varchar(50) NOT NULL DEFAULT 'stripe',
  provider_transaction_id text,
  status varchar(20) NOT NULL DEFAULT 'pending',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## 📱 **Deep Linking Setup**

### **Required for handling Stripe redirects:**

#### **1. Update app.config.js:**

```javascript
export default {
  expo: {
    scheme: "yourapp",
    // ...
  }
}
```

#### **2. Handle deep links trong AppNavigator:**

```javascript
import { Linking } from 'react-native';

// Listen for deep links
useEffect(() => {
  const handleDeepLink = (event) => {
    const url = event.url;
    
    // Parse URL
    if (url.includes('/payment/success')) {
      const sessionId = new URL(url).searchParams.get('session_id');
      navigation.navigate('PaymentSuccess', { session_id: sessionId });
    } else if (url.includes('/payment/cancel')) {
      navigation.navigate('PaymentFailed', { reason: 'cancelled' });
    }
  };

  Linking.addEventListener('url', handleDeepLink);
  
  // Check initial URL
  Linking.getInitialURL().then((url) => {
    if (url) handleDeepLink({ url });
  });

  return () => {
    Linking.removeEventListener('url', handleDeepLink);
  };
}, []);
```

## 🧪 **Testing**

### **Test Cases:**

1. **Successful Payment:**
   - Click "Nâng cấp ngay"
   - Complete payment on Stripe
   - Verify redirect to PaymentSuccessScreen
   - Check user level updated to 'premium'

2. **Failed Payment:**
   - Use test card: 4000 0000 0000 0002
   - Verify redirect to PaymentFailedScreen

3. **Cancelled Payment:**
   - Click back on Stripe page
   - Verify redirect to PaymentFailedScreen

4. **Payment History:**
   - Navigate to Payment History
   - Verify all payments shown
   - Test pull-to-refresh

### **Stripe Test Cards:**

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Expired: 4000 0000 0000 0069
```

## 🔒 **Security Notes**

- ✅ NEVER store card details in app
- ✅ All payment processing handled by Stripe
- ✅ Backend verifies webhook signatures
- ✅ Use HTTPS for production
- ✅ Validate session_id before showing success

## 🚀 **Production Checklist**

- [ ] Update Stripe keys to production keys
- [ ] Setup production webhook endpoint
- [ ] Configure deep linking với production domain
- [ ] Test với real payment methods
- [ ] Setup email notifications cho successful payments
- [ ] Add analytics tracking
- [ ] Setup error monitoring (Sentry, etc.)

## 📞 **Support**

Nếu gặp issues:
1. Check console logs cho payment errors
2. Verify Stripe webhook configuration
3. Test với Stripe test cards
4. Check backend logs

---
**Payment Integration hoàn tất! 💳✨**
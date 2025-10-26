# 💳 Payment API Endpoints Documentation

## 📋 Overview

Backend payment API với Stripe integration để xử lý thanh toán premium subscriptions.

## 🔗 Base URL

```
http://your-domain.com/payment
```

## 🔐 Authentication

Hầu hết các endpoints yêu cầu JWT token trong header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📝 Endpoints

### 1. Create Checkout Session

Tạo Stripe checkout session để user thanh toán.

**Endpoint:** `POST /payment/checkout`

**Authentication:** Required ✅

**Request Body:**
```json
{
  "amount": 2500,
  "currency": "usd",
  "payment_method_types": ["card"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "payment_id": "uuid",
  "session_id": "cs_test_...",
  "checkout_url": "https://checkout.stripe.com/..."
}
```

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `400 Bad Request`: Invalid amount
- `500 Internal Server Error`: Checkout creation failed

---

### 2. Payment Success Callback

Verify payment sau khi user hoàn tất thanh toán.

**Endpoint:** `GET /payment/success`

**Authentication:** Not Required ❌

**Query Parameters:**
- `session_id` (required): Stripe checkout session ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment successful",
  "payment_status": "paid",
  "payment": {
    "id": "uuid",
    "user_id": "uuid",
    "amount_cents": 2500,
    "currency": "usd",
    "status": "succeeded",
    "created_at": "2025-10-26T10:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing session_id
- `404 Not Found`: Payment not found
- `500 Internal Server Error`: Failed to verify payment

---

### 3. Get Payment History

Lấy lịch sử thanh toán của user hiện tại.

**Endpoint:** `GET /payment/history`

**Authentication:** Required ✅

**Response (200 OK):**
```json
{
  "success": true,
  "payments": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "amount_cents": 2500,
      "currency": "usd",
      "provider": "stripe",
      "provider_transaction_id": "cs_test_...",
      "status": "succeeded",
      "metadata": {
        "session_id": "cs_test_..."
      },
      "created_at": "2025-10-26T10:00:00Z",
      "updated_at": "2025-10-26T10:05:00Z"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `500 Internal Server Error`: Failed to fetch payment history

---

### 4. Get Payment Details

Lấy chi tiết một payment cụ thể.

**Endpoint:** `GET /payment/:paymentId`

**Authentication:** Required ✅

**URL Parameters:**
- `paymentId` (required): Payment UUID

**Response (200 OK):**
```json
{
  "success": true,
  "payment": {
    "id": "uuid",
    "user_id": "uuid",
    "amount_cents": 2500,
    "currency": "usd",
    "provider": "stripe",
    "provider_transaction_id": "cs_test_...",
    "status": "succeeded",
    "metadata": {
      "session_id": "cs_test_...",
      "payment_status": "paid"
    },
    "created_at": "2025-10-26T10:00:00Z",
    "updated_at": "2025-10-26T10:05:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `400 Bad Request`: Payment ID is required
- `404 Not Found`: Payment not found
- `500 Internal Server Error`: Failed to retrieve payment

---

### 5. Cancel Payment

Cancel một payment đang ở trạng thái pending.

**Endpoint:** `POST /payment/:paymentId/cancel`

**Authentication:** Required ✅

**URL Parameters:**
- `paymentId` (required): Payment UUID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment cancelled successfully",
  "payment": {
    "id": "uuid",
    "status": "cancelled",
    "metadata": {
      "cancelled_at": "2025-10-26T10:10:00Z",
      "cancelled_by": "user_uuid"
    },
    "updated_at": "2025-10-26T10:10:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `400 Bad Request`: 
  - Payment ID is required
  - Only pending payments can be cancelled
- `404 Not Found`: Payment not found
- `500 Internal Server Error`: Failed to cancel payment

---

### 6. Get Subscription Status

Lấy thông tin subscription của user hiện tại.

**Endpoint:** `GET /payment/subscription/status`

**Authentication:** Required ✅

**Response (200 OK):**
```json
{
  "success": true,
  "subscription": {
    "level": "premium",
    "isActive": true,
    "isPremium": true,
    "subscriptionExpiry": "2026-10-26T10:00:00Z",
    "daysRemaining": 365,
    "latestPayment": {
      "id": "uuid",
      "amount_cents": 2500,
      "currency": "usd",
      "status": "succeeded",
      "created_at": "2025-10-26T10:00:00Z"
    },
    "stats": {
      "total": 5,
      "succeeded": 3,
      "pending": 1,
      "failed": 1,
      "cancelled": 0
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `500 Internal Server Error`: Failed to retrieve subscription status

---

### 7. Stripe Webhook

Nhận webhook events từ Stripe (chỉ Stripe gọi).

**Endpoint:** `POST /payment/webhook`

**Authentication:** Stripe Signature Verification 🔐

**Headers:**
- `stripe-signature`: Webhook signature từ Stripe

**Request Body:** Raw JSON event từ Stripe

**Supported Events:**
- `checkout.session.completed`: Payment session hoàn tất
- `payment_intent.succeeded`: Payment thành công
- `payment_intent.payment_failed`: Payment thất bại

**Response (200 OK):**
```json
{
  "received": true
}
```

**Error Responses:**
- `400 Bad Request`: Invalid signature
- `500 Internal Server Error`: 
  - Webhook secret not configured
  - Webhook processing failed

---

## 🗄️ Database Schema

### Payments Table

```sql
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  amount_cents bigint NOT NULL CHECK (amount_cents >= 0),
  currency char(3) NOT NULL DEFAULT 'usd',
  provider varchar(50) NOT NULL DEFAULT 'stripe',
  provider_transaction_id text,
  status varchar(20) NOT NULL DEFAULT 'pending',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### Status Values

- `pending`: Payment được tạo nhưng chưa xử lý
- `succeeded`: Payment thành công
- `failed`: Payment thất bại
- `cancelled`: Payment bị cancel bởi user

---

## ⚙️ Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
DOMAIN_URL=https://your-domain.com
```

---

## 🧪 Testing

### Test với Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Requires Authentication: 4000 0025 0000 3155
Expired: 4000 0000 0000 0069
```

### Test Flow

1. Call `POST /payment/checkout` với test amount
2. Mở `checkout_url` trong browser
3. Sử dụng test card để thanh toán
4. Verify webhook được gọi (check logs)
5. Call `GET /payment/success` để verify
6. Check `GET /payment/history` để xem lịch sử

---

## 🔒 Security Notes

1. **Webhook Verification**: MUST verify Stripe signature
2. **Raw Body**: Webhook route MUST use `express.raw()`
3. **Authentication**: Protected routes use JWT
4. **User Ownership**: Users chỉ access được payments của họ
5. **Amount Storage**: Lưu bằng cents để tránh floating point errors

---

## 📊 Common Use Cases

### Case 1: User Upgrade to Premium

```javascript
// 1. Create checkout
const checkout = await fetch('/payment/checkout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 2500, // $25.00
    currency: 'usd'
  })
});

// 2. Redirect to checkout URL
window.location.href = checkout.checkout_url;

// 3. User completes payment on Stripe

// 4. Stripe sends webhook → backend updates payment

// 5. User redirected back → verify payment
const result = await fetch(`/payment/success?session_id=${sessionId}`);
```

### Case 2: Check Subscription Status

```javascript
const subscription = await fetch('/payment/subscription/status', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

if (subscription.subscription.isPremium) {
  // Show premium features
}
```

### Case 3: View Payment History

```javascript
const history = await fetch('/payment/history', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Display payments list
history.payments.forEach(payment => {
  console.log(`${payment.amount_cents/100} ${payment.currency} - ${payment.status}`);
});
```

---

## 🐛 Troubleshooting

### Issue: Webhook not working

**Solution:**
1. Check `STRIPE_WEBHOOK_SECRET` is set
2. Verify webhook signature
3. Check webhook route uses `express.raw()`
4. Test with Stripe CLI: `stripe listen --forward-to localhost:3000/payment/webhook`

### Issue: Payment not updating

**Solution:**
1. Check webhook logs
2. Verify Stripe dashboard for events
3. Check database for payment record
4. Ensure `provider_transaction_id` matches

### Issue: User level not updating

**Solution:**
1. Check `success` endpoint logs
2. Verify user table has `level` column
3. Check `user_id` in payment record

---

**Payment API Ready! 💳✨**

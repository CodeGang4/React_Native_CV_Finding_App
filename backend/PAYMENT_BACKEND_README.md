# 💳 Backend Payment System - Quick Start Guide

## 📋 Overview

Backend payment system với Stripe integration đã được hoàn thiện với đầy đủ endpoints và features.

## ✅ Đã Implement

### **Controllers** (`src/controllers/ClientControllers/PaymentController.js`)

- ✅ `checkout()` - Tạo Stripe checkout session
- ✅ `webhook()` - Xử lý Stripe webhooks
- ✅ `success()` - Verify payment thành công
- ✅ `getPaymentHistory()` - Lấy lịch sử thanh toán
- ✅ `getPaymentById()` - Lấy chi tiết payment
- ✅ `cancelPayment()` - Cancel pending payment
- ✅ `getSubscriptionStatus()` - Lấy trạng thái subscription

### **Routes** (`src/routes/ClientRoutes/PaymentRouter.js`)

```javascript
POST   /payment/checkout              // Tạo checkout session (Auth required)
POST   /payment/webhook               // Stripe webhook (No auth)
GET    /payment/success               // Verify payment (No auth)
GET    /payment/history               // Lịch sử thanh toán (Auth required)
GET    /payment/:paymentId            // Chi tiết payment (Auth required)
POST   /payment/:paymentId/cancel     // Cancel payment (Auth required)
GET    /payment/subscription/status   // Subscription status (Auth required)
```

### **Database** (`src/supabase/create_payments_table.sql`)

- ✅ `payments` table với full schema
- ✅ Indexes cho performance
- ✅ Auto-update trigger cho `updated_at`
- ✅ `users.level` column cho premium status

## 🚀 Setup Instructions

### **1. Install Dependencies**

```bash
cd backend
npm install stripe dotenv
```

### **2. Environment Variables**

Tạo/update file `.env`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Domain URL (for redirect URLs)
DOMAIN_URL=http://localhost:3000

# Database (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### **3. Database Migration**

Chạy SQL script để tạo bảng `payments`:

```bash
# Option 1: Qua Supabase Dashboard
# - Vào SQL Editor
# - Copy nội dung từ create_payments_table.sql
# - Execute

# Option 2: Qua psql
psql -h your-db-host -U postgres -d postgres -f src/supabase/create_payments_table.sql
```

### **4. Setup Stripe Webhook**

#### **Development (Local Testing):**

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/payment/webhook

# Copy webhook secret từ output và add vào .env
# whsec_...
```

#### **Production:**

1. Vào https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://your-domain.com/payment/webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy webhook signing secret → `.env`

### **5. Start Server**

```bash
npm start
# hoặc
node src/index.js
```

## 🧪 Testing

### **Option 1: Manual Testing với test-payment-api.js**

```bash
# Update authToken trong file
# Chạy tests
node test-payment-api.js
```

### **Option 2: cURL Commands**

```bash
# 1. Create checkout
curl -X POST http://localhost:3000/payment/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 2500, "currency": "usd"}'

# 2. Get payment history
curl -X GET http://localhost:3000/payment/history \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Get subscription status
curl -X GET http://localhost:3000/payment/subscription/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Option 3: Postman Collection**

Import file `PAYMENT_API_DOCUMENTATION.md` để tạo Postman collection.

### **Test Cards (Stripe)**

```
Success:                4242 4242 4242 4242
Decline:                4000 0000 0000 0002
Requires Auth:          4000 0025 0000 3155
Insufficient Funds:     4000 0000 0000 9995
Expired Card:           4000 0000 0000 0069
```

## 📁 File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── ClientControllers/
│   │       └── PaymentController.js      # ✅ All payment logic
│   ├── routes/
│   │   └── ClientRoutes/
│   │       └── PaymentRouter.js          # ✅ All payment routes
│   └── supabase/
│       └── create_payments_table.sql     # ✅ Database migration
├── PAYMENT_SETUP.md                      # Original payment guide
├── PAYMENT_API_DOCUMENTATION.md          # ✅ Complete API docs
├── test-payment-api.js                   # ✅ Test script
└── PAYMENT_BACKEND_README.md             # This file
```

## 🔄 Payment Flow

```
Client App                Backend                    Stripe
    |                        |                          |
    |--POST /checkout------->|                          |
    |                        |--create session--------->|
    |                        |<--------session----------|
    |<--checkout_url---------|                          |
    |                        |                          |
    |--open URL in browser-------------------------------->|
    |                        |                          |
    |                        |                      [User pays]
    |                        |                          |
    |                        |<---webhook: completed----|
    |                        |--update payment--------->DB
    |                        |--update user.level------>DB
    |                        |                          |
    |<--redirect to success--|                          |
    |                        |                          |
    |--GET /success?session->|                          |
    |<--payment verified-----|                          |
```

## 🔍 Monitoring & Debugging

### **Check Logs**

```bash
# Backend logs
tail -f logs/app.log

# Stripe webhook logs
stripe logs tail
```

### **Common Issues**

#### Issue: Webhook signature verification failed

**Solution:**
- Check `STRIPE_WEBHOOK_SECRET` in `.env`
- Verify webhook route uses `express.raw()`
- Test with Stripe CLI

#### Issue: Payment not updating after webhook

**Solution:**
- Check webhook logs in Stripe Dashboard
- Verify `provider_transaction_id` matches
- Check database for payment record

#### Issue: User level not updating

**Solution:**
- Check `users` table has `level` column
- Run migration script
- Verify `user_id` in payment record

## 📊 Database Queries

### Useful SQL queries:

```sql
-- Get all payments for a user
SELECT * FROM payments 
WHERE user_id = 'user_uuid' 
ORDER BY created_at DESC;

-- Get successful payments count
SELECT status, COUNT(*) 
FROM payments 
GROUP BY status;

-- Get premium users
SELECT u.email, u.level, p.created_at as subscribed_at
FROM users u
JOIN payments p ON u.id = p.user_id
WHERE u.level = 'premium' 
  AND p.status = 'succeeded'
ORDER BY p.created_at DESC;

-- Get revenue by currency
SELECT 
  currency,
  SUM(amount_cents) as total_cents,
  COUNT(*) as payment_count
FROM payments
WHERE status = 'succeeded'
GROUP BY currency;
```

## 🔒 Security Checklist

- ✅ Webhook signature verification
- ✅ JWT authentication on protected routes
- ✅ User ownership validation
- ✅ Amount stored in cents (avoid floating point)
- ✅ Raw body for webhook route
- ✅ HTTPS in production
- ✅ Environment variables for secrets
- ✅ No card data stored

## 📈 Next Steps

### Optional Enhancements:

1. **Email Notifications**
   - Send receipt after successful payment
   - Subscription expiry reminders

2. **Admin Dashboard**
   - View all payments
   - Refund functionality
   - Revenue analytics

3. **Subscription Plans**
   - Multiple tiers (Free, Pro, Premium)
   - Monthly vs Annual pricing
   - Automatic renewals

4. **Webhooks Extended**
   - Handle refunds
   - Handle disputes
   - Subscription lifecycle events

5. **Analytics**
   - Payment success rate
   - Revenue tracking
   - User conversion metrics

## 📞 Support

Nếu gặp vấn đề:

1. Check logs: `console.log` in PaymentController
2. Verify Stripe Dashboard for events
3. Test with Stripe CLI
4. Review `PAYMENT_API_DOCUMENTATION.md`
5. Check database với SQL queries

---

**Backend Payment System sẵn sàng! 💳✨**

Last Updated: October 26, 2025

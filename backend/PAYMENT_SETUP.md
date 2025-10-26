# Payment Setup Guide

## 🔄 Luồng Thanh Toán

```
1. Client gọi POST /payment/checkout
   ↓
2. Server tạo Stripe session + lưu payment với status='pending'
   ↓
3. Server trả về checkout_url → Client redirect user
   ↓
4. User nhập thẻ trên trang Stripe
   ↓
5. Stripe xử lý thanh toán
   ↓
6. Stripe gửi webhook về server: POST /payment/webhook
   ↓
7. Server verify signature → update status='succeeded' hoặc 'failed'
   ↓
8. User redirect về success_url hoặc cancel_url
```

## ⚙️ Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 📝 Setup Webhook trên Stripe Dashboard

1. Vào https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. URL: `https://your-domain.com/api/payment/webhook`
4. Events to send:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy webhook signing secret → STRIPE_WEBHOOK_SECRET

## 🧪 Test Local với Stripe CLI

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/payment/webhook

# Test payment
stripe trigger checkout.session.completed
```

## 🗄️ Database Table

```sql
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  amount_cents bigint NOT NULL CHECK (amount_cents >= 0),
  currency char(3) NOT NULL DEFAULT 'VND',
  provider varchar(50) NOT NULL DEFAULT 'stripe',
  provider_transaction_id text,
  status varchar(20) NOT NULL DEFAULT 'pending',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
```

## 📡 API Endpoints

### POST /api/payment/checkout

**Request:**
```json
{
  "amount": 2500,
  "currency": "usd",
  "payment_method_types": ["card"]
}
```

**Response:**
```json
{
  "success": true,
  "payment_id": "uuid",
  "session_id": "cs_test_...",
  "checkout_url": "https://checkout.stripe.com/..."
}
```

### POST /api/payment/webhook

Stripe tự động gọi (không gọi trực tiếp)

### GET /api/payment/success?session_id=xxx

Sau khi user thanh toán xong

## ⚠️ Lưu ý Quan Trọng

1. **Webhook signature**: PHẢI verify để tránh fake requests
2. **Raw body**: Webhook route PHẢI dùng `express.raw()` không dùng `express.json()`
3. **Amount**: Lưu bằng cents (integer) để tránh lỗi làm tròn
4. **Status**: Chỉ update qua webhook, KHÔNG update sau checkout
5. **Idempotency**: Nên thêm idempotency key để tránh duplicate payments

## 🔐 Security

- Không lưu card number/CVV vào database
- Chỉ lưu: last4, brand, exp_month/year nếu cần (qua metadata)
- Use HTTPS cho production webhook endpoint
- Verify webhook signature mọi lúc

## 📊 Query Examples

```javascript
// Lấy payment của user
const { data } = await supabase
  .from('payments')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// Kiểm tra payment đã thành công chưa
const { data } = await supabase
  .from('payments')
  .select('status')
  .eq('id', paymentId)
  .single();

if (data?.status === 'succeeded') {
  // unlock premium features
}
```

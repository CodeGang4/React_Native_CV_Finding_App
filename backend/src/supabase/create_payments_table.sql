-- Create payments table for handling payment transactions
CREATE TABLE IF NOT EXISTS payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User reference
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    
    -- Payment amount
    amount_cents bigint NOT NULL CHECK (amount_cents >= 0),
    currency char(3) NOT NULL DEFAULT 'usd',
    
    -- Payment provider info
    provider varchar(50) NOT NULL DEFAULT 'stripe',
    provider_transaction_id text,
    
    -- Payment status
    status varchar(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled')),
    
    -- Additional metadata (JSON)
    metadata jsonb DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_provider_txn ON payments(provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER trigger_update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_payments_updated_at();

-- Add level column to users table if not exists (for premium subscription)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'level'
    ) THEN
        ALTER TABLE users ADD COLUMN level varchar(20) DEFAULT 'free' 
            CHECK (level IN ('free', 'premium', 'pro'));
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON TABLE payments IS 'Stores payment transaction records for premium subscriptions';
COMMENT ON COLUMN payments.amount_cents IS 'Payment amount in smallest currency unit (e.g., cents for USD)';
COMMENT ON COLUMN payments.provider_transaction_id IS 'External payment provider transaction ID (e.g., Stripe session ID)';
COMMENT ON COLUMN payments.metadata IS 'Additional payment metadata in JSON format';

-- Create email_logs table for tracking sent emails
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    email_type TEXT NOT NULL CHECK (email_type IN ('formal', 'friendly', 'online', 'interview_invitation', 'update_notification')),
    subject TEXT NOT NULL,
    message_id TEXT,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
    metadata JSONB DEFAULT '{}'::jsonb,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_logs_employer_id ON public.email_logs(employer_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_email ON public.email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON public.email_logs(sent_at DESC);

-- Enable Row Level Security
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Employers can only see their own email logs
CREATE POLICY "Employers can view own email logs" ON public.email_logs
    FOR SELECT
    USING (auth.uid() = employer_id);

-- Policy: System can insert email logs
CREATE POLICY "System can insert email logs" ON public.email_logs
    FOR INSERT
    WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.email_logs IS 'Logs of all emails sent by employers to candidates';

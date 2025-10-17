-- Script để tạo bảng notifications trong Supabase
-- Chạy script này trong SQL Editor của Supabase Dashboard

-- Tạo bảng notifications
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Người nhận (có thể là candidate, employer hoặc admin)
    recipient_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    recipient_type text CHECK (recipient_type IN ('candidate', 'employer', 'admin')) NOT NULL,
    
    -- Người gửi (nullable cho system notifications)
    sender_id uuid REFERENCES users(id) ON DELETE SET NULL,
    sender_type text CHECK (sender_type IN ('candidate', 'employer', 'admin', 'system')),
    
    -- Nội dung thông báo
    title text NOT NULL,
    message text NOT NULL,
    
    -- Loại thông báo
    type text CHECK (type IN (
        'application_status', -- cập nhật trạng thái ứng tuyển
        'interview_schedule', -- lịch phỏng vấn
        'job_posted', -- công việc mới
        'profile_update', -- cập nhật hồ sơ
        'system_announcement', -- thông báo hệ thống
        'email_notification', -- thông báo email
        'account_verification', -- xác thực tài khoản
        'other' -- khác
    )) DEFAULT 'other',
    
    -- Dữ liệu bổ sung (JSON)
    data jsonb DEFAULT '{}', -- chứa job_id, application_id, etc.
    
    -- Trạng thái
    is_read boolean DEFAULT false,
    is_archived boolean DEFAULT false,
    
    -- Thời gian
    created_at timestamp DEFAULT now(),
    read_at timestamp
);

-- Tạo indexes cho performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient 
ON notifications(recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_unread 
ON notifications(recipient_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_type 
ON notifications(recipient_id, type, created_at DESC);

-- Thêm comment cho bảng
COMMENT ON TABLE notifications IS 'Bảng lưu trữ thông báo hệ thống cho users';
COMMENT ON COLUMN notifications.recipient_id IS 'ID của người nhận thông báo';
COMMENT ON COLUMN notifications.sender_id IS 'ID của người gửi (NULL cho system notifications)';
COMMENT ON COLUMN notifications.type IS 'Loại thông báo để phân loại và filter';
COMMENT ON COLUMN notifications.data IS 'Dữ liệu JSON bổ sung (job_id, application_id, etc.)';
COMMENT ON COLUMN notifications.is_read IS 'Trạng thái đã đọc/chưa đọc';
COMMENT ON COLUMN notifications.is_archived IS 'Trạng thái đã xóa/ẩn';

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Tạo RLS policies
-- Policy: Users chỉ có thể xem thông báo của chính họ
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (recipient_id = auth.uid());

-- Policy: Users có thể cập nhật thông báo của chính họ (mark as read, archive)
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (recipient_id = auth.uid());

-- Policy: System và admin có thể tạo thông báo
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Tạo function để automatically update read_at khi is_read = true
CREATE OR REPLACE FUNCTION update_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_read = true AND OLD.is_read = false THEN
        NEW.read_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger
CREATE TRIGGER trigger_update_notification_read_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_read_at();

-- Insert một số sample data để test
INSERT INTO notifications (
    recipient_id, 
    recipient_type, 
    sender_type, 
    title, 
    message, 
    type, 
    data
) VALUES 
(
    (SELECT id FROM users WHERE role = 'candidate' LIMIT 1),
    'candidate',
    'system',
    'Chào mừng bạn đến với ứng dụng',
    'Cảm ơn bạn đã đăng ký tài khoản. Hãy hoàn thiện hồ sơ để tìm được công việc phù hợp.',
    'system_announcement',
    '{"welcome": true}'
),
(
    (SELECT id FROM users WHERE role = 'employer' LIMIT 1),
    'employer',
    'system',
    'Tài khoản đã được xác thực',
    'Tài khoản công ty của bạn đã được xác thực thành công. Bạn có thể bắt đầu đăng tin tuyển dụng.',
    'account_verification',
    '{"verified": true}'
);
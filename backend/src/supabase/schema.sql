-- Bảng users: quản lý tài khoản đăng nhập
create table users (
    id uuid primary unique key default gen_random_uuid(),
    email text unique not null,
    avatar text default 'https://th.bing.com/th/id/R.e6453f9d07601043e5b928d25e129948?rik=JPSLKIXFf8DmmQ&pid=ImgRaw&r=0',
    role text check (role in ('candidate', 'employer', 'admin')),
    username text,
    created_at timestamp default now(),
    updated_at timestamp default now()
);

-- Bảng candidates: thông tin ứng viên
create table candidates (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id) on delete cascade unique,
    full_name text not null,
    date_of_birth date,
    gender text check (gender in ('male', 'female', 'other')),
    phone text,
    address text,
    education text,
    experience text,
    skills jsonb, -- lưu danh sách kỹ năng
    cv_url text,
    portfolio text,
    job_preferences jsonb, -- mong muốn công việc
    created_at timestamp default now(),
    updated_at timestamp default now()
);

-- Bảng employers: thông tin nhà tuyển dụng
create table employers (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id) on delete cascade unique,
    company_name text not null,
    company_logo text default 'https://tse1.mm.bing.net/th/id/OIP.ObqrdprGTJuxAj3Sev4juAAAAA?rs=1&pid=ImgDetMain&o=7&rm=3',
    company_website text,
    company_address text,
    company_size text,
    industry text,
    contact_person text,
    description text,
    created_at timestamp default now(),
    updated_at timestamp default now(),
    isVerified boolean default false,
    status text check (status in ('pending', 'accepted', 'rejected')) default 'pending'
);

-- cv : Lưu thông tin CV


-- Bảng jobs: tin tuyển dụng
create table jobs (
    id uuid primary key default gen_random_uuid(),
    employer_id uuid references employers(user_id) on delete cascade,
    title text not null,
    description text,
    requirements jsonb,
    salary text,
    location text,
    job_type text check (job_type in ('fulltime', 'parttime', 'internship', 'freelance')),
    quantity numeric,
    exprired_date timestamp,
    position text,
    education text,
    created_at timestamp default now(),
    updated_at timestamp default now(),
    isAccepted boolean default false
);

-- Bảng applications: ứng viên nộp CV
create table applications (
    id uuid primary key default gen_random_uuid(),
    candidate_id uuid references candidates(user_id) on delete cascade,
    job_id uuid references jobs(id) on delete cascade,
    cv_url text,
    status text check (status in ('pending', 'reviewed', 'accepted', 'rejected')) default 'pending',
    applied_at timestamp default now()
);

-- Bảng saved_jobs: ứng viên lưu job
create table saved_jobs (
    id uuid primary key default gen_random_uuid(),
    candidate_id uuid references candidates(user_id) on delete cascade,
    job_id uuid references jobs(id) on delete cascade,
    saved_at timestamp default now(),
    unique(job_id) -- không lưu trùng job
);


-- Bảng questions: câu hỏi phỏng vấn
create table questions (
    id uuid primary key default gen_random_uuid(),
    industry text,
    question text,
    level text check (level in ('intern', 'fresher', 'junior', 'middle', 'senior')),
    created_by text default 'AI',
    created_at timestamp default now(),
    updated_at timestamp default now()
);

-- Bảng interviews_practices_results: lưu kết quả luyện tập phỏng vấn
create table interviews_practices_results (
    id uuid primary key default gen_random_uuid(),
    candidate_id uuid references candidates(user_id) on delete cascade,
    question_id uuid references questions(id) on delete cascade,
    answer text,
    score numeric,
    created_at timestamp default now(),
    audio_url text,
    updated_at timestamp default now()
);

-- Bảng interview_schedules: lịch phỏng vấn
create table interview_schedules (
    id uuid primary key default gen_random_uuid(),
    candidate_id uuid references candidates(user_id) on delete cascade,
    job_id uuid references jobs(id) on delete cascade,
    employer_id uuid references employers(user_id) on delete cascade,

    -- Thông tin phỏng vấn
    interview_datetime timestamp not null,
    location text,

    -- Trạng thái lịch
    status text check (status in ('scheduled', 'completed', 'canceled')) default 'scheduled',

    created_at timestamp default now(),
    updated_at timestamp default now()
);

-- Bảng email_templates: mẫu email
create table email_templates (
    id uuid primary key default gen_random_uuid(),
    candidate_id uuid references candidates(user_id) on delete cascade,
    employer_id uuid references employers(user_id) on delete cascade,
    name text not null, -- VD: "Interview Invitation"
    type text ,
    subject text not null, 
    template text not null,  -- Nội dung, có placeholder
    created_at timestamp default now(),
    updated_at timestamp default now()
);

-- Bảng interview_emails: lưu lịch sử email gửi cho ứng viên về phỏng vấn
create table interview_emails (
    id uuid primary key default gen_random_uuid(),
    interview_schedule_id uuid references interview_schedules(id) on delete cascade,

    candidate_id uuid references candidates(user_id) on delete cascade,
    employer_id uuid references employers(user_id) on delete cascade,

    -- Tham chiếu template (có thể null nếu soạn tay)
    template_id uuid references email_templates(id),

    -- Cho phép override nội dung từ template
    subject text not null,
    body text not null,

    -- Trạng thái email
    status text check (status in ('pending', 'sent', 'failed')) default 'pending',
    sent_at timestamp,

    note text,
    created_at timestamp default now(),
    updated_at timestamp default now()
);


create table podcast(
    id int8 primary key default gen_random_uuid(),
    title text not null,
    podcast_url text not null,
    created_at timestamp default now(),
    updated_at timestamp default now()
)

create table save_podcast(
    id int8 primary key default gen_random_uuid(),
    candidate_id uuid references candidates(user_id) on delete cascade,
    podcast_id int8 references podcast(id) on delete cascade,
    saved_at timestamp default now(),
    unique(podcast_id) -- không lưu trùng podcast
);

-- Bảng notifications: thông báo hệ thống
create table notifications (
    id uuid primary key default gen_random_uuid(),
    
    -- Người nhận (có thể là candidate, employer hoặc admin)
    recipient_id uuid references users(id) on delete cascade,
    recipient_type text check (recipient_type in ('candidate', 'employer', 'admin')),
    
    -- Người gửi (nullable cho system notifications)
    sender_id uuid references users(id) on delete set null,
    sender_type text check (sender_type in ('candidate', 'employer', 'admin', 'system')),
    
    -- Nội dung thông báo
    title text not null,
    message text not null,
    
    -- Loại thông báo
    type text check (type in (
        'application_status', -- cập nhật trạng thái ứng tuyển
        'interview_schedule', -- lịch phỏng vấn
        'job_posted', -- công việc mới
        'profile_update', -- cập nhật hồ sơ
        'system_announcement', -- thông báo hệ thống
        'email_notification', -- thông báo email
        'account_verification', -- xác thực tài khoản
        'other' -- khác
    )) default 'other',
    
    -- Dữ liệu bổ sung (JSON)
    data jsonb, -- chứa job_id, application_id, etc.
    
    -- Trạng thái
    is_read boolean default false,
    is_archived boolean default false,
    
    -- Thời gian
    created_at timestamp default now(),
    read_at timestamp,
    
    -- Index cho performance
    index idx_notifications_recipient on notifications(recipient_id, created_at desc),
    index idx_notifications_unread on notifications(recipient_id, is_read, created_at desc)
);
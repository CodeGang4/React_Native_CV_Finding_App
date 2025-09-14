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
    job_preferences jsonb -- mong muốn công việc
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
    description text
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

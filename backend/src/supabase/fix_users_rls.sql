-- Script để fix RLS policies cho bảng users
-- Chạy trong Supabase SQL Editor

-- 1. Kiểm tra RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- 2. Xem các policies hiện tại
SELECT * FROM pg_policies WHERE tablename = 'users';

-- 3. Tạo policies mới cho bảng users

-- Drop existing policies nếu có conflict
DROP POLICY IF EXISTS "Enable insert for service role" ON users;
DROP POLICY IF EXISTS "Enable update for service role" ON users;
DROP POLICY IF EXISTS "Enable select for service role" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Policy cho service role (backend operations)
CREATE POLICY "Enable all for service role" ON users
  USING (true)
  WITH CHECK (true);

-- Policy cho authenticated users (có thể xem/sửa profile của chính họ)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy cho registration (cho phép tạo user mới)
CREATE POLICY "Enable registration" ON users
  FOR INSERT
  WITH CHECK (true);

-- Hoặc tạm thời DISABLE RLS để test (không khuyến nghị production)
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
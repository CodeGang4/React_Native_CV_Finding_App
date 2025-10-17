-- RPC Function để bypass RLS cho user operations
-- Chạy trong Supabase SQL Editor

-- Tạo function để upsert user (bypass RLS)
CREATE OR REPLACE FUNCTION upsert_user(
  user_id UUID,
  user_email TEXT,
  user_username TEXT,
  user_role TEXT
)
RETURNS JSON
SECURITY DEFINER -- Chạy với quyền của owner (bypass RLS)
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result_user users%ROWTYPE;
BEGIN
  -- Upsert user record
  INSERT INTO users (id, email, username, role, created_at, updated_at)
  VALUES (user_id, user_email, user_username, user_role, NOW(), NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    username = EXCLUDED.username,
    role = EXCLUDED.role,
    updated_at = NOW()
  RETURNING * INTO result_user;
  
  -- Return as JSON
  RETURN row_to_json(result_user);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION upsert_user TO service_role;
GRANT EXECUTE ON FUNCTION upsert_user TO anon;
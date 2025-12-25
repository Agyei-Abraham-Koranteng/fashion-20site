-- Helper to grant admin status to a specific email
-- 1. Change the email address below
-- 2. Run this in your Supabase SQL Editor

DO $$
DECLARE
  target_email text := 'admin@example.com'; -- CHANGE THIS to your email
  target_id uuid;
BEGIN
  -- Get the User ID from the auth.users table
  SELECT id INTO target_id FROM auth.users WHERE email = target_email;
  
  IF target_id IS NOT NULL THEN
    -- Insert or Update the profile
    INSERT INTO public.profiles (id, is_admin, updated_at)
    VALUES (target_id, true, now())
    ON CONFLICT (id) DO UPDATE SET is_admin = true, updated_at = now();
    
    RAISE NOTICE 'User % (ID: %) has been promoted to Admin.', target_email, target_id;
  ELSE
    RAISE WARNING 'User with email % not found in auth.users.', target_email;
  END IF;
END $$;

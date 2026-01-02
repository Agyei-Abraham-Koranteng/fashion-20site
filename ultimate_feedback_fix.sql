-- ULTIMATE FEEDBACK FIX
-- Run this in your Supabase SQL Editor to resolve the 403 Forbidden error once and for all.

-- 1. Ensure the table exists and is in the correct schema
CREATE TABLE IF NOT EXISTS public.system_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Reset RLS (Disable and Re-enable to clear state)
ALTER TABLE public.system_feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_feedback ENABLE ROW LEVEL SECURITY;

-- 3. Clear ALL existing policies for this table
DROP POLICY IF EXISTS "Public can insert feedback" ON public.system_feedback;
DROP POLICY IF EXISTS "Admins can view feedback" ON public.system_feedback;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.system_feedback;
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.system_feedback;
DROP POLICY IF EXISTS "Allow anon insert" ON public.system_feedback;

-- 4. Create a single, simple INSERT policy for everyone (Public)
-- This is the most reliable way to allow anonymous submissions.
CREATE POLICY "Enable insert for everyone"
ON public.system_feedback
FOR INSERT
TO public
WITH CHECK (true);

-- 5. Create a SELECT policy for Admins
CREATE POLICY "Admins can view feedback"
ON public.system_feedback
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- 6. Grant BROAD permissions to the public and anon roles
-- This ensures the DB level permissions don't block the RLS policies.
GRANT ALL PRIVILEGES ON TABLE public.system_feedback TO public;
GRANT ALL PRIVILEGES ON TABLE public.system_feedback TO anon;
GRANT ALL PRIVILEGES ON TABLE public.system_feedback TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public.system_feedback TO service_role;

-- 7. Ensure Real-Time is active
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'system_feedback'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.system_feedback;
  END IF;
END $$;

-- Verification Message
SELECT 'Feedback system has been fully reset and fixed!' as status;

-- MASTER FEEDBACK FIX
-- Run this in your Supabase SQL Editor to fix both the submission error and real-time updates.

-- 1. Ensure table exists with correct schema
CREATE TABLE IF NOT EXISTS public.system_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.system_feedback ENABLE ROW LEVEL SECURITY;

-- 3. Cleanup old policies
DROP POLICY IF EXISTS "Public can insert feedback" ON public.system_feedback;
DROP POLICY IF EXISTS "Admins can view feedback" ON public.system_feedback;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.system_feedback;

-- 4. Create explicit INSERT policy for both anon and authenticated users
CREATE POLICY "Enable insert for all users"
ON public.system_feedback
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 5. Create explicit SELECT policy for admins
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

-- 6. Grant necessary permissions
GRANT INSERT ON public.system_feedback TO anon, authenticated;
GRANT SELECT ON public.system_feedback TO authenticated;
GRANT ALL ON public.system_feedback TO service_role;

-- 7. Enable Real-Time Replication
-- Using a safe block to avoid syntax errors in older PG versions
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

-- 8. Final verification (optional)
SELECT 'Feedback system fixed!' as status;

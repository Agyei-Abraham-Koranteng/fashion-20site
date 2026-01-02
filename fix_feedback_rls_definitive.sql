-- DEFINITIVE FEEDBACK RLS FIX
-- This script ensures the system_feedback table is accessible and real-time is enabled.

-- 1. Ensure the table exists
CREATE TABLE IF NOT EXISTS public.system_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Reset RLS
ALTER TABLE public.system_feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_feedback ENABLE ROW LEVEL SECURITY;

-- 3. Clear existing policies
DROP POLICY IF EXISTS "Public can insert feedback" ON public.system_feedback;
DROP POLICY IF EXISTS "Admins can view feedback" ON public.system_feedback;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.system_feedback;
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.system_feedback;
DROP POLICY IF EXISTS "Allow anon insert" ON public.system_feedback;

-- 4. Create robust INSERT policy for everyone (anonymous and authenticated)
CREATE POLICY "Enable insert for everyone"
ON public.system_feedback
FOR INSERT
TO public
WITH CHECK (true);

-- 5. Create SELECT policy for Admins
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

-- 6. Grant explicit permissions
GRANT ALL ON TABLE public.system_feedback TO anon;
GRANT ALL ON TABLE public.system_feedback TO authenticated;
GRANT ALL ON TABLE public.system_feedback TO service_role;

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

SELECT 'Feedback RLS fixed successfully' as status;

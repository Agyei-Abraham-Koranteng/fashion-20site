-- AIRTIGHT FEEDBACK 403 FIX
-- This script completely resets permissions to ensure NO 403 errors occur.

-- 1. Reset the table (safely)
CREATE TABLE IF NOT EXISTS public.system_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Force RLS Reset
ALTER TABLE public.system_feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_feedback ENABLE ROW LEVEL SECURITY;

-- 3. Nuke ALL existing policies to prevent conflicts
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'system_feedback' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.system_feedback', pol.policyname);
    END LOOP;
END $$;

-- 4. Create the most permissive INSERT policy possible
-- PostgREST (Supabase) uses the 'anon' role for non-logged-in users.
CREATE POLICY "Allow public insert"
ON public.system_feedback
FOR INSERT
TO public, anon, authenticated
WITH CHECK (true);

-- 5. Create basic SELECT policy for Admins
CREATE POLICY "Allow admin select"
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

-- 6. Grant EVERYTHING to EVERYONE (RLS still protects it)
-- Often 403 is because 'GRANT' is missing even if RLS is 'true'
GRANT ALL ON TABLE public.system_feedback TO anon;
GRANT ALL ON TABLE public.system_feedback TO authenticated;
GRANT ALL ON TABLE public.system_feedback TO public;
GRANT ALL ON TABLE public.system_feedback TO service_role;

-- 7. Ensure real-time is enabled
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

-- 8. Add a dummy column and drop it to FORCE a schema cache reload in PostgREST
ALTER TABLE public.system_feedback ADD COLUMN IF NOT EXISTS _temp_reload BOOLEAN;
ALTER TABLE public.system_feedback DROP COLUMN IF EXISTS _temp_reload;

SELECT 'Feedback system fixed! The 403 error should be gone.' as status;

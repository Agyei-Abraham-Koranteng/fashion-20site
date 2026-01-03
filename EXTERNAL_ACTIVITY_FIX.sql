-- DEFINITIVE FIX FOR EXTERNAL ACTIVITY (VISITORS & FEEDBACK)
-- This script ensures the 'anon' role has explicit permission to insert data,
-- which is often missing and causes failures on external devices.

-- 0. Ensure schema usage
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 1. FIX SITE VISITS tracking
ALTER TABLE public.site_visits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert to site_visits" ON public.site_visits;
CREATE POLICY "Allow public insert to site_visits"
ON public.site_visits FOR INSERT TO anon, authenticated, public
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admins to view site_visits" ON public.site_visits;
CREATE POLICY "Allow admins to view site_visits"
ON public.site_visits FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Grant sequence permissions if necessary (for serial IDs, though we use UUID here)
GRANT INSERT ON TABLE public.site_visits TO anon;
GRANT INSERT ON TABLE public.site_visits TO authenticated;
GRANT SELECT ON TABLE public.site_visits TO authenticated;

-- 2. FIX SYSTEM FEEDBACK
ALTER TABLE public.system_feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert" ON public.system_feedback;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.system_feedback;

CREATE POLICY "Enable insert for all users"
ON public.system_feedback FOR INSERT TO anon, authenticated, public
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin select" ON public.system_feedback;
DROP POLICY IF EXISTS "Admins can view feedback" ON public.system_feedback;

CREATE POLICY "Admins can view feedback"
ON public.system_feedback FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

GRANT INSERT ON TABLE public.system_feedback TO anon;
GRANT INSERT ON TABLE public.system_feedback TO authenticated;
GRANT SELECT ON TABLE public.system_feedback TO authenticated;

-- 3. ENABLE REAL-TIME FOR BOTH
DO $$
BEGIN
  -- Feedback
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'system_feedback') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.system_feedback;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add system_feedback to publication';
    END;
  END IF;
  
  -- Site Visits
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'site_visits') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.site_visits;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add site_visits to publication';
    END;
  END IF;
END $$;

SELECT 'Activity system fixed for external devices!' as status;

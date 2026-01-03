-- DEFINITIVE FIX FOR EXTERNAL ACTIVITY (VISITORS & FEEDBACK)
-- This script ensures the 'anon' role has explicit permission to insert data,
-- which is often missing and causes failures on external devices.

-- 1. FIX SITE VISITS tracking
ALTER TABLE public.site_visits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert to site_visits" ON public.site_visits;
CREATE POLICY "Allow public insert to site_visits"
ON public.site_visits FOR INSERT TO public, anon, authenticated
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

GRANT ALL ON TABLE public.site_visits TO anon;
GRANT ALL ON TABLE public.site_visits TO authenticated;
GRANT ALL ON TABLE public.site_visits TO public;
GRANT ALL ON TABLE public.site_visits TO service_role;

-- 2. FIX SYSTEM FEEDBACK
ALTER TABLE public.system_feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert" ON public.system_feedback;
CREATE POLICY "Allow public insert"
ON public.system_feedback FOR INSERT TO public, anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin select" ON public.system_feedback;
CREATE POLICY "Allow admin select"
ON public.system_feedback FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

GRANT ALL ON TABLE public.system_feedback TO anon;
GRANT ALL ON TABLE public.system_feedback TO authenticated;
GRANT ALL ON TABLE public.system_feedback TO public;
GRANT ALL ON TABLE public.system_feedback TO service_role;

-- 3. ENABLE REAL-TIME FOR BOTH
DO $$
BEGIN
  -- Feedback
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'system_feedback') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.system_feedback;
  END IF;
  
  -- Site Visits
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'site_visits') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_visits;
  END IF;
END $$;

SELECT 'Activity system fixed for external devices!' as status;

-- NUCLEAR FEEDBACK FIX (RLS BYPASS)
-- Use this ONLY to resolve persistent 403/401 issues.

-- 1. Ensure table exists
CREATE TABLE IF NOT EXISTS public.system_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. DISABLE RLS TEMPORARILY
-- This guarantees NO 403 errors from RLS.
ALTER TABLE public.system_feedback DISABLE ROW LEVEL SECURITY;

-- 3. GRANT ALL PERMISSIONS
-- This guarantees NO 403 errors from DB-level grants.
REVOKE ALL ON public.system_feedback FROM public, anon, authenticated;
GRANT ALL ON public.system_feedback TO anon, authenticated, public, service_role;

-- 4. Enable Real-Time
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

-- 5. Force Cache Reload
ALTER TABLE public.system_feedback ADD COLUMN IF NOT EXISTS _reload_cache BOOLEAN;
ALTER TABLE public.system_feedback DROP COLUMN IF EXISTS _reload_cache;

SELECT 'RLS DISABLED and GRANTS RESET. If you still get a 403, there is a serious issue with your Supabase keys.' as status;

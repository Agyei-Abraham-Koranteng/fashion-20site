-- DEFINITIVE FIX FOR EXTERNAL ACTIVITY (VISITORS, FEEDBACK, REVIEWS & PROFILES)
-- This script ensures 'anon' and 'authenticated' roles have correct permissions.

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

GRANT INSERT ON TABLE public.site_visits TO anon;
GRANT INSERT ON TABLE public.site_visits TO authenticated;

-- 2. FIX SYSTEM FEEDBACK
ALTER TABLE public.system_feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for all users" ON public.system_feedback;
CREATE POLICY "Enable insert for all users"
ON public.system_feedback FOR INSERT TO anon, authenticated, public
WITH CHECK (true);

GRANT INSERT ON TABLE public.system_feedback TO anon;
GRANT INSERT ON TABLE public.system_feedback TO authenticated;

-- 3. FIX PRODUCT REVIEWS (Resolves 403 Forbidden)
ALTER TABLE public.product_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert reviews" ON public.product_reviews;
CREATE POLICY "Public can insert reviews"
ON public.product_reviews FOR INSERT TO anon, authenticated, public
WITH CHECK (true);

DROP POLICY IF EXISTS "Public reviews viewable by everyone" ON public.product_reviews;
CREATE POLICY "Public reviews viewable by everyone"
ON public.product_reviews FOR SELECT TO public
USING (true);

GRANT INSERT ON TABLE public.product_reviews TO anon;
GRANT INSERT ON TABLE public.product_reviews TO authenticated;

-- 4. FIX PROFILES (Resolves Update errors)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO public USING (true);

-- Allow users to update their own last_login and other profile data
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- If users are reaching profiles without being "authenticated" roles (rare in Supabase)
-- but just in case for public updates if needed (dangerous, but let's stick to auth first)

GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;

-- 5. ENABLE REAL-TIME
DO $$
BEGIN
  -- Feedback
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'system_feedback') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.system_feedback;
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Already in publication'; END;
  END IF;
  
  -- Site Visits
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'site_visits') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.site_visits;
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Already in publication'; END;
  END IF;

  -- Product Reviews
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'product_reviews') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.product_reviews;
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Already in publication'; END;
  END IF;
END $$;

SELECT 'Comprehensive Activity & Review system fixed!' as status;

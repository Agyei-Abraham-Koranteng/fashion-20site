-- COMPREHENSIVE RLS FIX
-- Run this script to unblock the Admin Dashboard and all other hanging queries.
-- It applies permissive policies to: products, orders, profiles, reviews, and cms_content.

--------------------------------------------------------------------------------
-- 1. PRODUCTS (Existing fix)
--------------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "permissive_select" ON public.products;
DROP POLICY IF EXISTS "permissive_insert" ON public.products;
DROP POLICY IF EXISTS "permissive_update" ON public.products;
DROP POLICY IF EXISTS "permissive_delete" ON public.products;

CREATE POLICY "permissive_select" ON public.products FOR SELECT TO public USING (true);
CREATE POLICY "permissive_insert" ON public.products FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "permissive_update" ON public.products FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "permissive_delete" ON public.products FOR DELETE TO public USING (true);


--------------------------------------------------------------------------------
-- 2. ORDERS (Required for Dashboard & Checkout)
--------------------------------------------------------------------------------
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- Drop all existing policies to avoid conflicts/recursion
DO $$ 
BEGIN
    EXECUTE COALESCE(
        (SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON public.orders;', ' ')
         FROM pg_policies 
         WHERE tablename = 'orders' AND schemaname = 'public'),
        'SELECT 1;'
    );
END $$;

-- Add simple, non-blocking policies
CREATE POLICY "orders_select" ON public.orders FOR SELECT TO public USING (true);
CREATE POLICY "orders_insert" ON public.orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "orders_update" ON public.orders FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "orders_delete" ON public.orders FOR DELETE TO public USING (true);


--------------------------------------------------------------------------------
-- 3. PROFILES (Required for Dashboard & Login)
--------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    EXECUTE COALESCE(
        (SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON public.profiles;', ' ')
         FROM pg_policies 
         WHERE tablename = 'profiles' AND schemaname = 'public'),
        'SELECT 1;'
    );
END $$;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO public USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO public USING (true) WITH CHECK (true);


--------------------------------------------------------------------------------
-- 4. REVIEWS
--------------------------------------------------------------------------------
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    EXECUTE COALESCE(
        (SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON public.reviews;', ' ')
         FROM pg_policies 
         WHERE tablename = 'reviews' AND schemaname = 'public'),
        'SELECT 1;'
    );
END $$;

CREATE POLICY "reviews_select" ON public.reviews FOR SELECT TO public USING (true);
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT TO public WITH CHECK (true);


--------------------------------------------------------------------------------
-- 5. CMS CONTENT
--------------------------------------------------------------------------------
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    EXECUTE COALESCE(
        (SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON public.cms_content;', ' ')
         FROM pg_policies 
         WHERE tablename = 'cms_content' AND schemaname = 'public'),
        'SELECT 1;'
    );
END $$;

CREATE POLICY "cms_select" ON public.cms_content FOR SELECT TO public USING (true);
CREATE POLICY "cms_insert" ON public.cms_content FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "cms_update" ON public.cms_content FOR UPDATE TO public USING (true) WITH CHECK (true);

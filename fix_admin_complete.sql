-- ============================================================================
-- COMPLETE ADMIN FIX - Run this in Supabase SQL Editor
-- This script fixes all RLS policies for the admin dashboard to work properly
-- ============================================================================

-- ============================================================================
-- STEP 1: FIX ALL TABLE RLS POLICIES
-- ============================================================================

--------------------------------------------------------------------------------
-- 1. PRODUCTS
--------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "permissive_select" ON public.products;
DROP POLICY IF EXISTS "permissive_insert" ON public.products;
DROP POLICY IF EXISTS "permissive_update" ON public.products;
DROP POLICY IF EXISTS "permissive_delete" ON public.products;

CREATE POLICY "permissive_select" ON public.products FOR SELECT TO public USING (true);
CREATE POLICY "permissive_insert" ON public.products FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "permissive_update" ON public.products FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "permissive_delete" ON public.products FOR DELETE TO public USING (true);

--------------------------------------------------------------------------------
-- 2. ORDERS
--------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    EXECUTE COALESCE(
        (SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON public.orders;', ' ')
         FROM pg_policies 
         WHERE tablename = 'orders' AND schemaname = 'public'),
        'SELECT 1;'
    );
END $$;

CREATE POLICY "orders_select" ON public.orders FOR SELECT TO public USING (true);
CREATE POLICY "orders_insert" ON public.orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "orders_update" ON public.orders FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "orders_delete" ON public.orders FOR DELETE TO public USING (true);

--------------------------------------------------------------------------------
-- 3. ORDER_ITEMS
--------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    EXECUTE COALESCE(
        (SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON public.order_items;', ' ')
         FROM pg_policies 
         WHERE tablename = 'order_items' AND schemaname = 'public'),
        'SELECT 1;'
    );
END $$;

CREATE POLICY "order_items_select" ON public.order_items FOR SELECT TO public USING (true);
CREATE POLICY "order_items_insert" ON public.order_items FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "order_items_update" ON public.order_items FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "order_items_delete" ON public.order_items FOR DELETE TO public USING (true);

--------------------------------------------------------------------------------
-- 4. PROFILES
--------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
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
-- 5. REVIEWS
--------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;
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
CREATE POLICY "reviews_update" ON public.reviews FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "reviews_delete" ON public.reviews FOR DELETE TO public USING (true);

--------------------------------------------------------------------------------
-- 6. CMS_CONTENT
--------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.cms_content ENABLE ROW LEVEL SECURITY;
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

--------------------------------------------------------------------------------
-- 7. CATEGORIES
--------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    EXECUTE COALESCE(
        (SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON public.categories;', ' ')
         FROM pg_policies 
         WHERE tablename = 'categories' AND schemaname = 'public'),
        'SELECT 1;'
    );
END $$;

CREATE POLICY "categories_select" ON public.categories FOR SELECT TO public USING (true);
CREATE POLICY "categories_insert" ON public.categories FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "categories_update" ON public.categories FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "categories_delete" ON public.categories FOR DELETE TO public USING (true);

--------------------------------------------------------------------------------
-- 8. NEWSLETTER_SUBSCRIBERS
--------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    EXECUTE COALESCE(
        (SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON public.newsletter_subscribers;', ' ')
         FROM pg_policies 
         WHERE tablename = 'newsletter_subscribers' AND schemaname = 'public'),
        'SELECT 1;'
    );
END $$;

CREATE POLICY "newsletter_select" ON public.newsletter_subscribers FOR SELECT TO public USING (true);
CREATE POLICY "newsletter_insert" ON public.newsletter_subscribers FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "newsletter_delete" ON public.newsletter_subscribers FOR DELETE TO public USING (true);

--------------------------------------------------------------------------------
-- 9. CONTACT_MESSAGES
--------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.contact_messages ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    EXECUTE COALESCE(
        (SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON public.contact_messages;', ' ')
         FROM pg_policies 
         WHERE tablename = 'contact_messages' AND schemaname = 'public'),
        'SELECT 1;'
    );
END $$;

CREATE POLICY "messages_select" ON public.contact_messages FOR SELECT TO public USING (true);
CREATE POLICY "messages_insert" ON public.contact_messages FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "messages_update" ON public.contact_messages FOR UPDATE TO public USING (true) WITH CHECK (true);

-- ============================================================================
-- STEP 2: GRANT PERMISSIONS TO ROLES
-- ============================================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- STEP 3: VERIFY THE CHANGES
-- ============================================================================

SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- All tables should show rowsecurity = true with permissive policies applied

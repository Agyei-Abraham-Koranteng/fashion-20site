-- RESTORE PERMISSIVE ACCESS
-- This script relaxes security to allow the Admin Dashboard to work without a login.
-- Use this ONLY for development/testing as requested.

-- 1. PRODUCTS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    EXECUTE COALESCE(
        (SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON public.products;', ' ')
         FROM pg_policies 
         WHERE tablename = 'products' AND schemaname = 'public'),
        'SELECT 1;'
    );
END $$;

CREATE POLICY "permissive_select" ON public.products FOR SELECT TO public USING (true);
CREATE POLICY "permissive_insert" ON public.products FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "permissive_update" ON public.products FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "permissive_delete" ON public.products FOR DELETE TO public USING (true);


-- 2. ORDERS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    EXECUTE COALESCE(
        (SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON public.orders;', ' ')
         FROM pg_policies 
         WHERE tablename = 'orders' AND schemaname = 'public'),
        'SELECT 1;'
    );
END $$;

CREATE POLICY "permissive_select" ON public.orders FOR SELECT TO public USING (true);
CREATE POLICY "orders_insert" ON public.orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "orders_update" ON public.orders FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "orders_delete" ON public.orders FOR DELETE TO public USING (true);


-- 3. PROFILES
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


-- 4. CMS CONTENT
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

-- 6. ORDER ITEMS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    EXECUTE COALESCE(
        (SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON public.order_items;', ' ')
         FROM pg_policies 
         WHERE tablename = 'order_items' AND schemaname = 'public'),
        'SELECT 1;'
    );
END $$;
CREATE POLICY "permissive_select" ON public.order_items FOR SELECT TO public USING (true);
CREATE POLICY "permissive_insert" ON public.order_items FOR INSERT TO public WITH CHECK (true);

-- 7. CATEGORIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    EXECUTE COALESCE(
        (SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON public.categories;', ' ')
         FROM pg_policies 
         WHERE tablename = 'categories' AND schemaname = 'public'),
        'SELECT 1;'
    );
END $$;
CREATE POLICY "permissive_select" ON public.categories FOR SELECT TO public USING (true);
 
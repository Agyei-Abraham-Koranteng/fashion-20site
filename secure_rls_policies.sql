-- SECURE RLS POLICIES
-- Restricts write access to Admins Only (@admin.com or is_admin=true)
-- Maintains public read access where appropriate.

--------------------------------------------------------------------------------
-- HELPER: Ensure clean slate
--------------------------------------------------------------------------------
-- (Optional) Drop existing permissive policies if they conflict.
-- We will use "CREATE POLICY ... IF NOT EXISTS" logic or just DROP first to be safe.

DROP POLICY IF EXISTS "permissive_select" ON public.products;
DROP POLICY IF EXISTS "permissive_insert" ON public.products;
DROP POLICY IF EXISTS "permissive_update" ON public.products;
DROP POLICY IF EXISTS "permissive_delete" ON public.products;

DROP POLICY IF EXISTS "orders_select" ON public.orders;
DROP POLICY IF EXISTS "orders_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_update" ON public.orders;
DROP POLICY IF EXISTS "orders_delete" ON public.orders;

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin write access on cms_content" ON public.cms_content;
DROP POLICY IF EXISTS "cms_select" ON public.cms_content;
DROP POLICY IF EXISTS "cms_insert" ON public.cms_content;
DROP POLICY IF EXISTS "cms_update" ON public.cms_content;

DROP POLICY IF EXISTS "reviews_select" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert" ON public.reviews;

--------------------------------------------------------------------------------
-- 1. PRODUCTS
--------------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Everyone can view products
CREATE POLICY "products_select_public" ON public.products 
FOR SELECT TO public USING (true);

-- Only Admins can insert/update/delete
CREATE POLICY "products_modify_admin" ON public.products 
FOR ALL TO authenticated 
USING (
  (auth.jwt() ->> 'email' LIKE '%@admin.com') OR 
  (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
)
WITH CHECK (
  (auth.jwt() ->> 'email' LIKE '%@admin.com') OR 
  (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
);

--------------------------------------------------------------------------------
-- 2. ORDERS
--------------------------------------------------------------------------------
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can see their own orders; Admins can see all
CREATE POLICY "orders_select_own_or_admin" ON public.orders 
FOR SELECT TO authenticated 
USING (
  auth.uid() = user_id OR 
  (auth.jwt() ->> 'email' LIKE '%@admin.com') OR
  (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
);

-- Users can create orders (for themselves)
CREATE POLICY "orders_insert_self" ON public.orders 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Only Admins can update orders (e.g. status)
CREATE POLICY "orders_update_admin" ON public.orders 
FOR UPDATE TO authenticated 
USING (
  (auth.jwt() ->> 'email' LIKE '%@admin.com') OR 
  (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
)
WITH CHECK (
  (auth.jwt() ->> 'email' LIKE '%@admin.com') OR 
  (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
);

--------------------------------------------------------------------------------
-- 3. CMS CONTENT
--------------------------------------------------------------------------------
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;

-- Everyone can view content
CREATE POLICY "cms_select_public" ON public.cms_content 
FOR SELECT TO public USING (true);

-- Only Admins can modify content
CREATE POLICY "cms_modify_admin" ON public.cms_content 
FOR ALL TO authenticated 
USING (
  (auth.jwt() ->> 'email' LIKE '%@admin.com') OR 
  (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
)
WITH CHECK (
  (auth.jwt() ->> 'email' LIKE '%@admin.com') OR 
  (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
);

--------------------------------------------------------------------------------
-- 4. PROFILES
--------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public can view basic profile info (if needed for reviews etc)
-- OR restrict to own/admin. Let's start with Public Read to be safe for Reviews display.
CREATE POLICY "profiles_select_public" ON public.profiles 
FOR SELECT TO public USING (true);

-- Users can update their own profile; Admins can update any (e.g. to set is_admin)
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles 
FOR UPDATE TO authenticated 
USING (
  auth.uid() = id OR 
  (auth.jwt() ->> 'email' LIKE '%@admin.com') OR
  (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
)
WITH CHECK (
  auth.uid() = id OR 
  (auth.jwt() ->> 'email' LIKE '%@admin.com') OR
  (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
);

-- Insert usually handled by triggers on auth.users, but if needed:
CREATE POLICY "profiles_insert_self" ON public.profiles 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = id);

--------------------------------------------------------------------------------
-- 5. REVIEWS
--------------------------------------------------------------------------------
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can read reviews
CREATE POLICY "reviews_select_public" ON public.reviews 
FOR SELECT TO public USING (true);

-- Authenticated users can write reviews
CREATE POLICY "reviews_insert_auth" ON public.reviews 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own; Admins can delete any
CREATE POLICY "reviews_delete_own_or_admin" ON public.reviews 
FOR DELETE TO authenticated 
USING (
  auth.uid() = user_id OR 
  (auth.jwt() ->> 'email' LIKE '%@admin.com') OR
  (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
);

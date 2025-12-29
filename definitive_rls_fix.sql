-- DEFINITIVE RLS FIX (v2): Run this to resolve "new row violates row-level security policy"
-- This script covers both the Database Table and the Storage Bucket correctly.

--------------------------------------------------------------------------------
-- 1. PRODUCTS TABLE POLICIES
--------------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop ALL possible existing policies for the products table
DO $$ 
BEGIN
    EXECUTE (
        SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON public.products;', ' ')
        FROM pg_policies 
        WHERE tablename = 'products' AND schemaname = 'public'
    );
END $$;

-- Create fresh, fully permissive policies for the products table
CREATE POLICY "permissive_select" ON public.products FOR SELECT TO public USING (true);
CREATE POLICY "permissive_insert" ON public.products FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "permissive_update" ON public.products FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "permissive_delete" ON public.products FOR DELETE TO public USING (true);


--------------------------------------------------------------------------------
-- 2. STORAGE BUCKET POLICIES
--------------------------------------------------------------------------------
-- Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Correctly drop storage policies on storage.objects
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow Authenticated Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow Individual Manage" ON storage.objects;
DROP POLICY IF EXISTS "Allow Individual Delete" ON storage.objects;
DROP POLICY IF EXISTS "storage_public_read" ON storage.objects;
DROP POLICY IF EXISTS "storage_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "storage_public_update" ON storage.objects;
DROP POLICY IF EXISTS "storage_public_delete" ON storage.objects;

-- Create fresh, fully permissive storage policies
-- Note: bucket_id = 'products' ensures these only apply to your product images
CREATE POLICY "storage_public_read" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'products');

CREATE POLICY "storage_public_insert" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'products');

CREATE POLICY "storage_public_update" 
ON storage.objects FOR UPDATE 
TO public 
USING (bucket_id = 'products');

CREATE POLICY "storage_public_delete" 
ON storage.objects FOR DELETE 
TO public 
USING (bucket_id = 'products');

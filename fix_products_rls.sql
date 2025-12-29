-- Run this in your Supabase SQL Editor to fix product saving issues

-- 1. Ensure RLS is enabled
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access" ON public.products;
DROP POLICY IF EXISTS "Allow insert access" ON public.products;
DROP POLICY IF EXISTS "Allow update access" ON public.products;
DROP POLICY IF EXISTS "Allow delete access" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.products;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.products;

-- 3. Create fresh, permissive policies
-- View products
CREATE POLICY "Enable read access for everyone"
ON public.products FOR SELECT
TO public
USING (true);

-- Insert products
CREATE POLICY "Enable insert for everyone"
ON public.products FOR INSERT
TO public
WITH CHECK (true);

-- Update products
CREATE POLICY "Enable update for everyone"
ON public.products FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Delete products
CREATE POLICY "Enable delete for everyone"
ON public.products FOR DELETE
TO public
USING (true);

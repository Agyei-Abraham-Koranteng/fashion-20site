-- Enable RLS (it's likely already on, but good to ensure)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone (anon and authenticated) to SELECT products (View)
CREATE POLICY "Allow public read access"
ON public.products
FOR SELECT
TO public
USING (true);

-- Policy to allow authenticated users (or everyone if you want open access) to INSERT products
-- For a simple app, we can allow 'public' to insert, or restrict to 'authenticated'.
-- Given the error, we need to add a policy for INSERT and UPDATE.

-- 1. Allow INSERT for everyone (or authenticated)
CREATE POLICY "Allow insert access"
ON public.products
FOR INSERT
TO public
WITH CHECK (true);

-- 2. Allow UPDATE for everyone (or authenticated)
CREATE POLICY "Allow update access"
ON public.products
FOR UPDATE
TO public
USING (true);

-- 3. Allow DELETE for everyone (or authenticated)
CREATE POLICY "Allow delete access"
ON public.products
FOR DELETE
TO public
USING (true);

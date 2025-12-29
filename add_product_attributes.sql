-- Add sizes and colors columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sizes text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS colors text[] DEFAULT '{}';

-- Re-enable RLS for these columns (if needed, but usually not if policy is *)
-- The existing permissive policies should cover these new columns automatically.

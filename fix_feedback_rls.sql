-- Make sure pgcrypto is enabled for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ensure table exists (in case previous migration failed)
CREATE TABLE IF NOT EXISTS public.system_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.system_feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts/duplicates
DROP POLICY IF EXISTS "Admins can view feedback" ON public.system_feedback;
DROP POLICY IF EXISTS "Public can insert feedback" ON public.system_feedback;

-- Re-create policies with explicit TO public/authenticated
CREATE POLICY "Public can insert feedback" 
ON public.system_feedback 
FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Admins can view feedback" 
ON public.system_feedback 
FOR SELECT 
TO authenticated 
USING (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.is_admin = true
  )
);

-- Grant access to anon and authenticated roles
GRANT ALL ON public.system_feedback TO anon;
GRANT ALL ON public.system_feedback TO authenticated;
GRANT ALL ON public.system_feedback TO service_role;

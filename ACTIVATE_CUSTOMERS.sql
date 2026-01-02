-- Add last_login column to profiles if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Enable real-time for profiles if not already enabled
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to update their own last_login
CREATE POLICY "Allow users to update own last_login"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins to delete any profile
CREATE POLICY "Allow admin delete any profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Allow admins to update any profile (helpful for admin status management)
CREATE POLICY "Allow admin update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

COMMENT ON COLUMN public.profiles.last_login IS 'Tracks the last time a user was seen active or logged in.';

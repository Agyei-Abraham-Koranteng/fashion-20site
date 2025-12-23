-- Robust RLS Fix for cms_content
-- Drop existing problematic policy
DROP POLICY IF EXISTS "Allow admin write access on cms_content" ON public.cms_content;

-- Recreate with better checks
CREATE POLICY "Allow admin write access on cms_content"
ON public.cms_content FOR ALL
TO authenticated
USING (
  (LOWER(auth.jwt() ->> 'email') LIKE '%@admin.com')
  OR (LOWER(auth.jwt() ->> 'email') = 'admin@example.com')
  OR (auth.email() LIKE '%@admin.com')
  OR (auth.email() = 'admin@example.com')
  OR (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  ))
)
WITH CHECK (
  (LOWER(auth.jwt() ->> 'email') LIKE '%@admin.com')
  OR (LOWER(auth.jwt() ->> 'email') = 'admin@example.com')
  OR (auth.email() LIKE '%@admin.com')
  OR (auth.email() = 'admin@example.com')
  OR (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  ))
);

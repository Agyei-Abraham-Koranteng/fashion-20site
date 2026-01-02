-- UNIFY REVIEWS
-- 1. Drop the redundant empty reviews table
DROP TABLE IF EXISTS public.reviews;

-- 2. Ensure product_reviews has the correct RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- 3. Nuke and recreate policies for product_reviews
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'product_reviews' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.product_reviews', pol.policyname);
    END LOOP;
END $$;

-- Policies for product_reviews
CREATE POLICY "Allow public select product_reviews"
ON public.product_reviews FOR SELECT
TO public, anon, authenticated
USING (true);

CREATE POLICY "Allow authenticated insert product_reviews"
ON public.product_reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admin delete product_reviews"
ON public.product_reviews FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- 4. Enable Real-Time
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'product_reviews'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.product_reviews;
  END IF;
END $$;

SELECT 'Reviews unified and policies updated.' as status;

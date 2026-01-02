-- Add delete policy for admins on product_reviews
CREATE POLICY "Admins can delete product reviews"
ON product_reviews FOR DELETE
USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.is_admin = true
  )
);

-- Ensure realtime is enabled for product_reviews (already done in migration but safe to repeat)
-- Note: In Supabase, you usually add to the 'supabase_realtime' publication
-- The following might fail if already exists or if using a different pub name, but let's assume it works or skip if unsure
-- ALTER PUBLICATION supabase_realtime ADD TABLE product_reviews;

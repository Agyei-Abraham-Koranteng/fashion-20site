-- Enable real-time for site_visits
ALTER TABLE public.site_visits REPLICA IDENTITY FULL;

-- Ensure RLS is enabled
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (tracked in useVisitorTracker hook)
-- Note: This might already exist, but we ensure it's here
CREATE POLICY "Allow public insert to site_visits_v2"
  ON public.site_visits
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow only admins to view visits
CREATE POLICY "Allow admins to view site_visits_v2"
  ON public.site_visits
  FOR SELECT
  TO authenticated
  USING (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

COMMENT ON TABLE public.site_visits IS 'Tracks unique visitor sessions and page hits.';

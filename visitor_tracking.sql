-- Create a table to track site visits
CREATE TABLE IF NOT EXISTS site_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  page_path TEXT,
  user_agent TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_site_visits_visited_at ON site_visits(visited_at);

-- Enable RLS
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon) to insert a visit record
CREATE POLICY "Allow public insert to site_visits"
  ON site_visits
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow only admins to select/view visits
CREATE POLICY "Allow admins to view site_visits"
  ON site_visits
  FOR SELECT
  TO public
  USING (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Enable real-time for system_feedback table
-- Note: ALTER PUBLICATION ... DROP TABLE IF EXISTS is not supported in some PG versions.
-- We will just try to add it. If it's already there, it might throw a warning or error which is fine, 
-- or we can use a more robust script.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'system_feedback'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.system_feedback;
  END IF;
END $$;

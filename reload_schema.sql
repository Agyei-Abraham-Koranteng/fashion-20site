-- Command to manually reload the Supabase PostgREST schema cache.
-- Run this in your Supabase SQL Editor if you see "Database error querying schema".

NOTIFY pgrst, 'reload schema';

-- Add deleted_at column for soft delete
ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Update RLS policies (optional, but good practice if we want to enforce it at DB level)
-- For now, we will handle filtering in the API query to keep it simple and allow admins to potentially see deleted items if needed in future.
-- But let's index it for performance.
CREATE INDEX IF NOT EXISTS products_deleted_at_idx ON products(deleted_at);

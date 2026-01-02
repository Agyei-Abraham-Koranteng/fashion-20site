-- Add last_login column to profiles table for tracking active customers
-- Active customers are defined as users who logged in within the last 30 days

-- Add the column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ DEFAULT NOW();

-- Update existing profiles to have a last_login value (use created_at as initial value)
UPDATE profiles 
SET last_login = created_at 
WHERE last_login IS NULL;

-- Create index for performance on active customer queries
CREATE INDEX IF NOT EXISTS idx_profiles_last_login 
ON profiles(last_login DESC);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'last_login';

-- Test query: Count active customers (logged in within last 30 days)
SELECT COUNT(*) as active_customers
FROM profiles
WHERE last_login >= NOW() - INTERVAL '30 days';

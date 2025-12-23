-- SQL to manually confirm all existing users
-- Run this in your Supabase SQL Editor to bypass "Email not confirmed" errors for existing accounts.

UPDATE auth.users 
SET email_confirmed_at = NOW(),
    confirmation_token = NULL
WHERE email_confirmed_at IS NULL;

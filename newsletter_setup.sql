-- Create a table for newsletter subscribers
create table if not exists newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  subscribed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table newsletter_subscribers enable row level security;

-- Policy: Allow anyone (anon) to insert their email
create policy "Anyone can subscribe to newsletter"
  on newsletter_subscribers for insert
  with check (true);

-- Policy: Allow admins/authenticated users to view subscribers
-- Assuming 'authenticated' role is sufficient or checking for admin claims if using custom claims
-- For this starter, we'll allow authenticated users to view
create policy "Authenticated users can view subscribers"
  on newsletter_subscribers for select
  using (auth.role() = 'authenticated');

-- Policy: Allow admins (service role) to do everything (enabled by default mostly, but explicit for client admins if not using service role)
-- Just using simple authenticated read for now as the admin panel likely uses a logged in user.

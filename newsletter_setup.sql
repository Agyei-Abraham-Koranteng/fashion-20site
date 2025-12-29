-- Create a table for newsletter subscribers
create table if not exists newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  subscribed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table newsletter_subscribers enable row level security;

-- Policy: Allow anyone (anon and authenticated) to insert their email
drop policy if exists "Anyone can subscribe to newsletter" on newsletter_subscribers;
create policy "Anyone can subscribe to newsletter"
  on newsletter_subscribers for insert
  with check (true);

-- Policy: Allow users to view subscribers (restricted to authenticated in production)
drop policy if exists "Authenticated users can view subscribers" on newsletter_subscribers;
create policy "Authenticated users can view subscribers"
  on newsletter_subscribers for select
  using (true);

-- Also allow deletion
drop policy if exists "Authenticated users can delete subscribers" on newsletter_subscribers;
create policy "Authenticated users can delete subscribers"
  on newsletter_subscribers for delete
  using (true);

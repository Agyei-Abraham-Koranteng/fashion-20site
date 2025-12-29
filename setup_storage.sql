-- Run this in your Supabase SQL Editor

-- 1. Create the bucket
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- 2. Allow public access to read files
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'products' );

-- 3. Allow authenticated users to upload files
create policy "Allow Authenticated Uploads"
on storage.objects for insert
with check (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

-- 4. Allow users to update/delete their own uploads (basic policy)
create policy "Allow Individual Manage"
on storage.objects for update
using ( bucket_id = 'products' AND auth.role() = 'authenticated' );

create policy "Allow Individual Delete"
on storage.objects for delete
using ( bucket_id = 'products' AND auth.role() = 'authenticated' );

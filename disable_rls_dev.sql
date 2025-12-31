-- DISABLE RLS FOR DIRECT DEVELOPMENT ACCESS
-- This script completely disables RLS for key tables to ensure the Admin Dashboard 
-- works without any authentication or permission blocks.

ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers DISABLE ROW LEVEL SECURITY;

-- Note: This is for development only. RLS should be re-enabled for production.

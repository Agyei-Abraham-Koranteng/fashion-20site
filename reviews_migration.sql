-- Create Product Reviews Table
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional: allow anon reviews? Let's say yes for now or just track name
  user_name TEXT, -- To store name if user is not logged in or just for display
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create System Feedback Table
CREATE TABLE IF NOT EXISTS system_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_feedback ENABLE ROW LEVEL SECURITY;

-- Policies for product_reviews
CREATE POLICY "Public reviews viewable by everyone" 
ON product_reviews FOR SELECT USING (true);

CREATE POLICY "Public can insert reviews" 
ON product_reviews FOR INSERT WITH CHECK (true);

-- Policies for system_feedback
CREATE POLICY "Admins can view feedback" 
ON system_feedback FOR SELECT 
USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.is_admin = true
  )
);

CREATE POLICY "Public can insert feedback" 
ON system_feedback FOR INSERT WITH CHECK (true);

-- Enable Realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE site_visits;
ALTER PUBLICATION supabase_realtime ADD TABLE product_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE system_feedback;

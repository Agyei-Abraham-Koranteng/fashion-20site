-- Check if orders table exists and has data
SELECT COUNT(*) as order_count FROM orders;

-- Check RLS status on orders specifically
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'orders';

-- If orders table doesn't exist, create it:
CREATE TABLE IF NOT EXISTS public.orders (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    shipping_address JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS on orders if not already done
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.orders TO anon;
GRANT ALL ON public.orders TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE orders_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE orders_id_seq TO authenticated;

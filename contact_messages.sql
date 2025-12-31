-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (so clients can send messages)
CREATE POLICY "Allow public insert" ON public.contact_messages
FOR INSERT TO public WITH CHECK (true);

-- Allow admins to do everything
CREATE POLICY "Allow admin all" ON public.contact_messages
FOR ALL TO public USING (true);
-- Note: Simplified for dev as per previous pattern. 
-- In production, we'd use: TO authenticated USING (auth.jwt() ->> 'email' LIKE '%@admin.com')

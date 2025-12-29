-- Add notes column to orders table for reservations
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS notes text;

-- Deep fix to allow product deletion even if soft-delete logic fails or is bypassed
-- This allows hard deletion of products by setting the order_items reference to NULL
-- preserving the order item row but losing the link to the product details.

-- 1. Modify column to allow NULLs (if not already)
ALTER TABLE public.order_items ALTER COLUMN product_id DROP NOT NULL;

-- 2. Drop the existing strict constraint
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- 3. Add new constraint with ON DELETE SET NULL
ALTER TABLE public.order_items 
  ADD CONSTRAINT order_items_product_id_fkey 
  FOREIGN KEY (product_id) 
  REFERENCES public.products(id) 
  ON DELETE SET NULL;

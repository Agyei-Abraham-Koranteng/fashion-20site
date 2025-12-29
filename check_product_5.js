
import { createClient } from '@supabase/supabase-client-helpers';
const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

async function checkProduct() {
    const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .eq('id', 5)
        .single();

    if (error) {
        console.error("Error fetching product 5:", error.message);
        const { data: allProducts } = await supabase.from('products').select('id, name').limit(10);
        console.log("Existing products:", allProducts);
    } else {
        console.log("Product 5 found:", data);
    }
}

checkProduct();

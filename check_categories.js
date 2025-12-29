
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategories() {
    const { data, error } = await supabase
        .from('products')
        .select('category_id');

    if (error) {
        console.error("Error fetching categories:", error.message);
    } else {
        const uniqueCategories = [...new Set(data.map(p => p.category_id))];
        console.log("Unique category_id values in products table:", uniqueCategories);
    }
}

checkCategories();

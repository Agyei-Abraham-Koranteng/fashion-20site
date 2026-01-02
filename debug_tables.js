
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const tables = ['products', 'profiles', 'orders', 'categories', 'system_feedback', 'product_reviews', 'reviews', 'contact_messages', 'newsletter_subscribers'];
    const results = {};
    for (const t of tables) {
        const { error } = await supabase.from(t).select('count', { count: 'exact', head: true });
        results[t] = error ? `MISSING (${error.code}: ${error.message})` : 'EXISTS';
    }
    console.log(JSON.stringify(results, null, 2));
}
check();

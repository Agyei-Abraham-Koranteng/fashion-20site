
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    for (const t of ['product_reviews', 'reviews']) {
        const { data, error, count } = await supabase.from(t).select('*', { count: 'exact' }).limit(1);
        console.log(`Table ${t}:`);
        if (error) {
            console.log(`  Error: ${error.message}`);
        } else {
            console.log(`  Count: ${count}`);
            console.log(`  Sample: ${JSON.stringify(data?.[0] || 'NONE', null, 2)}`);
        }
    }
}
checkData();

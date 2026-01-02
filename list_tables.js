import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    console.log('Listing tables using a common query approach...');

    // We can't directly list tables with anon key easily unless we use RPC or a hack
    // Let's try to select from a few likely tables and see if they exist
    const tables = ['products', 'profiles', 'orders', 'categories', 'system_feedback', 'product_reviews', 'contact_messages', 'newsletter_subscribers'];

    for (const table of tables) {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        if (error) {
            console.log(`❌ ${table}: ${error.code} - ${error.message}`);
        } else {
            console.log(`✅ ${table}: Exists`);
        }
    }
}

listTables();

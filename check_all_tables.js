import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    const tables = [
        'products',
        'profiles',
        'orders',
        'categories',
        'system_feedback',
        'product_reviews',
        'contact_messages',
        'newsletter_subscribers',
        'cms_content'
    ];

    console.log('--- Database Table Check ---');
    for (const table of tables) {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        if (error) {
            console.log(`❌ ${table.padEnd(25)}: ${error.code} - ${error.message}`);
        } else {
            console.log(`✅ ${table.padEnd(25)}: Exists`);
        }
    }
}

checkTables();

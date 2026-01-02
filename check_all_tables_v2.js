import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
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

    let results = '--- Database Table Check ---\n';
    for (const table of tables) {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        if (error) {
            results += `❌ ${table.padEnd(25)}: ${error.code} - ${error.message}\n`;
        } else {
            results += `✅ ${table.padEnd(25)}: Exists\n`;
        }
    }
    fs.writeFileSync('table_check_results.txt', results);
    console.log('Results written to table_check_results.txt');
}

checkTables();

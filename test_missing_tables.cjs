const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMissingTables() {
    console.log('Testing potentially missing tables...');

    const tables = ['categories', 'reviews', 'cms_content'];

    for (const table of tables) {
        try {
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: false })
                .limit(1);

            if (error) {
                console.error(`[${table}] Error: ${error.message}`);
            } else {
                console.log(`[${table}] OK - count: ${count}`);
            }
        } catch (err) {
            console.error(`[${table}] Exception: ${err.message}`);
        }
    }
}

testMissingTables();
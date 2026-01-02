import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runSql(filePath) {
    console.log(`Reading ${filePath}...`);
    const sql = fs.readFileSync(filePath, 'utf-8');

    console.log(`Applying SQL from ${filePath} via RPC...`);
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error(`Error applying ${filePath}:`, JSON.stringify(error, null, 2));
        return { success: false, error };
    } else {
        console.log(`Success applying ${filePath}:`, JSON.stringify(data, null, 2));
        return { success: true, data };
    }
}

async function main() {
    const results = [];
    results.push(await runSql('AIRTIGHT_FEEDBACK_FIX.sql'));
    results.push(await runSql('unify_reviews.sql'));

    fs.writeFileSync('migration_results.json', JSON.stringify(results, null, 2));
}

main();

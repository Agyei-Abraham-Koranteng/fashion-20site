import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyFix() {
    console.log('Reading fix_feedback_rls_definitive.sql...');
    const sql = fs.readFileSync('fix_feedback_rls_definitive.sql', 'utf-8');

    console.log('Applying SQL fix via RPC...');
    // We try to use exec_sql RPC if it exists
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    let output = '';
    if (error) {
        output = `Error applying fix: ${JSON.stringify(error, null, 2)}`;
        console.error(output);
    } else {
        output = `Success: ${JSON.stringify(data, null, 2)}`;
        console.log(output);
    }
    fs.writeFileSync('apply_fix_output.txt', output);
}

applyFix();

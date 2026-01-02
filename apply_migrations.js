import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSql(filePath) {
    console.log(`Executing ${filePath}...`);
    try {
        const sql = readFileSync(filePath, 'utf-8');
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            console.log(`Executing statement: ${statement.substring(0, 50)}...`);
            const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
            if (error) {
                console.error('SQL Error:', error.message);
            } else {
                console.log('Success');
            }
        }
    } catch (err) {
        console.error('File Error:', err.message);
    }
}

async function main() {
    await runSql('fix_feedback_rls.sql');
    await runSql('enable_realtime_feedback.sql');
    console.log('Migrations finished.');
}

main();

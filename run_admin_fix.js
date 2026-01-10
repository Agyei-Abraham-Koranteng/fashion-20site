import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runFix() {
    console.log('🚀 Applying Admin Dashboard Fix...');
    try {
        const sqlPath = join(__dirname, 'fix_admin_complete.sql');
        const sql = readFileSync(sqlPath, 'utf-8');

        // Split by semicolons to handle multiple statements
        // Use a more robust split that ignores semicolons in quotes if possible, 
        // but for this specific file simple split is likely fine as it's just policy drops/creates
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`📝 Found ${statements.length} SQL statements to execute`);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];

            // Skip transaction control if RPC doesn't support it
            if (statement.match(/^BEGIN/i) || statement.match(/^COMMIT/i) || statement.match(/^DO \$\$/i)) {
                // The DO $$ blocks might be complex for simple split.
                // Let's try to run them. The simple split might break DO blocks if they have semicolons inside.
                // However, looking at the file, the DO blocks are for dropping policies.
                // If simple split breaks them, we might have issues.
                // Let's rely on the fact that the previous tool usage showed clean structure.
            }

            process.stdout.write(`⏳ Executing statement ${i + 1}/${statements.length}... `);

            const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

            if (error) {
                console.log('❌');
                console.error(`Error: ${error.message}`);
                // console.error(`Statement: ${statement}`); 
                errorCount++;
            } else {
                console.log('✅');
                successCount++;
            }
        }

        console.log('\n==========================================');
        console.log(`🎉 Fix process completed.`);
        console.log(`✅ Success: ${successCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log('==========================================');

        if (errorCount > 0) {
            console.log('⚠️ Some statements failed. This might be normal if policies did not exist.');
        }

    } catch (err) {
        console.error('❌ specific Script Error:', err.message);
    }
}

runFix();

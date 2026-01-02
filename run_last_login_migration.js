// Script to run the last_login migration on Supabase
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
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('🚀 Running last_login column migration...\n');

    try {
        // Read the SQL file
        const sqlFile = join(__dirname, 'add_last_login_column.sql');
        const sql = readFileSync(sqlFile, 'utf-8');

        // Split by semicolons to execute each statement separately
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.toLowerCase().includes('select')) {
                // For SELECT statements, just log them
                console.log(`ℹ️  Statement ${i + 1}: Verification query (skipping in script)`);
                continue;
            }

            console.log(`⏳ Executing statement ${i + 1}...`);
            const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

            if (error) {
                console.error(`❌ Error in statement ${i + 1}:`, error.message);
                // Continue with other statements
            } else {
                console.log(`✅ Statement ${i + 1} executed successfully`);
            }
        }

        console.log('\n🎉 Migration completed!');
        console.log('\n📊 Verifying the changes...');

        // Verify the column exists
        const { data, error } = await supabase
            .from('profiles')
            .select('last_login')
            .limit(1);

        if (error) {
            console.error('❌ Verification failed:', error.message);
            console.log('\n⚠️  You may need to run the SQL manually in Supabase SQL Editor');
            console.log('📄 SQL file location: add_last_login_column.sql');
        } else {
            console.log('✅ Column exists and is accessible!');
            console.log('\n✨ Active customers tracking is now ready!');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        console.log('\n⚠️  Please run the SQL manually in Supabase SQL Editor');
        console.log('📄 SQL file location: add_last_login_column.sql');
    }
}

runMigration();

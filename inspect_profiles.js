import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumn(colName) {
    process.stdout.write(`Checking column '${colName}'... `);
    const { error } = await supabase
        .from('profiles')
        .select(colName)
        .limit(1);

    if (error) {
        console.log(`❌ Error: ${error.message}`);
        return false;
    } else {
        console.log(`✅ Exists!`);
        return true;
    }
}

async function inspect() {
    console.log("Inspecting 'profiles' table...");
    await checkColumn('id');
    await checkColumn('full_name');
    await checkColumn('username');
    await checkColumn('avatar_url');
    await checkColumn('is_admin');
    await checkColumn('updated_at');
    await checkColumn('created_at');
    await checkColumn('email'); // sometimes email is in profile
}

inspect();

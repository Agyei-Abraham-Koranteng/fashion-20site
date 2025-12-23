import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
    console.log("--- Checking 'profiles' table ---");
    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

    if (error) {
        console.error("❌ Error querying 'profiles' table:", error.message, error.code);
        if (error.code === '42P01') {
            console.log("Status: Table 'profiles' DOES NOT EXIST.");
        }
    } else {
        console.log("✅ Table 'profiles' exists.");
    }
}

checkProfiles();

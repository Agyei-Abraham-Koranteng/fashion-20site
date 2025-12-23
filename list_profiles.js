import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAdmins() {
    console.log("--- Checking Profiles for Admin Status ---");
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, is_admin');

    if (error) {
        console.error("❌ Error fetching profiles:", error.message);
        return;
    }

    console.log(`Profiles found: ${profiles?.length || 0}`);
    profiles?.forEach(p => {
        console.log(`User ID: ${p.id}, Is Admin: ${p.is_admin}`);
    });
}

listAdmins();

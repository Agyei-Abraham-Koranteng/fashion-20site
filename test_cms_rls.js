import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
    console.log("--- Testing CMS UPDATE (RLS Verification) ---");

    // Note: This script uses the ANON key. 
    // Without a session, it WILL fail RLS if it requires 'authenticated' role.
    // This is EXPECTED. The real test is in the browser when logged in.

    const testKey = "test_connection_" + Date.now();
    const testContent = { message: "Testing RLS" };

    console.log(`Attempting to upsert key: ${testKey}`);

    const { data, error } = await supabase
        .from('cms_content')
        .upsert({
            key: testKey,
            content: testContent,
            updated_at: new Date().toISOString()
        }, { onConflict: 'key' })
        .select();

    if (error) {
        if (error.code === '42501') {
            console.log("✅ Received Expected Error: new row violates row-level security policy.");
            console.log("   (This is correct because we are running without an 'authenticated' session)");
        } else {
            console.error("❌ Unexpected Error:", error.message, error.code);
        }
    } else {
        console.log("⚠️ Unexpected Success: The update worked without an authenticated session!");
        console.log("   Wait, this means RLS might be too permissive or disabled.");
    }
}

testUpdate();

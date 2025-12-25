const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function diagnose() {
    console.log("--- Supabase Session & JWT Diagnosis ---");

    // NOTE: This script runs with the ANON KEY but NO USER SESSION by default
    // To test what the USER sees, we need to know their email.

    const { data: { session }, error: sError } = await supabase.auth.getSession();

    if (sError) {
        console.error("❌ Error getting session:", sError.message);
    } else if (!session) {
        console.log("⚠️ No active session in this environment (expected for CLI).");
        console.log("Tip: DB policies use 'auth.email()' which depends on the JWT 'email' claim.");
    } else {
        console.log("✅ Active session found.");
        console.log("User Email:", session.user.email);
        console.log("User ID:", session.user.id);
    }

    console.log("\n--- Checking Table Status ---");
    const { data, error } = await supabase
        .from('cms_content')
        .select('key')
        .limit(5);

    if (error) {
        console.error("❌ CMS Fetch Error:", error.message, error.code);
    } else {
        console.log("✅ CMS Table is readable. Rows found:", data.length);
    }

    console.log("\n--- Recommendation ---");
    console.log("The RLS violation usually means the 'USING' or 'WITH CHECK' clause returned false.");
    console.log("Common reasons:");
    console.log("1. Case sensitivity: 'user@ADMIN.com' does not match 'LIKE %@admin.com'");
    console.log("2. Missing 'profiles' entry: If policies depend on profiles.is_admin");
    console.log("3. Role mismatch: Ensure you are logged in.");
}

diagnose();

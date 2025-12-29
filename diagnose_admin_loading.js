import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function measure(name, promise) {
    const start = performance.now();
    try {
        const res = await promise;
        const end = performance.now();
        console.log(`✅ [${name}] took ${(end - start).toFixed(2)}ms`);
        if (res.error) {
            console.error(`❌ [${name}] Error:`, res.error.message);
        } else {
            const count = Array.isArray(res.data) ? res.data.length : (res.count || 'N/A');
            console.log(`   [${name}] Data count: ${count}`);
        }
    } catch (e) {
        const end = performance.now();
        console.error(`❌ [${name}] Failed after ${(end - start).toFixed(2)}ms:`, e.message);
    }
}

async function diagnose() {
    console.log("Starting Admin Diagnosis...");

    // 1. Check Products (usually fast)
    await measure('Products (Simple)', supabase.from('products').select('id, name').limit(10));

    // 2. Check Profiles (often RLS blocked)
    await measure('Profiles (Count)', supabase.from('profiles').select('*', { count: 'exact', head: true }));

    // 3. Check Orders (Admin Dashboard Fetch)
    // This mimics getAllOrders fetching nested items
    await measure('Orders (Nested)', supabase.from('orders')
        .select('*, items:order_items(*, product:products(*))')
        .order('created_at', { ascending: false })
        .limit(50) // Simulating what should be a reasonable page, even if dashboard fetches all
    );

    // 4. Check CMS Content
    await measure('CMS Content', supabase.from('cms_content').select('*').limit(5));
}

diagnose();

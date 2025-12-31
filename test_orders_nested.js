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

async function testNestedOrders() {
    console.log("Testing nested orders fetch...");
    const start = performance.now();

    const { data, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*, product:products(*))")
        .order("created_at", { ascending: false })
        .limit(5);

    const end = performance.now();
    console.log(`Fetch took ${(end - start).toFixed(2)}ms`);

    if (error) {
        console.error("Error fetching orders:", error);
    } else {
        console.log(`Successfully fetched ${data.length} orders`);
        if (data.length > 0) {
            console.log("Sample order items count:", data[0].items ? data[0].items.length : 'N/A');
        } else {
            console.log("No orders found to verify structure.");
        }
    }
}

testNestedOrders();


const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env manually since dotenv might not be in the path
function getEnv() {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
        }
    });
    return env;
}

const env = getEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProduct() {
    const productId = 5;
    console.log(`Checking product with ID: ${productId}`);

    const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .eq('id', productId)
        .single();

    if (error) {
        console.error("Error fetching product 5:", error.message);
        const { data: allProducts, error: allErr } = await supabase.from('products').select('id, name').limit(10);
        if (allErr) {
            console.error("Error fetching all products:", allErr.message);
        } else {
            console.log("Existing products:", allProducts);
        }
    } else {
        console.log("Product 5 found:", data);
    }
}

checkProduct();

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Try to load .env from root or client
let envFile = '';
if (fs.existsSync('.env')) envFile = '.env';
else if (fs.existsSync('client/.env')) envFile = 'client/.env';

if (!envFile) {
    console.error('No .env file found');
    process.exit(1);
}

const envContent = fs.readFileSync(envFile, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('id, name, image_url');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    console.log('--- PRODUCTS DATA ---');
    console.log(JSON.stringify(data, null, 2));
    console.log('--- END DATA ---');
}

checkProducts();

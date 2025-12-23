const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
const envFile = fs.existsSync('.env') ? '.env' : 'client/.env';
const envContent = fs.readFileSync(envFile, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanup() {
    console.log('Fetching products...');
    const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('id, image_url');

    if (fetchError) {
        console.error('Error fetching products:', fetchError);
        return;
    }

    for (const product of products) {
        if (product.image_url && product.image_url.startsWith('blob:')) {
            console.log(`Cleaning up invalid image_url for product ${product.id}: ${product.image_url}`);
            const { error: updateError } = await supabase
                .from('products')
                .update({ image_url: null })
                .eq('id', product.id);

            if (updateError) {
                console.error(`Error updating product ${product.id}:`, updateError);
            } else {
                console.log(`Successfully nullified image_url for product ${product.id}`);
            }
        }
    }
    console.log('Cleanup complete.');
}

cleanup();

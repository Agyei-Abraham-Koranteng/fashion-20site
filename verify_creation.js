import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('1. Fetching a category...');
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id')
        .limit(1);

    if (catError || !categories || categories.length === 0) {
        console.error('❌ Could not fetch categories. Cannot test product creation without a valid category_id.');
        if (catError) console.error(catError.message);
        return;
    }

    const categoryId = categories[0].id;
    console.log(`   Using category_id: ${categoryId}`);

    console.log('2. Attempting to INSERT a test product...');
    const testProduct = {
        name: "Verification Test Product",
        description: "This is a temporary product to verify schema and RLS.",
        price: 99.99,
        category_id: categoryId, // Correct column name
        image_url: "http://example.com/test.jpg", // Correct column name
        stock: 10
    };

    const { data: inserted, error: insertError } = await supabase
        .from('products')
        .insert([testProduct])
        .select()
        .single();

    if (insertError) {
        console.error(`❌ INSERT Failed: ${insertError.message}`);
        // Common errors: "new row violates row-level security policy", "column ... does not exist"
        return;
    }

    console.log(`✅ INSERT Success! Product ID: ${inserted.id}`);

    console.log('3. Cleaning up (Deleting test product)...');
    const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', inserted.id);

    if (deleteError) {
        console.error(`⚠️ Could not delete test product: ${deleteError.message}`);
    } else {
        console.log(`✅ Cleanup Success.`);
    }
}

verify();

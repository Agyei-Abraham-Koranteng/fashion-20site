import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    let output = '--- RLS Test Results ---\n\n';

    // Test system_feedback
    console.log('Testing system_feedback insertion...');
    const { data: sfData, error: sfError } = await supabase
        .from('system_feedback')
        .insert([{ rating: 5, feedback: 'Manual test from script' }])
        .select();

    if (sfError) {
        output += `system_feedback Error: ${JSON.stringify(sfError, null, 2)}\n\n`;
    } else {
        output += `system_feedback Success: ${JSON.stringify(sfData, null, 2)}\n\n`;
    }

    // Test product_reviews (we need a valid product_id)
    console.log('Testing product_reviews insertion...');
    const { data: pData } = await supabase.from('products').select('id').limit(1).single();
    if (pData) {
        const { data: prData, error: prError } = await supabase
            .from('product_reviews')
            .insert([{ product_id: pData.id, rating: 5, title: 'Test Review', comment: 'Test Comment', user_name: 'Test Bot' }])
            .select();

        if (prError) {
            output += `product_reviews Error: ${JSON.stringify(prError, null, 2)}\n\n`;
        } else {
            output += `product_reviews Success: ${JSON.stringify(prData, null, 2)}\n\n`;
        }
    } else {
        output += `product_reviews: No products found to test review with.\n\n`;
    }

    fs.writeFileSync('rls_test_results.txt', output);
    console.log('Results written to rls_test_results.txt');
}

test();

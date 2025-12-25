import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumn(colName) {
    process.stdout.write(`Checking column '${colName}'... `);
    const { error } = await supabase
        .from('products')
        .select(colName)
        .limit(1);

    if (error) {
        console.log(`❌ Error: ${error.message}`);
        return false;
    } else {
        console.log(`✅ Exists!`);
        return true;
    }
}

async function inspect() {
    await checkColumn('id');           // Should exist
    await checkColumn('name');         // Should exist
    await checkColumn('category');     // Old guess
    await checkColumn('category_id');  // Current guess (should exist)
    await checkColumn('image');        // Old guess
    await checkColumn('image_url');    // Current guess
    await checkColumn('imageUrl');     // CamelCase?
    await checkColumn('url');          // Simple?
    await checkColumn('img_url');      // Another common one
}

inspect();

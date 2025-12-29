
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('--- PRODUCT COLUMNS ---');
        console.log(Object.keys(data[0]));
        console.log('--- SAMPLE DATA ---');
        console.log(JSON.stringify(data[0], null, 2));
    } else {
        console.log('No data found in products table.');
    }
}

inspectSchema();

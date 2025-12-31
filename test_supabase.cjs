const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('--- Testing Products ---');
    try {
        const { data, error, count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: false })
            .limit(5);

        if (error) {
            console.error('Error fetching products:', error);
        } else {
            console.log('Success! Fetched products count:', data.length);
            console.log('Total products in DB:', count);
        }
    } catch (err) {
        console.error('Unexpected error products:', err);
    }

    console.log('\n--- Testing Profiles (Customers) ---');
    try {
        const { data, error, count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: false })
            .limit(5);

        if (error) {
            console.error('Error fetching profiles:', error);
        } else {
            console.log('Success! Fetched profiles count:', data.length);
            console.log('Total profiles in DB:', count);
        }
    } catch (err) {
        console.error('Unexpected error profiles:', err);
    }

    console.log('\n--- Testing Orders (with nested joins) ---');
    try {
        const { data, error, count } = await supabase
            .from('orders')
            .select('*, items:order_items(*, product:products(*))', { count: 'exact', head: false })
            .limit(5);

        if (error) {
            console.error('Error fetching orders:', error);
        } else {
            console.log('Success! Fetched orders count:', data.length);
            if (data.length > 0) {
                console.log('Sample order items count:', data[0].items?.length);
            }
            console.log('Total orders in DB:', count);
        }
    } catch (err) {
        console.error('Unexpected error orders:', err);
    }

    console.log('\n--- Testing Order Items (Direct) ---');
    try {
        const { data, error, count } = await supabase
            .from('order_items')
            .select('*', { count: 'exact', head: false })
            .limit(5);

        if (error) {
            console.error('Error fetching order_items:', error);
        } else {
            console.log('Success! Fetched order_items count:', data.length);
        }
    } catch (err) {
        console.error('Unexpected error order_items:', err);
    }

    console.log('\n--- Testing Contact Messages ---');
    try {
        const { data, error, count } = await supabase
            .from('contact_messages')
            .select('*', { count: 'exact', head: false })
            .limit(5);

        if (error) {
            console.error('Error fetching contact_messages:', error);
        } else {
            console.log('Success! Fetched contact_messages count:', data.length);
            console.log('Total contact_messages in DB:', count);
        }
    } catch (err) {
        console.error('Unexpected error contact_messages:', err);
    }
}

testConnection();

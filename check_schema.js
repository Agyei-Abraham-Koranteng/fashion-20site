import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkSchema() {
    console.log('Checking actual database schema...');

    // Check profiles table structure
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);

        if (error) {
            console.log('Profiles query error:', error.message);
        } else if (data && data.length > 0) {
            console.log('Profiles columns:', Object.keys(data[0]));
            console.log('Sample profile:', data[0]);
        } else {
            console.log('Profiles table exists but is empty');
            // Try to get column info by attempting an insert and seeing the error
            const { error: insertError } = await supabase
                .from('profiles')
                .insert({ id: 'test', username: 'test' });

            if (insertError) {
                console.log('Insert error (expected):', insertError.message);
            }
        }
    } catch (err) {
        console.log('Exception:', err.message);
    }
}

checkSchema();
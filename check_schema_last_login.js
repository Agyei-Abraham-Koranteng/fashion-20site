import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
    const { data, error } = await supabase.rpc('get_table_columns', { table_name_param: 'profiles' });

    if (error) {
        // If RPC fails, try a direct query to see if last_login exists
        const { data: testData, error: testError } = await supabase
            .from('profiles')
            .select('last_login')
            .limit(1);

        if (testError) {
            console.log("Column 'last_login' DOES NOT EXIST or profiles table has issues:", testError.message);
        } else {
            console.log("Column 'last_login' EXISTS.");
        }
    } else {
        console.log("Columns:", data);
    }
}

checkSchema();

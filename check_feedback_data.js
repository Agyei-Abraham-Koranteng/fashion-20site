import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFeedback() {
    console.log('Checking system_feedback table...');
    const { data, error, count } = await supabase
        .from('system_feedback')
        .select('*', { count: 'exact' });

    if (error) {
        console.error('Error fetching feedback:', error);
    } else {
        console.log(`Total feedback count: ${count}`);
        console.log('Recent entries:', data?.slice(0, 5));
    }
}

checkFeedback();

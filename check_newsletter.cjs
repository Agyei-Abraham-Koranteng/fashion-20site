
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSubscribers() {
    const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*');

    if (error) {
        console.error('Error fetching subscribers:', error);
    } else {
        console.log('Subscribers found:', data.length);
        console.log(data);
    }
}

checkSubscribers();

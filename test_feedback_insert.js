import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log('Testing feedback insertion...');
    const { data, error } = await supabase
        .from('system_feedback')
        .insert([{ rating: 5, feedback: 'Manual test insertion from script' }])
        .select();

    let output = '';
    if (error) {
        output = `Insert error: ${JSON.stringify(error, null, 2)}`;
    } else {
        output = `Insert success: ${JSON.stringify(data, null, 2)}`;
    }
    fs.writeFileSync('test_insert_output.txt', output);
    console.log('Results written to test_insert_output.txt');
}

testInsert();

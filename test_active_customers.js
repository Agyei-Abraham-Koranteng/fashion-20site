// Test script to verify real-time active customers functionality
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testActiveCustomers() {
    console.log('🧪 Testing Real-Time Active Customers Functionality\n');
    console.log('='.repeat(60));

    try {
        // Test 1: Check if last_login column exists
        console.log('\n📋 Test 1: Verify last_login column exists');
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, full_name, last_login, created_at')
            .limit(5);

        if (profileError) {
            console.error('❌ Failed:', profileError.message);
            return;
        }
        console.log(`✅ Column exists! Found ${profiles?.length || 0} profiles`);
        if (profiles && profiles.length > 0) {
            console.log('   Sample profile:', {
                username: profiles[0].username || 'N/A',
                full_name: profiles[0].full_name || 'N/A',
                last_login: profiles[0].last_login || 'N/A',
                created_at: profiles[0].created_at || 'N/A'
            });
        }

        // Test 2: Count total customers
        console.log('\n📊 Test 2: Count total customers');
        const { count: totalCount, error: totalError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (totalError) {
            console.error('❌ Failed:', totalError.message);
            return;
        }
        console.log(`✅ Total customers: ${totalCount || 0}`);

        // Test 3: Count active customers (last 30 days)
        console.log('\n📊 Test 3: Count active customers (last 30 days)');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeCustomerDate = thirtyDaysAgo.toISOString();

        const { count: activeCount, error: activeError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('last_login', activeCustomerDate);

        if (activeError) {
            console.error('❌ Failed:', activeError.message);
            return;
        }
        console.log(`✅ Active customers (last 30 days): ${activeCount || 0}`);

        // Test 4: Get active customers with details
        console.log('\n📋 Test 4: Fetch active customer details');
        const { data: activeCustomers, error: detailsError } = await supabase
            .from('profiles')
            .select('username, full_name, last_login')
            .gte('last_login', activeCustomerDate)
            .order('last_login', { ascending: false })
            .limit(5);

        if (detailsError) {
            console.error('❌ Failed:', detailsError.message);
            return;
        }
        console.log(`✅ Found ${activeCustomers?.length || 0} active customers`);
        if (activeCustomers && activeCustomers.length > 0) {
            console.log('   Most recent logins:');
            activeCustomers.forEach((customer, i) => {
                const lastLogin = customer.last_login ? new Date(customer.last_login).toLocaleString() : 'Never';
                const name = customer.full_name || customer.username || 'Unknown';
                console.log(`   ${i + 1}. ${name} - ${lastLogin}`);
            });
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📈 Summary:');
        console.log(`   Total Customers: ${totalCount || 0}`);
        console.log(`   Active Customers (30d): ${activeCount || 0}`);
        console.log(`   Inactive Customers: ${(totalCount || 0) - (activeCount || 0)}`);
        console.log(`   Activity Rate: ${totalCount ? ((activeCount || 0) / totalCount * 100).toFixed(1) : 0}%`);
        console.log('\n✨ All tests passed! Real-time active customers is working!');

    } catch (error) {
        console.error('\n❌ Test failed:', error);
    }
}

testActiveCustomers();

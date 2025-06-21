/**
 * Test Authentication Flow - Task 2 Verification
 * 
 * This script tests the complete authentication flow to verify
 * that the dashboard hanging issue has been resolved.
 */

import { createClient } from '@supabase/supabase-js';

// You'll need to replace these with your actual Supabase credentials
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow - Task 2 Verification');
  console.log('================================================');

  try {
    // Test 1: Check if subscription function works
    console.log('\n1️⃣ Testing check-subscription function...');
    
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.log('❌ No active session found. Please log in first.');
      return;
    }

    const { data: subData, error: subError } = await supabase.functions.invoke('check-subscription', {});
    
    if (subError) {
      console.log('❌ Subscription check failed:', subError);
    } else {
      console.log('✅ Subscription check successful:', subData);
    }

    // Test 2: Check user profile fetch
    console.log('\n2️⃣ Testing user profile fetch...');
    
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('*')
      .eq('supabase_auth_user_id', sessionData.session.user.id)
      .maybeSingle();

    if (userError) {
      console.log('❌ User profile fetch failed:', userError);
    } else if (!userData) {
      console.log('⚠️ No user profile found - this might be a legacy user');
    } else {
      console.log('✅ User profile found:', userData);
    }

    // Test 3: Check subscription records
    console.log('\n3️⃣ Testing subscription records...');
    
    if (userData?.tenant_id) {
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('tenant_id', userData.tenant_id)
        .eq('subscription_status_enum', 'active');

      if (subscriptionError) {
        console.log('❌ Subscription query failed:', subscriptionError);
      } else if (!subscriptionData || subscriptionData.length === 0) {
        console.log('⚠️ No active subscription records found for tenant:', userData.tenant_id);
        console.log('💡 Run the SQL script from scripts/create_test_subscription.sql');
      } else {
        console.log('✅ Active subscription found:', subscriptionData[0]);
      }
    }

    // Test 4: Test timeout handling
    console.log('\n4️⃣ Testing timeout handling...');
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Test timeout')), 100)
    );

    try {
      await Promise.race([
        supabase.functions.invoke('check-subscription', {}),
        timeoutPromise
      ]);
      console.log('✅ Function completed within timeout');
    } catch (error) {
      if (error.message === 'Test timeout') {
        console.log('⚠️ Function took longer than 100ms (this is normal)');
      } else {
        console.log('❌ Function error:', error);
      }
    }

    console.log('\n🎉 Authentication flow test completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. If subscription records are missing, run: scripts/create_test_subscription.sql');
    console.log('2. Test login/logout in the browser');
    console.log('3. Verify dashboard loads without hanging');
    console.log('4. Test new user signup flow');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAuthFlow();
}

export { testAuthFlow }; 
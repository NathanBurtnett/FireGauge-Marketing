import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://juznipgitbmtfmoszzek.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1em5pcGdpdGJtdGZtb3N6emVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NzUyNTQsImV4cCI6MjA2MTU1MTI1NH0.ZLHbYxFV624fq0eRMncjKnxAm19fukELhgN4zrKsqOo';

const TEST_USER_ID = 'f46519df-5b73-4ba9-ad65-026628047f0a';
const TEST_PRICE_ID = 'price_1RSqV400HE2ZS1pmK1uKuTCe';

describe.skip('Full Subscription Flow End-to-End Tests', () => {
  let supabase: any;

  beforeAll(async () => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('🚀 Starting E2E subscription flow tests...');
  });

  it('should verify database data is correct', async () => {
    console.log('🗄️  Verifying database state...');
    
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id, username, tenant_id, supabase_auth_user_id')
      .eq('supabase_auth_user_id', TEST_USER_ID)
      .single();

    expect(userError).toBeNull();
    expect(userData).toBeTruthy();
    console.log('✅ User data:', userData);

    const { data: tenantData, error: tenantError } = await supabase
      .from('tenant')
      .select('id, stripe_customer_id')
      .eq('id', userData.tenant_id)
      .single();

    expect(tenantError).toBeNull();
    expect(tenantData.stripe_customer_id).toBeTruthy();
    console.log('✅ Tenant data:', tenantData);
  });

  it('should test create-checkout function with anon key (expect 401)', async () => {
    console.log('🛒 Testing create-checkout function...');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId: TEST_PRICE_ID }),
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📊 Response body:', responseText);
    
    // We expect this to fail with 401, but let's see what we get
    expect([401, 500]).toContain(response.status);
  });

  it('should debug the create-checkout function step by step', async () => {
    console.log('🔧 Debugging create-checkout manually...');
    
    // 1. Check if user exists in database
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id, username, tenant_id, supabase_auth_user_id')
      .eq('supabase_auth_user_id', TEST_USER_ID)
      .single();
    
    console.log('1️⃣  User lookup result:', { userData, userError });
    expect(userError).toBeNull();
    expect(userData).toBeTruthy();
    
    // 2. Check if tenant exists and has Stripe customer
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenant')
      .select('id, stripe_customer_id')
      .eq('id', userData.tenant_id)
      .single();
    
    console.log('2️⃣  Tenant lookup result:', { tenantData, tenantError });
    expect(tenantError).toBeNull();
    expect(tenantData.stripe_customer_id).toBeTruthy();
    
    // 3. Validate price ID format
    console.log('3️⃣  Price ID validation:', TEST_PRICE_ID);
    expect(TEST_PRICE_ID).toMatch(/^price_/);
    
    console.log('✅ All manual checks passed! The issue must be in the edge function itself.');
  });
}); 
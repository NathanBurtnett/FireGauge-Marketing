-- ====================================
-- FireGauge Database Diagnostic Queries
-- ====================================

-- 1. Check current user record
SELECT 'USER RECORD' as table_name;
SELECT * FROM public.user 
WHERE supabase_auth_user_id = 'f46519df-5b73-4ba9-ad65-026628047f0a';

-- 2. Check tenant record
SELECT 'TENANT RECORD' as table_name;
SELECT * FROM public.tenant WHERE id = 1;

-- 3. Check subscription records for this tenant
SELECT 'SUBSCRIPTION RECORDS' as table_name;
SELECT * FROM public.subscriptions WHERE tenant_id = 1;

-- 5. Check all table structures to understand relationships
SELECT 'USER TABLE STRUCTURE' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user'
ORDER BY ordinal_position;

SELECT 'SUBSCRIPTIONS TABLE STRUCTURE' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'subscriptions'
ORDER BY ordinal_position;

SELECT 'TENANT TABLE STRUCTURE' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'tenant'
ORDER BY ordinal_position;

-- ====================================
-- DATA INSERTION SCRIPTS (Run if records are missing)
-- ====================================

-- Insert test subscription record (run this if subscriptions table is empty)
-- Note: You'll need to replace the price_id with an actual Stripe price ID from your Stripe dashboard

INSERT INTO public.subscriptions (
  tenant_id,
  stripe_subscription_id,
  stripe_customer_id,
  stripe_price_id,
  subscription_status_enum,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  created_at,
  updated_at
) VALUES (
  1, -- tenant_id (matches your tenant)
  'sub_test_firegauge_' || EXTRACT(EPOCH FROM NOW())::text, -- unique test subscription ID
  'cus_test_firegauge_' || EXTRACT(EPOCH FROM NOW())::text, -- unique test customer ID
  'price_1RNJrPP1sYOfvCvLdRBmGLrt', -- Replace with your actual Stripe price ID
  'active', -- subscription status
  NOW(), -- current period start
  NOW() + INTERVAL '1 month', -- current period end (1 month from now)
  false, -- not cancelling at period end
  NOW(), -- created_at
  NOW()  -- updated_at
)
ON CONFLICT DO NOTHING; -- Prevent duplicates if run multiple times

-- Note: No customers table exists - customer info is stored in tenant.stripe_customer_id

-- ====================================
-- VERIFICATION QUERIES (Run after inserts)
-- ====================================

-- Verify the complete authentication chain
SELECT 'COMPLETE AUTH CHAIN VERIFICATION' as verification;

SELECT 
  u.id as user_id,
  u.username,
  u.role,
  u.is_active as user_active,
  t.id as tenant_id,
  t.name as tenant_name,
  t.stripe_customer_id as tenant_stripe_customer_id,
  s.id as subscription_id,
  s.subscription_status_enum,
  s.stripe_subscription_id,
  s.current_period_end
FROM public.user u
JOIN public.tenant t ON u.tenant_id = t.id
LEFT JOIN public.subscriptions s ON t.id = s.tenant_id
WHERE u.supabase_auth_user_id = 'f46519df-5b73-4ba9-ad65-026628047f0a';

-- Check if there are any other users that might be interfering
SELECT 'ALL USERS IN SYSTEM' as info;
SELECT id, username, role, tenant_id, supabase_auth_user_id, is_active 
FROM public.user;

-- Check if there are multiple tenants
SELECT 'ALL TENANTS IN SYSTEM' as info;
SELECT id, name, created_at FROM public.tenant;

-- Final status check
SELECT 'FINAL STATUS CHECK' as status;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.user WHERE supabase_auth_user_id = 'f46519df-5b73-4ba9-ad65-026628047f0a') 
    THEN '✅ User record exists' 
    ELSE '❌ User record missing' 
  END as user_status,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.tenant WHERE id = 1) 
    THEN '✅ Tenant record exists' 
    ELSE '❌ Tenant record missing' 
  END as tenant_status,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.subscriptions WHERE tenant_id = 1) 
    THEN '✅ Subscription record exists' 
    ELSE '❌ Subscription record missing - THIS IS LIKELY THE ISSUE' 
  END as subscription_status; 
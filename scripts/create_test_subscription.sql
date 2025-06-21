-- ====================================
-- Create Test Subscription Records
-- ====================================

-- This script creates test subscription records for existing tenants
-- to resolve the dashboard hanging issue in Task 2

-- Insert test subscription record for tenant_id = 1 (if it exists)
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
) 
SELECT 
  1 as tenant_id,
  'sub_test_firegauge_' || EXTRACT(EPOCH FROM NOW())::text as stripe_subscription_id,
  'cus_test_firegauge_' || EXTRACT(EPOCH FROM NOW())::text as stripe_customer_id,
  'price_1RSqV400HE2ZS1pmK1uKuTCe' as stripe_price_id, -- Free tier price ID
  'active' as subscription_status_enum,
  NOW() as current_period_start,
  NOW() + INTERVAL '1 month' as current_period_end,
  false as cancel_at_period_end,
  NOW() as created_at,
  NOW() as updated_at
WHERE EXISTS (SELECT 1 FROM public.tenant WHERE id = 1)
  AND NOT EXISTS (SELECT 1 FROM public.subscriptions WHERE tenant_id = 1)
ON CONFLICT DO NOTHING;

-- Insert test subscription records for any other existing tenants
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
)
SELECT 
  t.id as tenant_id,
  'sub_test_firegauge_' || t.id || '_' || EXTRACT(EPOCH FROM NOW())::text as stripe_subscription_id,
  'cus_test_firegauge_' || t.id || '_' || EXTRACT(EPOCH FROM NOW())::text as stripe_customer_id,
  'price_1RSqV400HE2ZS1pmK1uKuTCe' as stripe_price_id, -- Free tier price ID
  'active' as subscription_status_enum,
  NOW() as current_period_start,
  NOW() + INTERVAL '1 month' as current_period_end,
  false as cancel_at_period_end,
  NOW() as created_at,
  NOW() as updated_at
FROM public.tenant t
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscriptions s WHERE s.tenant_id = t.id
);

-- Verification query
SELECT 
  'SUBSCRIPTION RECORDS CREATED' as status,
  COUNT(*) as total_subscriptions
FROM public.subscriptions;

-- Show the complete authentication chain for verification
SELECT 
  u.id as user_id,
  u.username,
  u.role,
  u.is_active as user_active,
  t.id as tenant_id,
  t.name as tenant_name,
  s.id as subscription_id,
  s.subscription_status_enum,
  s.stripe_price_id,
  s.current_period_end
FROM public.user u
JOIN public.tenant t ON u.tenant_id = t.id
LEFT JOIN public.subscriptions s ON t.id = s.tenant_id
ORDER BY u.id; 
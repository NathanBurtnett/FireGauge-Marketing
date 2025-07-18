# Stripe Testing Guide for FireGauge

This guide walks you through setting up and testing the complete customer onboarding flow from the marketing site to the main application.

## 🔧 Initial Stripe Setup

### 1. Stripe Dashboard Configuration

**In your Stripe Dashboard (Test Mode):**

1. **Enable Test Mode**: Ensure you're in test mode (toggle in top-left)
2. **Verify Products & Prices**: Your existing price IDs in `stripe-config.ts` should work
3. **Customer Portal Settings**: 
   - Go to Settings → Customer Portal
   - Enable all features you want customers to access
   - Set billing history, update payment methods, cancel subscriptions

### 2. Environment Variables Setup

**For FireGauge-Marketing (.env):**
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...your_test_key
VITE_API_URL=http://localhost:3000  # Your main app URL
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**For Supabase Functions (.env or deployed environment):**
```bash
STRIPE_SECRET_KEY=sk_test_51...your_test_secret_key
STRIPE_WEBHOOK_SECRET=whsec_...your_webhook_secret
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**For Firemark Main App (.env):**
```bash
STRIPE_SECRET_KEY=sk_test_51...your_test_secret_key
DATABASE_URL=your_database_url
```

### 3. Webhook Configuration

**Critical: Set up Stripe webhooks to handle payments**

1. **In Stripe Dashboard → Developers → Webhooks**
2. **Add endpoint**: `https://your-supabase-project.supabase.co/functions/v1/stripe-webhook`
3. **Select events to listen for**:
   ```
   ✅ checkout.session.completed
   ✅ customer.subscription.created
   ✅ customer.subscription.updated
   ✅ customer.subscription.deleted
   ✅ invoice.payment_succeeded
   ✅ invoice.payment_failed
   ```
4. **Copy webhook signing secret** to your environment variables

## 🧪 Testing the Complete Flow

### Test Scenario 1: New Customer Signup (Free Trial)

**Step 1: Start on Marketing Site**
```bash
cd FireGauge-Marketing
npm run dev
# Visit http://localhost:5173
```

**Step 2: Select Pilot Plan**
1. Navigate to pricing page
2. Click "Start Free Trial" on Pilot plan
3. **Expected**: Redirects to onboarding wizard

**Step 3: Complete Onboarding**
1. Enter email (use `test+customer1@example.com`)
2. Check email for magic link (or check Supabase Auth logs)
3. Complete department setup form
4. **Expected**: Account created in main app

**Step 4: Verify in Main App**
```bash
cd ../Firemark
flask run
# Check http://localhost:3000
```

### Test Scenario 2: Paid Plan Subscription

**Step 1: Select Paid Plan**
1. Choose "Essential" or "Pro" plan
2. Select billing method (monthly/annual)
3. **Expected**: Redirects to Stripe Checkout

**Step 2: Complete Payment**
Use Stripe test cards:
```
✅ Success: 4242 4242 4242 4242
❌ Decline: 4000 0000 0000 0002
⚠️  Requires Authentication: 4000 0025 0000 3155

Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any valid ZIP (e.g., 12345)
```

**Step 3: Webhook Processing**
1. Monitor webhook delivery in Stripe Dashboard
2. Check Supabase logs for function execution
3. Verify subscription created in database

**Step 4: Customer Redirect**
1. **Expected**: Redirect to payment success page
2. **Expected**: Onboarding wizard appears
3. **Expected**: Final redirect to main app

### Test Scenario 3: Invoice Billing

**For Enterprise customers requesting invoice billing:**

1. Select Enterprise plan
2. Choose "Request Invoice" option
3. Fill out detailed billing information
4. **Expected**: Invoice generated via Stripe
5. **Expected**: Account provisioned pending payment

## 🔍 Testing Tools & Monitoring

### Stripe Dashboard Monitoring

**Test Payment Flow:**
1. **Payments**: Monitor successful/failed payments
2. **Customers**: View created customer records
3. **Subscriptions**: Check subscription status and billing cycles
4. **Webhooks**: Verify all events are being delivered successfully

**Key Metrics to Check:**
- ✅ Payment success rate (should be ~100% for test cards)
- ✅ Webhook delivery success (should be 100%)
- ✅ Customer creation rate
- ✅ Subscription activation rate

### Database Verification

**In Supabase/PostgreSQL, verify:**

```sql
-- Check tenant creation
SELECT * FROM tenant ORDER BY created_at DESC LIMIT 10;

-- Check subscription records
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 10;

-- Check user accounts
SELECT * FROM user ORDER BY created_at DESC LIMIT 10;

-- Verify subscription linking
SELECT 
  t.name as department_name,
  t.stripe_customer_id,
  s.stripe_subscription_id,
  s.subscription_status_enum,
  s.current_period_end
FROM tenant t
LEFT JOIN subscriptions s ON t.id = s.tenant_id
ORDER BY t.created_at DESC;
```

### Application Logs

**Monitor these logs during testing:**

**Supabase Function Logs:**
```bash
supabase functions serve --env-file .env.local
# Watch logs for webhook processing
```

**Main App Logs:**
```bash
# In Firemark directory
tail -f logs/app.log
# Watch for account creation and authentication
```

## 🚨 Common Issues & Solutions

### Issue 1: Webhook Not Triggering
**Symptoms**: Payment completes but no account created
**Solutions**:
- Verify webhook URL is correct
- Check webhook signing secret matches
- Ensure webhook events are properly selected
- Test webhook delivery in Stripe Dashboard

### Issue 2: CORS Errors
**Symptoms**: API calls failing from frontend
**Solutions**:
- Add marketing site domain to CORS whitelist
- Verify API URLs match environment configuration
- Check browser network tab for detailed errors

### Issue 3: Subscription Not Created
**Symptoms**: Payment succeeds but subscription not in database
**Solutions**:
- Check Supabase function logs for errors
- Verify database schema matches expected fields
- Check `tenant_station_access` table for proper relationships

### Issue 4: Customer Portal Issues
**Symptoms**: Billing portal links not working
**Solutions**:
- Verify Customer Portal is enabled in Stripe
- Check return URLs are configured correctly
- Ensure customer has valid subscription

## 📋 Pre-Production Checklist

Before going live:

**Stripe Configuration:**
- [ ] Switch to production Stripe keys
- [ ] Update webhook endpoints to production URLs
- [ ] Configure production price IDs
- [ ] Set up proper business information in Stripe
- [ ] Configure tax collection if required

**Application Configuration:**
- [ ] Update API URLs to production
- [ ] Configure production database
- [ ] Set up proper SSL certificates
- [ ] Configure production CORS settings
- [ ] Set up monitoring and alerting

**Testing Verification:**
- [ ] End-to-end flow works with real test payments
- [ ] Webhook delivery is reliable
- [ ] Customer portal functions correctly
- [ ] Subscription management works
- [ ] Invoice generation works for enterprise

## 🔧 Advanced Testing Scenarios

### Subscription Lifecycle Testing

**Test Subscription Changes:**
1. Create subscription
2. Upgrade/downgrade plan
3. Change billing cycle (monthly ↔ annual)
4. Cancel subscription
5. Reactivate subscription

**Test Payment Failures:**
1. Use declining test cards
2. Verify dunning management
3. Test subscription suspension
4. Test recovery workflows

### Multi-Tenant Testing

**Test Department Management:**
1. Create multiple departments
2. Verify data isolation
3. Test shared station access
4. Verify billing separation

This guide should get you set up for comprehensive testing of your entire onboarding and billing flow! 
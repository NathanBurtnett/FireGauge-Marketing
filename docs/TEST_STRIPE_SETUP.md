# 🧪 Testing Stripe Checkout - Complete Guide

## Environment Setup

### 1. Stripe Test Keys
Ensure your `.env` and Supabase environment use **TEST** keys:

```bash
# In your .env file or Supabase Edge Functions secrets
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Starts with pk_test_
STRIPE_SECRET_KEY=sk_test_...       # Starts with sk_test_
```

### 2. Test Credit Cards
Use these Stripe test card numbers:

**✅ Successful Payment:**
- **Card**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any valid ZIP (e.g., `12345`)

**❌ Declined Payment:**
- **Card**: `4000 0000 0000 0002`
- **Expiry**: Any future date
- **CVC**: Any 3 digits
- **ZIP**: Any valid ZIP

**🔄 Requires 3D Secure:**
- **Card**: `4000 0025 0000 3155`
- **Expiry**: Any future date
- **CVC**: Any 3 digits
- **ZIP**: Any valid ZIP

## Testing Steps

### Test 1: Anonymous User Checkout
1. **Open your site** in an **incognito/private window**
2. **Navigate to pricing** (scroll to pricing section or go to `/pricing`)
3. **Click "Choose Essential"** or any paid plan
4. **Verify redirect** to Stripe checkout page
5. **Fill payment form** with test card `4242 4242 4242 4242`
6. **Complete checkout**
7. **Verify redirect** to `/payment-success` page
8. **Check email** (if configured) for account creation notification

### Test 2: Authenticated User Checkout
1. **Sign in** to your account first
2. **Go to pricing** and select a plan
3. **Complete checkout** with test card
4. **Verify** existing account is upgraded

### Test 3: Cancel Flow
1. **Start checkout** process
2. **Click "Back" button** or browser back
3. **Verify** you're redirected to main page (`/`) ✅ **FIXED**

### Test 4: Free Trial Flow
1. **Click "Start Free Trial"** (Pilot 90 plan)
2. **Verify redirect** to `/onboarding?plan=pilot`
3. **Complete onboarding** form
4. **Verify redirect** to main FireGauge app

## Debugging Checkout Issues

### Check Browser Console
Open Developer Tools (F12) and look for:
```javascript
[PRICING PAGE] Creating checkout session for...
[PRICING PAGE] Checkout session created successfully...
[PRICING PAGE] Redirecting to Stripe checkout...
```

### Check Supabase Logs
1. Go to **Supabase Dashboard** → **Edge Functions**
2. Click on **create-checkout** function
3. Check **Logs** tab for:
```
[CREATE-CHECKOUT] Function started
[CREATE-CHECKOUT] Price ID validated
[CREATE-CHECKOUT] Stripe checkout session created
```

### Common Issues & Solutions

**Issue**: "STRIPE_SECRET_KEY is not set"
**Solution**: Add Stripe secret key to Supabase Edge Functions environment

**Issue**: "Authentication required" error
**Solution**: ✅ **FIXED** - Anonymous checkout now works

**Issue**: Cancel URL shows "Not Found"
**Solution**: ✅ **FIXED** - Now redirects to main page

**Issue**: Checkout doesn't start
**Solution**: Check browser console for JavaScript errors

## Webhook Testing

### 1. Test Successful Payment Webhook
After successful test payment, check:
- Account creation in your database
- Subscription status updates
- Email notifications sent

### 2. Stripe Dashboard
Monitor test payments at:
`https://dashboard.stripe.com/test/payments`

## Production Testing Checklist

Before going live:
- [ ] Test all pricing plans
- [ ] Test both anonymous and authenticated flows
- [ ] Test cancel/back navigation
- [ ] Test free trial flow
- [ ] Verify email notifications work
- [ ] Test webhook handling
- [ ] Switch to production Stripe keys
- [ ] Test with real card (small amount)

## Quick Test Commands

```bash
# Start development server
npm run dev

# Test in different browsers
# Chrome Incognito: Ctrl+Shift+N
# Firefox Private: Ctrl+Shift+P
# Safari Private: Cmd+Shift+N
```

## Expected Flow for Anonymous Users

1. **User clicks plan** → Creates checkout session
2. **Completes payment** → Webhook receives event
3. **Webhook creates account** → Sends welcome email
4. **User gets email** → Can sign in to FireGauge app
5. **Account is active** → Subscription is live

---

**💡 Pro Tip**: Keep Stripe Dashboard open in another tab to see test payments in real-time! 
# 90-Day Free Trial Testing Guide

## Overview
This guide provides step-by-step instructions for testing the complete FireGauge 90-day free trial signup flow, including billing setup, tenant creation, and main app integration.

## Test Environment Setup

### Required Test Cards (Stripe Test Mode)
```
✅ SUCCESS SCENARIOS:
• 4242424242424242 (Visa) - General success
• 4000056655665556 (Visa Debit) - Debit card success
• 5555555555554444 (Mastercard) - Mastercard success

❌ FAILURE SCENARIOS:
• 4000000000000002 - Card declined
• 4000000000000069 - Expired card
• 4000000000000119 - Processing error
• 4000000000000341 - Incorrect CVC

📋 TEST DETAILS:
• Expiry: Any future date (e.g., 12/25)
• CVC: Any 3-digit number (e.g., 123)
• ZIP: Any 5-digit code (e.g., 12345)
```

## Complete Testing Flow

### 1. Landing Page to Pricing
```bash
# Start at homepage
https://your-marketing-site.com/

# Test CTAs:
✓ Hero "Start Free Trial" button → /pricing
✓ CTA Section "Start Free 90-Day Trial" → /pricing
✓ Navbar "Get Started" → /pricing
```

### 2. Pricing Page Selection
```bash
# Navigate to pricing
https://your-marketing-site.com/pricing

# Test Pilot 90 Plan:
✓ Select "Pilot 90" plan
✓ Verify "Free" price display
✓ Test billing method toggle (Subscription/Invoice)
✓ Click "Start Free Pilot" → /onboarding?plan=pilot
```

### 3. Onboarding Wizard Testing

#### Step 0: Email Signup (if not authenticated)
```bash
# Test email signup
✓ Enter test email: test+{timestamp}@example.com
✓ Click "Send Magic Link"
✓ Verify toast: "Check your inbox!"
✓ Check email for magic link (or check Supabase auth logs)
```

#### Step 1: Magic Link Authentication
```bash
# Simulate magic link click
✓ Navigate to: /auth/callback?access_token=...&type=magiclink
✓ Verify redirect to: /onboarding?plan=pilot
✓ Confirm user is authenticated
```

#### Step 2: Department Setup
```bash
# Fill department information
✓ Department Name: "Test Fire Department"
✓ Department Type: "Municipal Fire Department"
✓ Primary Contact: "Test Chief"
✓ Phone Number: "(555) 123-4567"
✓ Verify plan display: "Pilot 90 (Free Trial)"
✓ Click "Continue Setup"
```

#### Step 3: Completion & Redirect
```bash
# Completion screen
✓ Verify success message: "Welcome to FireGauge! 🎉"
✓ Verify setup data stored in localStorage
✓ Click "Launch FireGauge"
✓ Verify redirect to main app: https://app.firegauge.app
```

### 4. Billing Setup Testing (Critical for Free Trial)

#### Test Subscription Billing Setup
```bash
# From pricing page with Pilot 90 selected
✓ Select "Subscription" billing method
✓ Click "Start Free Pilot"
✓ Complete onboarding steps 1-2
✓ Verify Stripe checkout session created
✓ Use test card: 4242424242424242
✓ Complete checkout
✓ Verify redirect to /payment-success?session_id=...
✓ Verify redirect to main app
```

#### Test Invoice Billing Setup
```bash
# From pricing page with Pilot 90 selected
✓ Select "Invoice" billing method
✓ Click "Start Free Pilot"
✓ Verify appropriate invoice flow handling
✓ Complete onboarding
```

## Validation Checklist

### ✅ Core Requirements
- [ ] Email signup with magic link works
- [ ] Magic link authentication successful
- [ ] Department setup form validation works
- [ ] Setup data persists through flow
- [ ] Successful redirect to main FireGauge app
- [ ] User remains authenticated in main app

### ✅ Technical Requirements
- [ ] Stripe checkout session created with correct metadata
- [ ] Free trial period set correctly (90 days)
- [ ] Billing setup completed (even for free trial)
- [ ] User account created in Supabase
- [ ] Department/organization data stored
- [ ] Analytics events tracked properly

### ✅ Business Requirements
- [ ] Admin user created with proper permissions
- [ ] Tenant/organization structure established
- [ ] Billing configuration ready for post-trial
- [ ] User can access main app features
- [ ] Trial period clearly communicated
- [ ] Cancellation process available

## Error Scenarios to Test

### Authentication Errors
```bash
✓ Invalid email format
✓ Magic link expired/invalid
✓ Network connectivity issues
✓ Supabase service unavailable
```

### Payment Errors
```bash
✓ Declined card (4000000000000002)
✓ Expired card (4000000000000069)
✓ Invalid CVC (4000000000000127)
✓ Insufficient funds (4000000000009995)
```

### Form Validation Errors
```bash
✓ Missing required fields (Department Name, Contact Name)
✓ Invalid phone number formats
✓ Network timeout during submission
```

## Success Criteria

### Immediate Success (Post-Signup)
- User successfully lands in main FireGauge app
- User is authenticated and can navigate
- Basic tenant/organization setup is complete
- Admin user has appropriate permissions

### Billing Success (Backend)
- Stripe customer created with correct metadata
- Free trial subscription active
- Billing method configured for post-trial
- Trial end date properly set (90 days)

### Long-term Success (Post-Trial)
- User receives trial reminder notifications
- Billing transition works seamlessly at trial end
- User can upgrade/downgrade plans
- Cancellation process works correctly

## Troubleshooting Common Issues

### Magic Link Not Working
```bash
# Check Supabase auth settings
✓ Verify redirect URL configuration
✓ Check email provider settings
✓ Verify domain authentication
```

### Stripe Checkout Issues
```bash
# Verify Stripe configuration
✓ Check test/live mode settings
✓ Verify webhook endpoints
✓ Check price ID mappings
```

### Main App Redirect Issues
```bash
# Check environment variables
✓ Verify VITE_API_URL is correct
✓ Check CORS settings
✓ Verify session transfer
```

## Test Cleanup

### After Each Test
```bash
✓ Clear browser localStorage/sessionStorage
✓ Sign out of any authenticated sessions
✓ Clear browser cache/cookies
✓ Use incognito/private browsing for clean tests
```

### Stripe Test Data
```bash
✓ Review Stripe dashboard for test transactions
✓ Verify customer creation and metadata
✓ Check subscription status and trial periods
```

## Production Readiness Checklist

### Before Live Launch
- [ ] All test scenarios pass consistently
- [ ] Error handling graceful and user-friendly
- [ ] Analytics tracking verified
- [ ] Email deliverability tested
- [ ] Mobile responsive design verified
- [ ] Cross-browser compatibility tested
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Backup/recovery procedures tested
- [ ] Monitoring and alerting configured

---

**Need Help?** Contact support@firegauge.app for assistance with testing or troubleshooting. 
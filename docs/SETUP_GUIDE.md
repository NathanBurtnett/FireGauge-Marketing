# FireGauge Marketing Site - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/bun
- Supabase account and project
- Stripe account (test mode for development)
- Google Analytics 4 property (optional)

### Environment Setup

Create `.env.local` file:
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration  
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Analytics (Optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Installation & Development

```bash
# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or  
bun dev

# Build for production
npm run build
# or
bun run build
```

## 🔧 Supabase Configuration

### 1. Database Setup

Run the migration in your Supabase SQL editor:
```sql
-- Create customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table  
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies (customers can only see their own data)
CREATE POLICY "Users can view own customer data" ON customers
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own subscriptions" ON subscriptions  
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth.uid()::text = id::text
    )
  );
```

### 2. Edge Functions Deployment

Deploy the required Edge Functions:
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy Edge Functions
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook  
supabase functions deploy create-invoice
supabase functions deploy customer-portal
supabase functions deploy check-subscription
```

### 3. Environment Variables for Edge Functions

Set these in your Supabase project dashboard under Settings > Edge Functions:
```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## 💳 Stripe Configuration

### 1. Create Products & Prices

Set up your pricing tiers in Stripe Dashboard or use the provided price IDs in `stripe-config.ts`.

### 2. Webhook Configuration

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 3. Test Cards

Use these for testing:
- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **Insufficient funds**: `4000000000009995`

## 📧 Email Configuration

### Magic Link Templates

Customize your magic link email in Supabase Dashboard:
1. Go to Authentication > Email Templates
2. Update "Confirm signup" template with your branding
3. Set redirect URL to: `https://yourdomain.com/auth/callback`

### SMTP Setup (Optional)

For custom email delivery:
1. Go to Settings > Auth > SMTP Settings
2. Configure your SMTP provider
3. Test email delivery

## 📊 Analytics Setup

### Google Analytics 4

1. Create GA4 property
2. Get Measurement ID (G-XXXXXXXXXX)
3. Add to environment variables
4. Custom events are automatically tracked:
   - `signup_started`
   - `signup_completed` 
   - `plan_selected`
   - `checkout_started`

## 🚀 Deployment

### Render.com (Recommended)

1. Connect your repository
2. Use the provided `render.yaml` configuration
3. Set environment variables in Render dashboard
4. Deploy automatically on git push

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy dist/ folder to your hosting provider
# Ensure proper routing for SPA (Single Page Application)
```

### Environment Variables for Production

```bash
# Supabase (Production)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# Stripe (Production)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key

# Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 🧪 Testing

### End-to-End Testing

```bash
# Run test suite
npm run test

# Test specific components
npm run test -- --grep "Pricing"
```

### Manual Testing Checklist

- [ ] Magic link authentication flow
- [ ] Pricing page with all tiers
- [ ] Stripe checkout (test mode)
- [ ] Onboarding wizard completion
- [ ] Mobile responsive design
- [ ] PWA installation
- [ ] Analytics event tracking

## 🔍 Troubleshooting

### Common Issues

**1. Magic Link Not Working**
- Check SMTP configuration in Supabase
- Verify redirect URL in email template
- Check spam folder

**2. Stripe Checkout Fails**
- Verify publishable key in environment
- Check webhook endpoint is accessible
- Ensure Edge Functions are deployed

**3. Analytics Not Tracking**
- Verify GA4 Measurement ID
- Check browser console for errors
- Ensure tracking consent (if applicable)

**4. PWA Not Installing**
- Verify HTTPS is enabled
- Check manifest.json is accessible
- Ensure service worker is registered

### Support

For technical issues:
1. Check browser console for errors
2. Review Supabase logs for Edge Function errors
3. Verify Stripe webhook delivery in dashboard
4. Test with different browsers/devices

---

*This setup guide provides everything needed to deploy and maintain the FireGauge marketing site successfully.* 
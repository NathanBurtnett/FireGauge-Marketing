# FireGauge Documentation

This directory contains comprehensive documentation for the FireGauge marketing site and its various integrations.

## 📋 Table of Contents

### Getting Started
- [Product Requirements Document (PRD)](PRD.md) - Project overview and requirements

### Setup & Configuration
- [Analytics Tracking Setup](ANALYTICS_TRACKING_SETUP.md) - Google Analytics 4 integration
- [Customer Dashboard Setup](CUSTOMER_DASHBOARD_SETUP.md) - Post-purchase management interface
- [Supabase Email Templates](SUPABASE_EMAIL_TEMPLATES.md) - Email automation configuration
- [Test Stripe Setup](TEST_STRIPE_SETUP.md) - Payment processing configuration
- [Email Automation Setup](EMAIL_AUTOMATION_SETUP.md) - Automated email workflows

### Deployment & Operations
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Production deployment guide
- [Deployment Fixes](DEPLOYMENT_FIXES.md) - Common deployment issues and solutions
- [Render Dashboard Fix](RENDER_DASHBOARD_FIX.md) - Render.com specific deployment fixes

### Testing & Quality Assurance
- [Beta Testing Guide](BETA_TESTING_GUIDE.md) - Testing procedures and protocols

## 🚀 Quick Reference

### Essential Environment Variables
```env
# Required for basic functionality
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Optional for analytics
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Key Features Implemented
- ✅ Supabase Authentication with magic links
- ✅ Stripe payment processing and subscription management
- ✅ Google Analytics 4 tracking and conversion funnel
- ✅ Customer dashboard with usage analytics
- ✅ Responsive design with Tailwind CSS
- ✅ Comprehensive email automation

### Architecture Overview
```
FireGauge Marketing Site
├── Frontend (React + TypeScript)
│   ├── Landing pages and marketing content
│   ├── Pricing and plan selection
│   ├── Customer onboarding wizard
│   └── Post-purchase dashboard
├── Authentication (Supabase)
│   ├── Magic link authentication
│   ├── User management
│   └── Session handling
├── Payments (Stripe)
│   ├── Subscription billing
│   ├── Invoice generation
│   └── Customer portal
└── Analytics (Google Analytics 4)
    ├── Conversion tracking
    ├── Funnel analysis
    └── User behavior insights
```

## 📖 Documentation Guidelines

When updating documentation:

1. **Keep it current** - Update docs when features change
2. **Be specific** - Include exact steps and code examples
3. **Test instructions** - Verify all setup steps work
4. **Link related docs** - Cross-reference relevant documentation
5. **Use clear headings** - Make content easy to scan

## 🆘 Getting Help

If you need assistance:

1. Check the relevant documentation first
2. Search for existing issues in the repository
3. Contact the development team
4. For urgent production issues, follow the deployment fixes guide

---

**Last Updated**: December 2024
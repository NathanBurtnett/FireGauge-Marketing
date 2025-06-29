# 🚀 FireGauge Marketing Site Deployment Checklist

## 🔧 Critical Fixes Applied

### ✅ Authentication Redirect Issue (RESOLVED)
- **Problem**: Magic links were redirecting to Vercel URL instead of Render
- **Root Cause**: Supabase authentication settings pointing to wrong domain
- **Solution**: 
  1. Update Supabase Site URL to: `https://firegauge-marketing.onrender.com`
  2. Add correct redirect URLs in Supabase dashboard
  3. Fixed onboarding wizard redirect logic

### ✅ Email Template Enhancement (COMPLETED)
- **Problem**: Default Supabase magic link emails looked basic
- **Solution**: Created professional branded email template with:
  - FireGauge branding and red theme
  - NFPA compliance messaging
  - Clear call-to-action buttons
  - Mobile-responsive design
  - Professional styling

---

## 🎯 Deployment Steps

### 1. Supabase Configuration (CRITICAL - DO FIRST!)

Visit your [Supabase Dashboard](https://supabase.com/dashboard/project/juznipgitbmtfmoszzek):

**Authentication → Settings:**
```
Site URL: https://firegauge-marketing.onrender.com

Redirect URLs (add each line):
https://firegauge-marketing.onrender.com/**
https://firegauge-marketing.onrender.com/onboarding/**
http://localhost:5173/**
```

### 2. Environment Variables Check

Ensure these are set in Render dashboard:
```bash
NODE_ENV=production
VITE_API_URL=https://firegauge-api.onrender.com
VITE_SUPABASE_URL=https://juznipgitbmtfmoszzek.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RJPQn00HE2ZS1pm...
```

### 3. Render Deployment Configuration

**Service Settings:**
- **Service Name**: `firegauge-marketing`
- **Build Command**: `bun install && bun run build`
- **Start Command**: `bun run preview`
- **Branch**: `main`

### 4. DNS and Domain Setup

**Current URLs:**
- **Marketing Site**: `https://firegauge-marketing.onrender.com`
- **Main App**: `https://firegauge-app.onrender.com`
- **API**: `https://firegauge-api.onrender.com`

---

## 🧪 Testing Checklist

### Pre-Deployment Tests
- [ ] Build completes without errors: `bun run build`
- [ ] Preview works locally: `bun run preview`
- [ ] All environment variables are set
- [ ] Supabase authentication settings updated

### Post-Deployment Tests
- [ ] **Marketing site loads**: Visit `https://firegauge-marketing.onrender.com`
- [ ] **Pricing page works**: Test subscription flow
- [ ] **Authentication flow**: Test magic link signup
  - [ ] Enter email on onboarding page
  - [ ] Receive magic link email
  - [ ] **CRITICAL**: Magic link redirects to Render URL (not Vercel)
  - [ ] Successfully completes onboarding
- [ ] **API connectivity**: Stripe checkout functions
- [ ] **Mobile responsiveness**: Test on mobile devices

### Authentication Testing Steps
1. Go to: `https://firegauge-marketing.onrender.com/onboarding`
2. Enter your email address
3. Check email for magic link
4. **VERIFY**: Link should redirect to `firegauge-marketing.onrender.com` (NOT vercel.app)
5. Complete onboarding flow
6. Check for welcome email with new template

---

## 🎨 Email Template Integration

### Current Setup
- Created professional email template: `WelcomeEmailTemplate.tsx`
- Integrated into onboarding completion flow
- Features FireGauge branding and NFPA messaging

### To Enable Better Emails
1. **Resend Integration**: Configure Resend API for email delivery
2. **SendGrid Alternative**: Use existing SendGrid setup
3. **Custom SMTP**: Configure custom email service

### Email Template Features
- 🔥 FireGauge branding with red theme
- 📧 Professional table-based layout
- 📱 Mobile-responsive design
- 🎯 Clear call-to-action buttons
- 🛡️ NFPA compliance messaging
- 📞 Support contact information

---

## 🚨 Troubleshooting

### If Magic Links Still Redirect to Vercel:
1. **Clear Supabase Cache**: 
   - Go to Supabase Dashboard → Authentication → Settings
   - Save settings again to trigger cache refresh
2. **Wait 5-10 minutes** for Supabase to propagate changes
3. **Test in Incognito Mode** to avoid browser caching

### If Onboarding Breaks:
1. Check browser console for errors
2. Verify all environment variables are set
3. Test API endpoints are responding
4. Check Supabase connection

### If Emails Don't Send:
1. Check Resend/SendGrid API keys
2. Verify email service configuration
3. Check spam folders
4. Review console logs for email errors

---

## 🔄 Deployment Commands

### Local Development
```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

### Deployment
Render will automatically deploy when you push to the `main` branch.

**Manual Trigger**: Go to Render dashboard and click "Deploy Latest Commit"

---

## 📞 Support Information

If you encounter issues:
1. **Check this checklist** first
2. **Review Render deployment logs**
3. **Test authentication flow** step by step
4. **Contact support** if needed

**Key Integration Points:**
- Supabase: Authentication and database
- Stripe: Payment processing  
- Render: Hosting and deployment
- Resend/SendGrid: Email delivery

---

## ✅ Success Criteria

Deployment is successful when:
- [ ] Marketing site loads without errors
- [ ] Magic link authentication works with correct redirects
- [ ] Stripe checkout flow completes
- [ ] Onboarding wizard functions properly
- [ ] All links point to correct Render URLs
- [ ] Email templates display professionally

**Current Status**: ✅ Ready for deployment with all critical fixes applied! 
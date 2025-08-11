# Product Requirements Document: FireGauge Marketing Site (Streamlined)

**Version:** 2.0 - STRATEGIC PIVOT
**Date:** January 2025

**1. Overview & Goals - UPDATED STRATEGY**

The FireGauge Marketing Site (`www.firegauge.app`) is now **exclusively focused on conversion and lead generation**. All account management, billing, and user administration has been moved to the main application (`app.firegauge.app`) to create a unified admin experience.

*   **Primary Goal:** Maximize sign-ups and trial conversions for the FireGauge application.
*   **Core Focus:** 
    *   Lead generation and qualification
    *   Product education and value demonstration
    *   Seamless signup and onboarding flow
    *   Stripe Checkout integration for subscription conversion
*   **What We REMOVED (moved to main app):**
    *   ❌ User management interfaces
    *   ❌ Billing management portals
    *   ❌ Authenticated account dashboards
    *   ❌ Support ticket systems
    *   ❌ Administrative user controls
*   **Target Audience:**
    *   Prospective fire departments (chiefs, decision makers)
    *   Fire equipment testing contractors
    *   Industry stakeholders researching solutions
*   **Strategic Rationale:** Eliminates user confusion about "multiple places to manage things" while optimizing marketing site purely for conversion.

**Simplified Value Propositions (conversion-focused):**

*   **Purpose-Built NFPA Compliance:** Pre-built workflows, audit-grade logging
*   **Mobile-First Experience:** Offline-capable PWA for field operations  
*   **Instant Professional Reporting:** One-click NFPA-compliant PDF generation
*   **Zero Training Required:** Intuitive interface for volunteer crews
*   **Proven ROI:** 20-30 minutes saved per test, dozens of hours reclaimed annually

**2. Streamlined User Journey**

| User Type | Marketing Site Role | Post-Signup Experience |
|-----------|-------------------|------------------------|
| **Prospective Department** | Learn value → See pricing → Start trial/subscription | Redirect to `app.firegauge.app` for ALL management |
| **Contractor** | Understand multi-organization capabilities → Sign up | Access unified admin in main app for billing/users |
| **Decision Maker** | Request demo → Schedule call → Convert | Complete onboarding in main application |

**3. Functional Scope - SIMPLIFIED**

### 3.1. Public-Facing Site (Core Focus)
-   **Homepage:** Compelling hero, clear value proposition, strong CTAs, social proof
-   **Features Pages:** Equipment testing, ISO dashboard, reporting capabilities
-   **Pricing Page:** Clear plan comparison, direct Stripe Checkout links
-   **Demo/Trial Pages:** Lead capture forms, demo video, trial signup
-   **About/Contact:** Company information, contact forms
-   **SEO Content:** Blog posts, resource pages (future)

### 3.2. Conversion-Optimized Signup Flow
1.  **Plan Selection:** User chooses subscription tier
2.  **Stripe Checkout:** Secure payment processing
3.  **Account Creation:** Automated tenant/user creation via API
4.  **Immediate Redirect:** Direct to `app.firegauge.app` for onboarding
5.  **No Marketing Site Portal:** All subsequent activity in main app

### 3.3. Integration with Main Application
-   **One-Way Data Flow:** Marketing site → Main app (via secure API)
-   **No Shared Authentication:** Marketing site handles anonymous users only
-   **Clean Handoff:** Stripe success → API call → Redirect to main app
-   **Support Channel:** Contact forms route to main app admin support system

**4. REMOVED Features (Migrated to Main App)**

### 4.1. Authenticated User Portal ❌ REMOVED
- ~~Login/Registration system~~
- ~~User dashboard~~
- ~~Account management~~
- ~~Billing portal integration~~
- ~~User management interface~~

### 4.2. Administrative Functions ❌ REMOVED  
- ~~Role assignment~~
- ~~Tenant user invitations~~
- ~~Subscription management~~
- ~~Support ticket system~~

**These features now live in the main application's expanded admin interface.**

**5. Technical Requirements - SIMPLIFIED**

*   **Frontend Stack:** Vite, React, TypeScript, Tailwind CSS (existing)
*   **Focus Areas:** Landing page optimization, conversion tracking, A/B testing
*   **Authentication:** NONE (anonymous users only)
*   **Payment Integration:** Stripe Checkout (simplified, one-way flow)
*   **Analytics:** Conversion tracking, funnel analysis, user behavior
*   **Performance:** Fast loading, mobile optimization, SEO optimization

**6. Success Metrics - CONVERSION FOCUSED**

*   **Primary Metrics:**
    *   Conversion rate (visitor → trial signup)
    *   Cost per acquisition (CPA)
    *   Trial-to-paid conversion rate
    *   Demo request conversion rate

*   **Secondary Metrics:**
    *   Landing page bounce rate
    *   Time on pricing page
    *   Funnel drop-off points
    *   Organic search rankings

*   **Removed Metrics:** (Now tracked in main app)
    *   ~~User engagement in portal~~
    *   ~~Billing management usage~~
    *   ~~Support ticket volume~~

**7. Development Priorities**

### Phase 1: Simplification (Immediate)
1. **Remove Complex Features:** Eliminate all authentication and user management
2. **Optimize Conversion Flow:** Streamline signup process
3. **Update Content:** Focus messaging on value and conversion
4. **A/B Testing Setup:** Implement testing framework for optimization

### Phase 2: Conversion Optimization  
1. **Landing Page Variants:** Test different value propositions
2. **Pricing Optimization:** Test pricing presentation and plan structures
3. **Demo Experience:** Enhanced product demonstration capabilities
4. **Lead Qualification:** Better lead scoring and routing

### Phase 3: Growth & Scale
1. **Content Marketing:** SEO-optimized resources and blog
2. **Partner Integrations:** Firemark and other contractor partnerships
3. **Advanced Analytics:** Detailed conversion funnel analysis
4. **Performance Optimization:** Speed and mobile experience improvements

**8. Migration from Current State**

### Immediate Actions:
- [ ] **Content Audit:** Remove all references to user management features
- [ ] **Code Cleanup:** Remove authentication, user portal, billing management code
- [ ] **Redirect Setup:** Route old portal URLs to main app
- [ ] **Analytics Update:** Focus tracking on conversion metrics

### Communication Strategy:
- **Current Users:** Email notification about unified admin experience
- **Marketing Materials:** Update all collateral to reflect simplified journey
- **Sales Process:** Train on new streamlined demo and signup flow

**9. Risk Mitigation**

### Potential Concerns:
- **User Confusion:** During transition period
- **Lost Features:** Users expecting marketing site portal
- **Conversion Impact:** Changes might affect signup flow

### Mitigation Strategies:
- **Clear Communication:** Proactive user education about changes
- **Smooth Redirects:** Seamless routing from old URLs to main app
- **Gradual Rollout:** Phased implementation with monitoring
- **Rollback Plan:** Ability to restore old flow if conversion drops

---

**Strategic Summary:**

This streamlined approach transforms the marketing site into a pure conversion machine while eliminating user confusion about "multiple places to manage things." All complexity moves to the main application where it can be properly integrated with existing workflows, creating a superior user experience and more maintainable codebase.

The marketing site becomes laser-focused on its core job: converting prospects into paying customers as efficiently as possible. 
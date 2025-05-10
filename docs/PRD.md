# Product Requirements Document: FireGauge Marketing & Account Portal

**Version:** 1.0
**Date:** October 26, 2023 (Placeholder)

**1. Overview & Goals**

The FireGauge Marketing & Account Portal (`www.firegauge.app`) serves as the primary digital storefront and customer management hub for the FireGauge SaaS application (`app.firegauge.app`). Its core purpose is to effectively communicate FireGauge's value propositions, drive user sign-ups, facilitate subscription management, and provide a high-level administrative interface for subscribed customers.

*   **Primary Goal:** Maximize sign-ups for the FireGauge application.
*   **Secondary Goals:**
    *   Clearly articulate the value of FireGauge to target audiences.
    *   Provide a seamless onboarding experience.
    *   Allow users to manage their subscriptions and billing details.
    *   Enable account administrators to manage their users and view high-level station data.
    *   Serve as a redirect point to the main application (`app.firegauge.app`).
*   **Target Audience:**
    *   Fire Chiefs
    *   Fire equipment testing contractors
    *   Administrators within these organizations.
*   **Launch Strategy:** Full initial feature set (as outlined in this PRD).

**Value Propositions (to be prominently featured):**

*   **Purpose-Built NFPA Compliance:**
    *   Pre-built NFPA-1962 (hose) workflows with guided pass/fail tests.
    *   Tamper-proof, audit-grade logs and geo-time stamps.
*   **Field-First Mobile Experience:**
    *   Offline-capable PWA (or mobile app) that auto-syncs when you're back online.
*   **Instant, Insurance-Grade Reporting:**
    *   One-click generation of NFPA-compliant PDF packs.
    *   Automated email delivery of test results and annual summary reports.
*   **Lean, Intuitive UI:**
    *   Minimal training for volunteer crews—large buttons, guided flows.
*   **Modular, Scalable Platform:**
    *   Start with hose testing, then add ladder and pump modules as needed.
    *   Multi-tenant, role-based access (admins vs. inspectors).
*   **ROI & Risk Reduction:**
    *   Cut 20–30 min off each hose test; reclaim dozens of staff hours per year.
    *   Avoid ISO/insurance penalties by maintaining complete, up-to-date records.

**Pricing Tiers (to be clearly presented):**

*   **Basic:** $75 – $100/mo ($765 – $1,020/yr). Hose testing only (≤ 75 hoses), 1 Admin + 1 Inspector, offline app, PDF reports.
*   **Standard:** $150 – $200/mo ($1,530 – $2,040/yr). Up to 500 hoses, 2 Admins + 5 Inspectors, audit logs, reminders, basic integrations.
*   **Professional:** $250 – $350/mo ($2,550 – $3,570/yr). Up to 2,000 hoses, 3 Admins + 10 Inspectors, unlimited asset count, API access, priority support.
*   **Enterprise:** Custom. Unlimited users & assets, white-glove onboarding, SSO/LDAP, custom SLAs.
*   **Add-On Modules:**
    *   Ladder inspections: +$50/mo
    *   Pump testing: +$50/mo

**2. Functional Requirements**

The marketing site will utilize Supabase for user authentication and Stripe for payment processing.

**2.1. Public-Facing Pages (Pre-Login):**

*   **Homepage (`/`):**
    *   Compelling headline and sub-headline.
    *   Clear overview of FireGauge and its key benefits (leveraging value propositions).
    *   Visually appealing design with relevant imagery/graphics.
    *   Prominent Call to Actions (CTAs) like "Sign Up Now" or "View Pricing."
    *   Brief overview of features.
    *   Testimonials or social proof (if available, placeholder for now).
*   **Features Page (`/features` - *Optional, can be part of Homepage*):**
    *   Detailed breakdown of each core feature and module (Hose, Ladder, Pump testing).
    *   Use cases and benefits for each feature.
*   **Pricing Page (`/pricing`):**
    *   Clear presentation of all pricing tiers and add-on modules.
    *   Feature comparison between tiers.
    *   CTA for each plan (e.g., "Choose Basic," "Get Started with Standard").
    *   FAQ section related to pricing and plans.
*   **Auth Page (`/auth`):**
    *   Sign-up form: Collect necessary user information (e.g., name, email, password, company name).
    *   Login form.
    *   Password reset functionality.
    *   Links to Terms of Service and Privacy Policy.

**2.2. Authenticated User Portal (Post-Login - `www.firegauge.app`):**

*   **Dashboard (`/dashboard`):**
    *   Welcome message.
    *   High-level overview/summary:
        *   Current subscription plan.
        *   Quick stats (e.g., number of active stations, number of users). This may require API calls to the main application (`app.firegauge.app`) or a shared data layer in Supabase.
    *   Navigation to other portal sections (Account, Billing, User Management).
    *   Prominent link/button to "Go to App" (redirecting to `app.firegauge.app`).
*   **Account Management (`/account`):**
    *   View and update company profile information.
    *   View and update personal profile information (name, email).
    *   Change password.
*   **Billing Management (`/billing`):**
    *   Integration with Stripe customer portal or custom-built interface using Stripe API.
    *   View current subscription plan and details.
    *   Upgrade or downgrade subscription plan.
    *   Update payment methods.
    *   View billing history and download invoices.
    *   Cancel subscription.
*   **User Management (`/users` - *New Page*):**
    *   (For Admin roles) View list of current users within their organization.
    *   Invite new users (Operators and Admins) via email.
    *   Assign/change user roles (Operator, Admin).
    *   Deactivate/remove users.
*   **Station Overview (`/stations` - *New Page, simplified*):**
    *   (For Admin roles) View a list of their company's testing stations.
    *   High-level status or summary for each station (e.g., last test date, number of assets). This data would likely come from the main app's database via Supabase.
    *   *Note: Detailed station management and testing operations occur in `app.firegauge.app`.*

**2.3. Integrations:**

*   **Supabase:** For user authentication and potentially storing user/account data shared between the marketing site and the main app.
*   **Stripe:** For all payment processing and subscription management.
*   **Render:** Hosting platform.
*   **(Future Considerations):**
    *   Email Marketing Platform (e.g., Mailchimp, SendGrid) for transactional emails (welcome, password reset) and marketing communications.
    *   Analytics (e.g., Google Analytics, Plausible) for tracking website traffic and user behavior.

**3. Technical Requirements**

*   **Frontend Stack:** Vite, React, TypeScript, Tailwind CSS (as existing).
*   **UI Components:** Leverage existing `src/components/ui/` (Shadcn/ui likely) and expand as needed.
*   **Routing:** React Router (as existing).
*   **State Management/Data Fetching:** Tanstack Query (as existing).
*   **Authentication:** Supabase Auth.
*   **Payment Integration:** Stripe (Stripe.js, Stripe SDK, Stripe webhooks).
*   **Deployment:** Render.
*   **API Communication:** Secure API endpoints for any interaction with the main `app.firegauge.app` backend (if direct data fetching is needed beyond what Supabase provides).

**4. User Stories**

*   **As a Fire Chief (Potential Customer), I want to quickly understand how FireGauge solves NFPA compliance and reduces inspection time, so I can assess if it's right for my department.**
*   **As a Testing Contractor (Potential Customer), I want to see clear pricing and available features for different tiers, so I can choose the best plan for my business size and needs.**
*   **As a new visitor, I want a simple and secure sign-up process, so I can quickly create an account and select a subscription plan.**
*   **As a new user, I want to be guided to the main application (`app.firegauge.app`) after signing up, so I can start using the software.**
*   **As a Subscribed Admin, I want to log into `www.firegauge.app` to manage my company's billing details and payment methods.**
*   **As a Subscribed Admin, I want to invite new technicians (Operators) and other administrators from my company to use FireGauge.**
*   **As a Subscribed Admin, I want to see a high-level overview of my stations and their status directly from the `www.firegauge.app` portal.**
*   **As a Subscribed Admin, I want to easily upgrade or change my subscription plan as my team or needs grow.**
*   **As any user, I want to be able to reset my password if I forget it.**

**5. Non-Functional Requirements**

*   **Branding & Design:**
    *   **Goal:** Modern, professional, trustworthy, and easy-to-use.
    *   **Color Palette:** Suggestion: Blues (trust, reliability), Oranges/Reds (fire/safety, caution, action - use sparingly as accents), Grays/Whites (cleanliness, modernity). We will need to finalize this.
    *   **Typography:** Clear, legible sans-serif fonts. One for headings, one for body text.
    *   **Logo:** A logo needs to be designed for FireGauge.
    *   **Imagery:** High-quality, relevant images or custom illustrations depicting fire equipment, technicians (if appropriate and inclusive), and abstract representations of data/efficiency.
*   **User Experience (UX):**
    *   Intuitive navigation.
    *   Responsive design for optimal viewing on desktop, tablet, and mobile.
    *   Fast page load times (< 3 seconds).
    *   Clear visual feedback for user actions.
*   **SEO & Discoverability:**
    *   **Goal:** Achieve good rankings for relevant keywords.
    *   **Strategy:**
        *   Keyword research to identify terms used by fire chiefs and testing contractors (e.g., "fire hose testing software," "NFPA 1962 compliance app," "digital fire equipment logs").
        *   On-page SEO: Optimize titles, meta descriptions, headers, and content with target keywords.
        *   Semantic HTML.
        *   Internal linking.
        *   Ensure site is crawlable and indexable (sitemap.xml, robots.txt).
*   **Accessibility:** Aim for WCAG 2.1 Level AA compliance.
*   **Security:**
    *   HTTPS for all traffic.
    *   Secure handling of user credentials and payment information (Stripe handles PCI compliance).
    *   Protection against common web vulnerabilities (OWASP Top 10).
*   **Content Management:** Initially, content will be managed via code. A headless CMS could be considered later if frequent content updates by non-technical users are required.

**6. Success Metrics**

*   **Primary:**
    *   Sign-up conversion rate (visitors who complete sign-up).
    *   Number of new subscriptions per month/quarter.
*   **Secondary:**
    *   Demo request conversion rate (if a "Book a Demo" CTA is added).
    *   Website traffic (total visits, unique visitors).
    *   Bounce rate.
    *   Average time on page.
    *   Keyword rankings for core terms.
    *   User engagement within the authenticated portal (e.g., % of users managing billing, % of admins managing users).
    *   Customer churn rate (monitored via Stripe/main app, but influenced by overall experience including portal).

---

**Next Steps & Recommendations:**

1.  **Branding Exercise:**
    *   Develop 2-3 logo concepts for FireGauge.
    *   Finalize a color palette and typography.
    *   Create a simple style guide.
2.  **Content Creation:**
    *   Write compelling copy for all website pages, focusing on the value propositions and target audience.
3.  **SEO Keyword Finalization:**
    *   Conduct more in-depth keyword research.
4.  **Design Mockups:**
    *   Create wireframes and then high-fidelity mockups for key pages (Homepage, Pricing, Dashboard, Auth).
5.  **Task Breakdown with Taskmaster:**
    *   I recommend saving this PRD as a `.md` or `.txt` file in your project (e.g., in a `docs/` directory or `scripts/` if that's where Taskmaster expects it).
    *   Then, we can use the `mcp_taskmaster-ai_parse_prd` tool to generate an initial set of tasks. This will help us organize the development work. 
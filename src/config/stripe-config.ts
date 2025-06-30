export interface StripePricing {
  monthly: string;
  annual?: string;
  invoice?: string; // For invoice-based pricing (if different)
}

export interface FireGaugePlan {
  id: string;
  name: string;
  displayPrice: string;
  description: string;
  userCount: string;
  assetCount: string;
  coreModules: string;
  features: string[];
  ctaText: string;
  recommended?: boolean;
  isEnterprise?: boolean;
  pricing: StripePricing;
  annualSavings?: string;
  supportsInvoice: boolean;
}

export const FIREGAUGE_PLANS: Record<string, FireGaugePlan> = {
  pilot: {
    id: 'pilot',
    name: 'Pilot 90',
    displayPrice: 'Free',
    description: 'Run one full test season at no cost. Auto-reminds you 75 days in.',
    userCount: '1 Admin + 1 Inspector',
    assetCount: 'Up to 100 assets',
    coreModules: 'Hose Testing (NFPA-1962)',
    features: [
      'Offline PWA / Mobile App',
      'PDF export (1-yr archive)',
      'Guided Pass/Fail flow'
    ],
    ctaText: 'Start Free Trial',
    pricing: {
      monthly: 'price_1RSqV400HE2ZS1pmK1uKuTCe',
      annual: 'price_1RSqV400HE2ZS1pmK1uKuTCe', // Same as monthly for free trial
    },
    supportsInvoice: false, // Free trial doesn't need invoice option
  },
  essential: {
    id: 'essential',
    name: 'Essential',
    displayPrice: '$39',
    description: 'Perfect for volunteer or single-station departments.',
    userCount: '1 Admin + 2 Inspectors',
    assetCount: 'Up to 300 assets',
    coreModules: 'Hose, Ladder add-on ready',
    features: [
      'Everything in Pilot',
      '5-yr PDF archive',
      'CSV import/export',
      'Email support + updates'
    ],
    ctaText: 'Choose Essential',
    pricing: {
      monthly: 'price_1RSqVe00HE2ZS1pmDEo9KWsH',
      annual: 'price_1RSqW500HE2ZS1pmn2qPRJ16',
    },
    annualSavings: '$399/yr (save 15%)',
    supportsInvoice: true,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    displayPrice: '$99',
    description: 'For career departments that need bigger capacity & audit automation.',
    userCount: '3 Admins + 5 Inspectors',
    assetCount: 'Up to 1,500 assets',
    coreModules: 'Hose + Audit Logs + Reminders',
    features: [
      'Everything in Essential',
      'Automated ISO audit packet',
      'Role-based permissions',
      'Zapier / CSV integrations'
    ],
    ctaText: 'Upgrade to Pro',
    recommended: true,
    pricing: {
      monthly: 'price_1RSqWZ00HE2ZS1pmcp0iWhqg',
      annual: 'price_1RSqWs00HE2ZS1pmkDdtxYdV',
    },
    annualSavings: '$999/yr (save 15%)',
    supportsInvoice: true,
  },
  contractor: {
    id: 'contractor',
    name: 'Contractor',
    displayPrice: '$279',
    description: 'Unlimited assets & child departments—ideal for hose-testing vendors.',
    userCount: 'Unlimited users',
    assetCount: 'Unlimited assets',
    coreModules: 'All Pro features + White Label',
    features: [
      'Unlimited departments & assets',
      'White-label PDF & portal',
      'API access',
      'Priority support (next-day)'
    ],
    ctaText: 'Get Contractor',
    pricing: {
      monthly: 'price_1RSqXb00HE2ZS1pmNY4PlTA5',
      annual: 'price_1RSqY000HE2ZS1pmKSzq7p3i',
    },
    annualSavings: '$2,999/yr (save 10%)',
    supportsInvoice: true,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    displayPrice: 'Custom',
    description: 'County-wide or multi-station? Let\'s craft a custom solution.',
    userCount: 'Unlimited users & assets',
    assetCount: 'Unlimited assets',
    coreModules: 'All modules + custom SLAs',
    features: [
      'White-glove onboarding',
      'SSO / LDAP / SCIM',
      'Dedicated CSM & phone support',
      'Custom contract terms'
    ],
    ctaText: 'Contact Sales',
    isEnterprise: true,
    pricing: {
      monthly: 'price_1RSqYn00HE2ZS1pmrIORlH1Q',
      // TODO: Add annual price ID when created in Stripe
      // annual: 'price_[TO_BE_CREATED]',
    },
    supportsInvoice: true,
  },
};

export enum BillingMethod {
  SUBSCRIPTION = 'subscription',
  INVOICE = 'invoice',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
}

export interface BillingSelection {
  planId: string;
  method: BillingMethod;
  cycle: BillingCycle;
  priceId: string;
}

/**
 * Get the appropriate Stripe price ID based on plan, billing method, and cycle
 */
export function getStripePriceId(
  planId: string, 
  method: BillingMethod, 
  cycle: BillingCycle
): string | null {
  const plan = FIREGAUGE_PLANS[planId];
  if (!plan) return null;

  // For invoice method, we'll use the same price IDs but handle differently in checkout
  const priceId = cycle === BillingCycle.ANNUAL ? plan.pricing.annual : plan.pricing.monthly;
  return priceId || null;
}

/**
 * Get plan details by ID
 */
export function getPlanById(planId: string): FireGaugePlan | null {
  return FIREGAUGE_PLANS[planId] || null;
}

/**
 * Get all available plans as an array
 */
export function getAllPlans(): FireGaugePlan[] {
  return Object.values(FIREGAUGE_PLANS);
}

/**
 * Check if a plan supports invoice billing
 */
export function planSupportsInvoice(planId: string): boolean {
  const plan = FIREGAUGE_PLANS[planId];
  return plan?.supportsInvoice || false;
}

/**
 * Check if a plan supports annual billing
 */
export function planSupportsAnnual(planId: string): boolean {
  const plan = FIREGAUGE_PLANS[planId];
  return !!plan?.pricing.annual;
} 
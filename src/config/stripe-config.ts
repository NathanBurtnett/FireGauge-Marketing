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

// Explicit env reads so Vite injects values reliably in dev and build
const envVal = (v: unknown) => typeof v === 'string' ? v.trim() : '';

const VITE_PRICE_PILOT_MONTHLY = envVal((import.meta as any)?.env?.VITE_PRICE_PILOT_MONTHLY);
const VITE_PRICE_PILOT_ANNUAL = envVal((import.meta as any)?.env?.VITE_PRICE_PILOT_ANNUAL);
const VITE_PRICE_PILOT_INVOICE = envVal((import.meta as any)?.env?.VITE_PRICE_PILOT_INVOICE);

const VITE_PRICE_ESSENTIAL_MONTHLY = envVal((import.meta as any)?.env?.VITE_PRICE_ESSENTIAL_MONTHLY);
const VITE_PRICE_ESSENTIAL_ANNUAL = envVal((import.meta as any)?.env?.VITE_PRICE_ESSENTIAL_ANNUAL);

const VITE_PRICE_PRO_MONTHLY = envVal((import.meta as any)?.env?.VITE_PRICE_PRO_MONTHLY);
const VITE_PRICE_PRO_ANNUAL = envVal((import.meta as any)?.env?.VITE_PRICE_PRO_ANNUAL);

const VITE_PRICE_CONTRACTOR_MONTHLY = envVal((import.meta as any)?.env?.VITE_PRICE_CONTRACTOR_MONTHLY);
const VITE_PRICE_CONTRACTOR_ANNUAL = envVal((import.meta as any)?.env?.VITE_PRICE_CONTRACTOR_ANNUAL);

const VITE_PRICE_ENTERPRISE_MONTHLY = envVal((import.meta as any)?.env?.VITE_PRICE_ENTERPRISE_MONTHLY);

export const FIREGAUGE_PLANS: Record<string, FireGaugePlan> = {
  pilot: {
    id: 'pilot',
    name: 'Pilot 90',
    displayPrice: 'Free',
    description: 'Run one full test season at no cost. Auto-reminds you 75 days in. Includes billing setup for seamless transition.',
    userCount: '1 Admin + 1 Inspector',
    assetCount: 'Up to 100 assets',
    coreModules: 'Hose Testing (NFPA-1962)',
    features: [
      'Offline PWA / Mobile App',
      'PDF export (1-yr archive)',
      'Guided Pass/Fail flow',
      'Billing setup included',
      'Cancel anytime',
      'Automatic trial reminders'
    ],
    ctaText: 'Start Free Trial',
    pricing: {
      monthly: VITE_PRICE_PILOT_MONTHLY || '',
      annual: VITE_PRICE_PILOT_ANNUAL || '',
      invoice: VITE_PRICE_PILOT_INVOICE || '',
    },
    supportsInvoice: true, // Enable for proper billing setup
  },
  essential: {
    id: 'essential',
    name: 'Essential',
    displayPrice: '$39',
    description: 'Perfect for volunteer or single-station departments.',
    userCount: 'Unlimited users',
    assetCount: 'Up to 300 assets',
    coreModules: 'Same core features as Pilot',
    features: [
      'Everything in Pilot',
      '5-yr PDF archive',
      'CSV import/export',
      'Email support + updates'
    ],
    ctaText: 'Choose Essential',
    pricing: {
      monthly: VITE_PRICE_ESSENTIAL_MONTHLY || '',
      annual: VITE_PRICE_ESSENTIAL_ANNUAL || '',
    },
    annualSavings: '$399/yr (save 15%)',
    supportsInvoice: true,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    displayPrice: '$99',
    description: 'For career departments that need bigger capacity & audit automation.',
    userCount: 'Unlimited users',
    assetCount: 'Up to 1,500 assets',
    coreModules: 'Same core features as Essential',
    features: [
      'Advanced reporting',
      'Role-based permissions',
      'CSV integrations'
    ],
    ctaText: 'Upgrade to Pro',
    recommended: true,
    pricing: {
      monthly: VITE_PRICE_PRO_MONTHLY || '',
      annual: VITE_PRICE_PRO_ANNUAL || '',
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
    coreModules: 'All core features + White Label',
    features: [
      'Unlimited departments & assets',
      'White-label PDF & portal',
      'CSV/PDF exports',
      'Priority support'
    ],
    ctaText: 'Get Contractor',
    pricing: {
      monthly: VITE_PRICE_CONTRACTOR_MONTHLY || '',
      annual: VITE_PRICE_CONTRACTOR_ANNUAL || '',
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
      'Dedicated account manager',
      'Phone support',
      'Custom contract terms'
    ],
    ctaText: 'Contact Sales',
    isEnterprise: true,
    pricing: {
      monthly: VITE_PRICE_ENTERPRISE_MONTHLY || '',
      // annual: VITE_PRICE_ENTERPRISE_ANNUAL || '',
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
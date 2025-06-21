import React, { useState } from 'react';
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabase";

// Lazy load Stripe only when needed
const getStripe = async () => {
  const { loadStripe } = await import('@stripe/stripe-js');
  return loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
};

interface PricingPlan {
  name: string;
  priceDisplay: string;
  priceAnnotation: string;
  monthlyPriceId: string;
  annualPriceId?: string;
  annualPrice?: string;
  description: string;
  userCount: string;
  assetCount: string;
  coreModules: string;
  features: string[];
  ctaText: string;
  recommended?: boolean;
  isEnterprise?: boolean;
}

const Pricing = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const plans: PricingPlan[] = [
    {
      name: "Pilot 90",
      priceDisplay: "Free",
      priceAnnotation: "90-day trial",
      monthlyPriceId: "price_1RSqV400HE2ZS1pmK1uKuTCe",
      description: "Run one full test season at no cost. Auto-reminds you 75 days in.",
      userCount: "1 Admin + 1 Inspector",
      assetCount: "Up to 100 assets",
      coreModules: "Hose Testing (NFPA-1962)",
      features: [
        "Offline PWA / Mobile App",
        "PDF export (1-yr archive)",
        "Guided Pass/Fail flow"
      ],
      ctaText: "Start Free Trial"
    },
    {
      name: "Essential",
      priceDisplay: "$39",
      priceAnnotation: "/mo",
      monthlyPriceId: "price_1RSqVe00HE2ZS1pmDEo9KWsH",
      annualPriceId: "price_1RSqW500HE2ZS1pmn2qPRJ16",
      annualPrice: "$399/yr (save 15%)",
      description: "Perfect for volunteer or single-station departments.",
      userCount: "1 Admin + 2 Inspectors",
      assetCount: "Up to 300 assets",
      coreModules: "Hose, Ladder add-on ready",
      features: [
        "Everything in Pilot",
        "5-yr PDF archive",
        "CSV import/export",
        "Email support + updates"
      ],
      ctaText: "Choose Essential"
    },
    {
      name: "Pro",
      priceDisplay: "$99",
      priceAnnotation: "/mo",
      monthlyPriceId: "price_1RSqWZ00HE2ZS1pmcp0iWhqg",
      annualPriceId: "price_1RSqWs00HE2ZS1pmkDdtxYdV",
      annualPrice: "$999/yr (save 15%)",
      description: "For career departments that need bigger capacity & audit automation.",
      userCount: "3 Admins + 5 Inspectors",
      assetCount: "Up to 1,500 assets",
      coreModules: "Hose + Audit Logs + Reminders",
      features: [
        "Everything in Essential",
        "Automated ISO audit packet",
        "Role-based permissions",
        "Zapier / CSV integrations"
      ],
      ctaText: "Upgrade to Pro",
      recommended: true
    },
    {
      name: "Contractor",
      priceDisplay: "$279",
      priceAnnotation: "/mo",
      monthlyPriceId: "price_1RSqXb00HE2ZS1pmNY4PlTA5",
      annualPriceId: "price_1RSqY000HE2ZS1pmKSzq7p3i",
      annualPrice: "$2,999/yr (save 10%)",
      description: "Unlimited assets & child departments—ideal for hose-testing vendors.",
      userCount: "Unlimited users",
      assetCount: "Unlimited assets",
      coreModules: "All Pro features + White Label",
      features: [
        "Unlimited departments & assets",
        "White-label PDF & portal",
        "API access",
        "Priority support (next-day)"
      ],
      ctaText: "Get Contractor"
    },
    {
      name: "Enterprise",
      priceDisplay: "Custom",
      priceAnnotation: "",
      monthlyPriceId: "price_1RSqYn00HE2ZS1pmrIORlH1Q",
      description: "County-wide or multi-station? Let's craft a custom solution.",
      userCount: "Unlimited users & assets",
      assetCount: "Unlimited assets",
      coreModules: "All modules + custom SLAs",
      features: [
        "White-glove onboarding",
        "SSO / LDAP / SCIM",
        "Dedicated CSM & phone support",
        "Custom contract terms"
      ],
      ctaText: "Contact Sales",
      isEnterprise: true
    }
  ];

  // "Pay First" checkout flow - no authentication required
  const createCheckoutSession = async (priceId: string, planName: string) => {
    try {
      console.log(`[PRICING] Creating checkout session for ${planName} (${priceId})`);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: priceId,
          metadata: {
            plan_name: planName,
            source: 'marketing_site',
            // Generate a temporary ID to track this specific checkout
            checkout_session_id: Date.now().toString(),
            // Will create account during webhook processing
            requires_account_creation: 'true'
          }
        }
      });

      if (error) {
        console.error('[PRICING] Supabase function error:', error);
        throw error;
      }

      if (!data?.url) {
        console.error('[PRICING] No checkout URL returned:', data);
        throw new Error('No checkout URL returned from server');
      }

      console.log('[PRICING] Checkout session created successfully:', data.url);
      return data.url;
    } catch (error) {
      console.error('[PRICING] Error creating checkout session:', error);
      throw error;
    }
  };

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (planName === "Enterprise") {
      // Redirect to contact page for enterprise
      window.open('mailto:sales@firegauge.app?subject=Enterprise Plan Inquiry', '_blank');
      return;
    }

    if (planName === "Pilot 90") {
      // For free trial, redirect to signup page
      window.location.href = '/onboarding?plan=pilot';
      return;
    }

    setIsLoading(priceId);

    try {
      console.log(`[PRICING] Starting checkout for ${planName}`);
      
      const checkoutUrl = await createCheckoutSession(priceId, planName);
      
      console.log(`[PRICING] Redirecting to Stripe checkout:`, checkoutUrl);
      
      // Analytics tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', 'begin_checkout', {
          currency: 'USD',
          value: parseFloat(plans.find(p => p.monthlyPriceId === priceId)?.priceDisplay.replace('$', '') || '0'),
          items: [{
            item_id: priceId,
            item_name: planName,
            category: 'subscription',
            quantity: 1
          }]
        });
      }

      // Redirect to Stripe Checkout
      // Account will be created automatically via webhook after payment
      window.location.href = checkoutUrl;
      
    } catch (error) {
      console.error('[PRICING] Checkout error:', error);
      toast.error('Failed to start checkout', {
        description: error instanceof Error ? error.message : 'Please try again or contact support'
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <section id="pricing" className="section bg-gray-50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-firegauge-charcoal">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Choose the plan that fits your department's size and needs. Start immediately with our streamlined checkout.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl ${
                plan.recommended ? 'border-2 border-firegauge-accent relative transform md:scale-105' : 'border border-gray-200'
              }`}
            >
              {plan.recommended && (
                <div className="bg-firegauge-accent text-white text-center py-1.5 font-semibold text-xs tracking-wider uppercase">
                  Most Popular
                </div>
              )}
              
              <div className="p-6 flex flex-col flex-grow">
                {/* Plan Name */}
                <h3 className="text-xl font-bold text-firegauge-charcoal mb-2">
                  {plan.name}
                </h3>
                
                {/* Price */}
                <div className="mb-4">
                  <span className="text-4xl font-bold text-firegauge-charcoal">
                    {plan.priceDisplay}
                  </span>
                  {plan.priceAnnotation && (
                    <span className="text-gray-600 ml-1">{plan.priceAnnotation}</span>
                  )}
                  {plan.annualPrice && (
                    <div className="text-sm text-firegauge-accent font-medium mt-1">
                      {plan.annualPrice}
                    </div>
                  )}
                </div>
                
                {/* Description */}
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  {plan.description}
                </p>
                
                {/* Capacity Info */}
                <div className="mb-6 space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-firegauge-charcoal">Users:</span>{' '}
                    <span className="text-gray-600">{plan.userCount}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-firegauge-charcoal">Assets:</span>{' '}
                    <span className="text-gray-600">{plan.assetCount}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-firegauge-charcoal">Modules:</span>{' '}
                    <span className="text-gray-600">{plan.coreModules}</span>
                  </div>
                </div>
                
                {/* Features List */}
                <div className="mb-8 flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="h-5 w-5 text-firegauge-accent mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* CTA Button */}
                <Button
                  className={`w-full py-3 font-semibold transition-all duration-300 ${
                    plan.recommended
                      ? 'bg-firegauge-accent hover:bg-firegauge-accent/90 text-white'
                      : plan.isEnterprise
                      ? 'bg-firegauge-charcoal hover:bg-firegauge-charcoal/90 text-white'
                      : 'bg-firegauge-red hover:bg-firegauge-red/90 text-white'
                  }`}
                  onClick={() => handleSubscribe(plan.monthlyPriceId, plan.name)}
                  disabled={isLoading === plan.monthlyPriceId}
                >
                  {isLoading === plan.monthlyPriceId ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.ctaText
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Need help choosing? <a href="/contact" className="text-firegauge-red hover:underline">Contact our team</a> for a personalized recommendation.
          </p>
          <p className="text-sm text-gray-500">
            All plans include SSL encryption, automatic backups, and 99.9% uptime SLA.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;


import React, { useState } from 'react';
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/sonner";
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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
  ctaNavPath?: string;
  recommended?: boolean;
  isEnterprise?: boolean;
}

const Pricing = () => {
  const navigate = useNavigate();
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
      ctaText: "Start Free Pilot",
      ctaNavPath: "/auth"
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
      ctaText: "Choose Essential",
      ctaNavPath: "/auth"
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
      ctaNavPath: "/auth",
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
      ctaText: "Get Contractor",
      ctaNavPath: "/auth"
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

  const handleCtaClick = async (plan: PricingPlan) => {
    setIsLoading(plan.name);

    if (plan.isEnterprise) {
      window.location.href = "mailto:sales@firegauge.app?subject=Enterprise%20Plan%20Inquiry";
      setIsLoading(null);
      return;
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      toast.info("Please sign in or create an account to subscribe.", {
        action: {
          label: "Sign In",
          onClick: () => navigate("/auth"),
        },
      });
      setIsLoading(null);
      if(plan.ctaNavPath && !session) navigate(plan.ctaNavPath);
      return;
    }
    
    const selectedPriceId = plan.monthlyPriceId; 
    if (!selectedPriceId) {
        toast.error("This plan does not have a configured monthly price ID.");
        setIsLoading(null);
        return;
    }

    try {
      const { data: checkoutResponse, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: selectedPriceId },
      });

      if (checkoutError) {
        throw new Error(`Checkout function error: ${checkoutError.message}`);
      }

      if (checkoutResponse && checkoutResponse.url) {
        const stripe = await stripePromise;
        if (!stripe) {
          toast.error("Stripe.js failed to load.");
          setIsLoading(null);
          return;
        }
        const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: checkoutResponse.sessionId || checkoutResponse.url });
        if (stripeError) {
          toast.error(`Stripe redirect error: ${stripeError.message}`);
        }
      } else {
        toast.error("Failed to create checkout session. No URL returned.");
      }
    } catch (error: any) {
      toast.error(`Subscription error: ${error.message}`);
      console.error("Subscription process error:", error);
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
            Choose the plan that fits your department's size and needs. All paid plans include a 30-day free trial.
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
                <h3 className="text-2xl font-semibold mb-3 text-firegauge-charcoal">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-4 min-h-[3em]">{plan.description}</p>
                
                <div className="mb-5">
                  <span className="text-4xl font-bold text-firegauge-charcoal">{plan.priceDisplay}</span>
                  <span className="text-lg font-medium text-gray-500 ml-1">{plan.priceAnnotation}</span>
                  {plan.annualPrice && (
                    <p className="text-xs text-gray-500 mt-1">{plan.annualPrice}</p>
                  )}
                </div>
                
                <div className="mb-5 text-sm">
                  <p className="text-gray-700"><strong className="font-medium text-firegauge-charcoal">Users:</strong> {plan.userCount}</p>
                  <p className="text-gray-700"><strong className="font-medium text-firegauge-charcoal">Assets:</strong> {plan.assetCount}</p>
                  <p className="text-gray-700"><strong className="font-medium text-firegauge-charcoal">Core:</strong> {plan.coreModules}</p>
                </div>
                
                <ul className="space-y-2 mb-6 text-sm flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="text-firegauge-red h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleCtaClick(plan)}
                  disabled={isLoading === plan.name}
                  className={`w-full mt-6 py-3 text-lg font-semibold rounded-md transition-colors duration-300 ease-in-out 
                    ${plan.recommended ? 'bg-firegauge-red text-white hover:bg-firegauge-red/90' : 'bg-firegauge-charcoal text-white hover:bg-black'}
                    ${plan.isEnterprise ? 'bg-firegauge-blue text-white hover:bg-firegauge-blue/90' : ''}
                  `}
                >
                  {isLoading === plan.name ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    plan.ctaText
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
            <p className="text-sm text-gray-600">All paid plans come with a 30-day free trial. Enterprise plan trials are subject to discussion.</p>
        </div>

      </div>
    </section>
  );
};

export default Pricing;

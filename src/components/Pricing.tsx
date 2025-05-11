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
  hoseCount?: string;
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
      name: "Basic",
      priceDisplay: "$75",
      priceAnnotation: "/mo",
      monthlyPriceId: "price_1RNJhVP1sYOfvCvLsAvRxcqb",
      annualPriceId: "price_1RNJqcP1sYOfvCvLEoaumdgs",
      annualPrice: "$765/yr (Save ≈15%)",
      description: "Ideal for small departments or those new to digital testing.",
      userCount: "1 Admin + 1 Inspector",
      hoseCount: "≤ 75 hoses",
      coreModules: "Hose Testing (NFPA-1962)",
      features: [
        "Offline PWA or Mobile App",
        "PDF Reports",
        "Geo-time Stamps",
        "Guided Pass/Fail Tests"
      ],
      ctaText: "Get Started",
      ctaNavPath: "/auth",
    },
    {
      name: "Standard",
      priceDisplay: "$150",
      priceAnnotation: "/mo",
      monthlyPriceId: "price_1RNJrPP1sYOfvCvLdRBmGLrt",
      annualPriceId: "price_1RNJrdP1sYOfvCvLmOcwLZes",
      annualPrice: "$1,530/yr (Save ≈15%)",
      description: "Best for growing departments needing more capacity and features.",
      userCount: "2 Admins + 5 Inspectors",
      hoseCount: "Up to 500 hoses",
      coreModules: "Hose Testing + Audit Logs + Reminders",
      features: [
        "Everything in Basic",
        "Audit Logs & Tamper-Proof Records",
        "Automated Reminders",
        "Basic Integrations"
      ],
      ctaText: "Sign Up Now",
      ctaNavPath: "/auth",
      recommended: true,
    },
    {
      name: "Professional",
      priceDisplay: "$250",
      priceAnnotation: "/mo",
      monthlyPriceId: "price_1RNJryP1sYOfvCvLSMsb5zqQ",
      annualPriceId: "price_1RNJsAP1sYOfvCvL4sOrMFAT",
      annualPrice: "$2,550/yr (Save ≈15%)",
      description: "For established departments requiring advanced features and support.",
      userCount: "3 Admins + 10 Inspectors",
      hoseCount: "Up to 2,000 hoses",
      coreModules: "All Standard Features + API Access",
      features: [
        "Everything in Standard",
        "Unlimited Asset Count (beyond hoses)",
        "API Access",
        "Priority Support"
      ],
      ctaText: "Choose Professional",
      ctaNavPath: "/auth",
    },
    {
      name: "Enterprise",
      priceDisplay: "Custom",
      priceAnnotation: "Tailored to your needs",
      monthlyPriceId: "price_1RNJsvP1sYOfvCvLpPjx4t8n",
      description: "For large organizations with unique requirements, advanced security, and dedicated support.",
      userCount: "Unlimited Users & Assets",
      coreModules: "All Modules + Custom Development",
      features: [
        "Everything in Professional",
        "White-glove onboarding & data migration",
        "SSO/LDAP integration",
        "Custom SLAs & dedicated support",
        "Volume discounts & custom contract terms"
      ],
      ctaText: "Contact Sales",
      isEnterprise: true,
    },
  ];

  const addOns = [
    { name: "Ladder Inspections Module", price: "+$50/mo per module", id: "price_1RNJtXP1sYOfvCvL8Ovg4wJG" },
    { name: "Pump Testing Module", price: "+$50/mo per module", id: "price_1RNJtmP1sYOfvCvLgKCVp5vT" },
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl ${
                plan.recommended ? 'border-2 border-firegauge-accent relative transform md:scale-105' : 'border border-gray-200'
              } ${plan.isEnterprise ? 'lg:col-span-1 md:col-span-2' : 'lg:col-span-1'}`}
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
                  {plan.hoseCount && <p className="text-gray-700"><strong className="font-medium text-firegauge-charcoal">Hoses:</strong> {plan.hoseCount}</p>}
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

        <div className="mt-16 pt-8 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-center mb-4 text-firegauge-charcoal">Optional Add-On Modules</h3>
          <p className="text-center text-gray-600 mb-8 max-w-xl mx-auto">
            Enhance your FireGauge experience with specialized modules. Add to any plan (Basic, Standard, Professional).
          </p>
          <div className="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
            {addOns.map(addon => (
              <div key={addon.name} className="bg-white p-6 rounded-lg shadow-md text-center">
                <h4 className="text-lg font-semibold text-firegauge-charcoal mb-1">{addon.name}</h4>
                <p className="text-firegauge-red font-bold">{addon.price}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-12">
            <p className="text-sm text-gray-600">* "Unlimited asset tracking" for Professional and Enterprise plans refers to assets beyond the specified hose counts, such as equipment, vehicles, or other testable items. Hose testing itself is subject to the listed hose counts for Basic, Standard, and Professional plans, or as defined in custom Enterprise agreements.</p>
            <p className="text-sm text-gray-600 mt-1">** All paid plans (Basic, Standard, Professional) come with a 30-day free trial. Enterprise plan trials are subject to discussion.</p>
        </div>

      </div>
    </section>
  );
};

export default Pricing;

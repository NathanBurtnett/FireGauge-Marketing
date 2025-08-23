import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { trackingHelpers } from "../lib/analytics";
import { Check, Loader2, CreditCard, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSubscription } from "@/components/hooks/useSubscription";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabase";
import { createCheckoutSession, createInvoice } from "@/api/billing";
import { BillingMethod, BillingCycle, FIREGAUGE_PLANS, getStripePriceId } from "@/config/stripe-config";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Declare gtag for analytics
declare global {
  function gtag(...args: any[]): void;
}

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
  supportsInvoice?: boolean;
}

interface BillingMethodOption {
  value: BillingMethod;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const PricingPage = () => {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref') || '';
  const { user } = useAuth();
  const { createCheckoutSession: hookCreateCheckout } = useSubscription();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [selectedBillingMethod, setSelectedBillingMethod] = useState<BillingMethod>(BillingMethod.SUBSCRIPTION);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<BillingCycle>(BillingCycle.MONTHLY);
  const [promoCode, setPromoCode] = useState<string>("");

  // Track pricing page view
  useEffect(() => {
    trackingHelpers.trackPricingView();
  }, []);

  const billingMethods: BillingMethodOption[] = [
    {
      value: BillingMethod.SUBSCRIPTION,
      label: "Subscription",
      icon: <CreditCard className="h-4 w-4" />,
      description: "Automatic billing, cancel anytime"
    },
    {
      value: BillingMethod.INVOICE,
      label: "Invoice",
      icon: <FileText className="h-4 w-4" />,
      description: "Get invoiced, pay later"
    }
  ];

  const plans: PricingPlan[] = [
    {
      name: "Pilot 90",
      priceDisplay: "Free",
      priceAnnotation: "90-day trial",
      monthlyPriceId: "price_1RSqV400HE2ZS1pmK1uKuTCe",
      description: "Run one full test season at no cost. Auto-reminds you 75 days in. Includes billing setup for seamless transition.",
      userCount: "Unlimited users",
      assetCount: "Up to 100 assets",
      coreModules: "All Equipment Testing (NFPA Compliant)",
      features: [
        "Offline PWA / Mobile App",
        "PDF export (1-yr archive)",
        "Guided Pass/Fail flow",
        "Billing setup included",
        "Cancel anytime",
        "Automatic trial reminders"
      ],
      ctaText: "Start Free Pilot",
      supportsInvoice: true
    },
    {
      name: "Essential",
      priceDisplay: "$39",
      priceAnnotation: "/mo",
      monthlyPriceId: "price_1RSqVe00HE2ZS1pmDEo9KWsH",
      annualPriceId: "price_1RSqW500HE2ZS1pmn2qPRJ16",
      annualPrice: "$399/yr (save 15%)",
      description: "Perfect for volunteer or single-station departments.",
      userCount: "Unlimited users",
      assetCount: "Up to 300 assets",
      coreModules: "Same core features as Pilot",
      features: [
        "Same core features as Pilot",
        "Multi-year PDF archive",
        "CSV import/export",
        "Email support + updates"
      ],
      ctaText: "Choose Essential",
      supportsInvoice: true
    },
    {
      name: "Pro",
      priceDisplay: "$99",
      priceAnnotation: "/mo",
      monthlyPriceId: "price_1RSqWZ00HE2ZS1pmcp0iWhqg",
      annualPriceId: "price_1RSqWs00HE2ZS1pmkDdtxYdV",
      annualPrice: "$999/yr (save 15%)",
      description: "For career departments that need bigger capacity & audit automation.",
      userCount: "Unlimited users",
      assetCount: "Up to 1,500 assets",
      coreModules: "Same core features as Essential",
      features: [
        "Advanced reporting",
        "Role-based permissions",
        "CSV integrations"
      ],
      ctaText: "Upgrade to Pro",
      recommended: true,
      supportsInvoice: true
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
      coreModules: "All core features + White Label",
      features: [
        "Unlimited departments & assets",
        "White-label PDF & portal",
        "CSV/PDF exports",
        "Priority support"
      ],
      ctaText: "Get Contractor",
      supportsInvoice: true
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
        "Dedicated account manager",
        "Phone support",
        "Custom contract terms"
      ],
      ctaText: "Contact Sales",
      isEnterprise: true,
      supportsInvoice: true
    }
  ];

  // Enhanced billing handling that supports both subscription and invoice
  const handleBilling = async (plan: PricingPlan) => {
    setIsLoading(plan.name);

    // Track plan selection
    trackingHelpers.trackPricingView(plan.name);

    if (plan.isEnterprise) {
      // Track enterprise contact
      trackingHelpers.trackContactForm(true);
      window.location.href = "mailto:sales@firegauge.app?subject=Enterprise%20Plan%20Inquiry";
      setIsLoading(null);
      return;
    }

    try {
      const priceId = selectedBillingCycle === BillingCycle.ANNUAL && plan.annualPriceId 
        ? plan.annualPriceId 
        : plan.monthlyPriceId;

      if (selectedBillingMethod === BillingMethod.INVOICE) {
        // Handle invoice billing
        if (!plan.supportsInvoice) {
          toast.error("Invoice billing not available", {
            description: "This plan doesn't support invoice billing. Please choose subscription billing.",
          });
          setIsLoading(null);
          return;
        }

        // For invoice method, redirect to a form where they can enter their details
        const invoiceUrl = `/invoice-request?plan=${plan.name}&priceId=${priceId}&cycle=${selectedBillingCycle}${referralCode ? `&ref=${encodeURIComponent(referralCode)}` : ''}${promoCode ? `&promo=${encodeURIComponent(promoCode)}` : ''}`;
        window.location.href = invoiceUrl;
        setIsLoading(null);
        return;
      }

      // Handle subscription billing (existing flow)
      console.log(`[PRICING PAGE] Creating checkout session for ${plan.name} (${priceId})`);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: priceId,
          promoCode: promoCode || undefined,
          metadata: {
            plan_name: plan.name,
            billing_method: selectedBillingMethod,
            billing_cycle: selectedBillingCycle,
            source: 'pricing_page',
            checkout_session_id: Date.now().toString(),
            requires_account_creation: user ? 'false' : 'true',
            is_free_trial: plan.name === 'Pilot 90' ? 'true' : 'false',
            ...(referralCode ? { referral_code: referralCode } : {})
          }
        }
      });

      if (error) {
        console.error('[PRICING PAGE] Supabase function error:', error);
        throw error;
      }

      if (!data?.url) {
        console.error('[PRICING PAGE] No checkout URL returned:', data);
        throw new Error('No checkout URL returned from server');
      }

      console.log('[PRICING PAGE] Checkout session created successfully:', data.url);
      
      // Track conversion
      trackingHelpers.trackPricingView(plan.name);
      
      // Redirect to Stripe checkout
      window.location.href = data.url;

    } catch (error) {
      console.error('[PRICING PAGE] Error:', error);
      toast.error("Checkout Error", {
        description: "Failed to create checkout session. Please try again or contact support.",
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-firegauge-charcoal mb-4">
              Choose Your FireGauge Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Professional fire equipment management solutions designed for departments of every size
            </p>

            {/* Free Trial Info for Pilot Plan */}
            <Alert className="max-w-2xl mx-auto mb-8 bg-green-50 border-green-200">
              <Info className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>90-Day Free Trial:</strong> Start with our Pilot plan completely free. 
                Set up billing now for seamless transition when ready. Cancel anytime, no commitment.
              </AlertDescription>
            </Alert>

            {/* Billing Method Selection */}
            <div className="max-w-md mx-auto mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Billing Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                {billingMethods.map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setSelectedBillingMethod(method.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedBillingMethod === method.value
                        ? 'border-firegauge-red bg-red-50 text-firegauge-red'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {method.icon}
                      <span className="font-medium">{method.label}</span>
                    </div>
                    <p className="text-xs mt-1 text-gray-600">{method.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Billing Cycle Selection (only for subscription) */}
            {selectedBillingMethod === BillingMethod.SUBSCRIPTION && (
              <div className="max-w-sm mx-auto mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Billing Cycle
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedBillingCycle(BillingCycle.MONTHLY)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedBillingCycle === BillingCycle.MONTHLY
                        ? 'border-firegauge-red bg-red-50 text-firegauge-red'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium">Monthly</span>
                  </button>
                  <button
                    onClick={() => setSelectedBillingCycle(BillingCycle.ANNUAL)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedBillingCycle === BillingCycle.ANNUAL
                        ? 'border-firegauge-red bg-red-50 text-firegauge-red'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium">Annual</span>
                    <p className="text-xs mt-1 text-green-600">Save 10-15%</p>
                  </button>
                </div>
              </div>
            )}
            {/* Promo Code (optional) */}
            <div className="max-w-sm mx-auto mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Promo Code (optional)
              </label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.trim())}
                placeholder="Enter promo code"
                className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-firegauge-red"
              />
            </div>
            
            {/* Existing Customer Portal */}
            {user && (
              <div className="mt-8 max-w-md mx-auto">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-sm font-medium text-blue-800">Existing Customer?</p>
                      <p className="text-xs text-blue-600">Access your FireGauge app</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      onClick={() => window.open(import.meta.env.VITE_API_URL || 'https://app.firegauge.app', '_blank')}
                    >
                      Open App
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {plans.map((plan) => {
              const displayPrice = selectedBillingCycle === BillingCycle.ANNUAL && plan.annualPrice
                ? plan.annualPrice
                : plan.priceDisplay + plan.priceAnnotation;

              return (
                <div
                  key={plan.name}
                  className={`bg-white rounded-xl shadow-lg p-6 relative transition-all duration-300 hover:shadow-xl ${
                    plan.recommended 
                      ? 'border-2 border-firegauge-red transform scale-105' 
                      : 'border border-gray-200'
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-firegauge-red text-white px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-firegauge-charcoal mb-2">
                      {plan.name}
                    </h3>
                    <div className="mb-3">
                      <span className="text-3xl font-bold text-firegauge-red">
                        {displayPrice}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                  </div>

                  <div className="space-y-3 mb-6 text-sm">
                    <div className="text-center py-2 bg-gray-50 rounded">
                      <strong>{plan.userCount}</strong>
                    </div>
                    <div className="text-center py-2 bg-gray-50 rounded">
                      <strong>{plan.assetCount}</strong>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Show billing method compatibility */}
                  {selectedBillingMethod === BillingMethod.INVOICE && !plan.supportsInvoice && (
                    <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                      Invoice billing not available for this plan
                    </div>
                  )}

                  <Button
                    className={`w-full ${
                      plan.recommended 
                        ? 'bg-firegauge-red hover:bg-firegauge-red/90' 
                        : 'bg-firegauge-charcoal hover:bg-firegauge-charcoal/90'
                    }`}
                    onClick={() => handleBilling(plan)}
                    disabled={isLoading === plan.name || (selectedBillingMethod === BillingMethod.INVOICE && !plan.supportsInvoice)}
                  >
                    {isLoading === plan.name ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : selectedBillingMethod === BillingMethod.INVOICE ? (
                      <FileText className="mr-2 h-4 w-4" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    {plan.ctaText}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-gray-500">
              Need help choosing? <a href="mailto:sales@firegauge.app" className="text-firegauge-red hover:underline">Contact our team</a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage; 
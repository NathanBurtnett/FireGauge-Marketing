import React, { useState, useEffect } from 'react';
import { trackingHelpers } from "../lib/analytics";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSubscription } from "@/components/hooks/useSubscription";
import { toast } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

const PricingPage = () => {
  const { user } = useAuth();
  const { createCheckoutSession } = useSubscription();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Track pricing page view
  useEffect(() => {
    trackingHelpers.trackPricingView();
  }, []);

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
      ctaText: "Start Free Pilot"
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

  const handlePlanAction = async (plan: PricingPlan) => {
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

    if (!user) {
      toast.error("Authentication required", {
        description: "Please sign in to subscribe to a plan",
      });
      setIsLoading(null);
      return;
    }

    try {
      // Track trial/subscription start
      trackingHelpers.trackTrialStart(plan.name);
      
      const checkoutUrl = await createCheckoutSession(plan.monthlyPriceId);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error("Could not initiate plan change", {
          description: "Please try again or contact support",
        });
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred", {
        description: error.message,
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-firegauge-charcoal mb-2">
            Choose Your Plan
          </h1>
          <p className="text-gray-600">
            Simple, transparent pricing that scales with your department
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.recommended ? 'ring-2 ring-firegauge-red' : ''}`}
            >
              {plan.recommended && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-firegauge-red">
                  Recommended
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center">
                  <span className="text-3xl font-bold text-firegauge-charcoal">
                    {plan.priceDisplay}
                  </span>
                  {plan.priceAnnotation && (
                    <span className="text-gray-500 ml-1">{plan.priceAnnotation}</span>
                  )}
                </div>
                {plan.annualPrice && (
                  <p className="text-sm text-firegauge-red font-medium">
                    {plan.annualPrice}
                  </p>
                )}
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Users:</span> {plan.userCount}
                  </div>
                  <div>
                    <span className="font-medium">Assets:</span> {plan.assetCount}
                  </div>
                  <div>
                    <span className="font-medium">Modules:</span> {plan.coreModules}
                  </div>
                </div>
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${plan.recommended ? 'bg-firegauge-red hover:bg-firegauge-red/90' : 'bg-firegauge-charcoal hover:bg-firegauge-charcoal/90'}`}
                  onClick={() => handlePlanAction(plan)}
                  disabled={isLoading === plan.name}
                >
                  {isLoading === plan.name ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {plan.ctaText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Questions about pricing or need a custom solution?
          </p>
          <div className="space-x-4">
            <Button variant="outline" onClick={() => window.location.href = 'mailto:sales@firegauge.app'}>
              Contact Sales
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/help'}>
              View FAQ
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PricingPage; 
import React, { useState } from 'react';
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { FormDialog } from "@/components/ui/marketing-dialogs";
import { supabase } from "@/lib/supabase";
import { BillingCycle, getPlanById } from "@/config/stripe-config";

// Simple pricing structure for clarity
interface PricingPlan {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  description: string;
  userCount: string;
  assetCount: string;
  features: string[];
  ctaText: string;
  recommended?: boolean;
  isEnterprise?: boolean;
}

const Pricing = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(BillingCycle.MONTHLY);
  const [promoCode, setPromoCode] = useState<string>("");

  const plans: PricingPlan[] = [
    {
      id: 'pilot',
      name: "Pilot",
      price: "Free",
      priceNote: "90-day trial",
      description: "Run one full test season at no cost",
      userCount: "Unlimited users",
      assetCount: "Up to 100 assets",
      features: [
        "All equipment types (hoses, hydrants, ladders, pumps)",
        "Offline mobile app with sync",
        "NFPA/ISO compliant PDF reports",
        "Basic email support"
      ],
      ctaText: "Start Free Trial"
    },
    {
      id: 'essential',
      name: "Essential",
      price: "$39",
      priceNote: "/month",
      description: "Perfect for volunteer or single-station departments",
      userCount: "Unlimited users",
      assetCount: "Up to 300 assets",
      features: [
        "Same core features as Pilot",
        "CSV import/export",
        "Email support",
        "Equipment tracking",
        "Compliance reporting"
      ],
      ctaText: "Choose Essential"
    },
    {
      id: 'pro',
      name: "Pro",
      price: "$99",
      priceNote: "/month",
      description: "For career departments that need bigger capacity",
      userCount: "Unlimited users",
      assetCount: "Up to 1,500 assets",
      features: [
        "Same core features as Essential",
        "Role-based permissions",
        "Advanced reports",
        "Custom branding (Contractor/Enterprise)",
        "Priority email support"
      ],
      ctaText: "Upgrade to Pro",
      recommended: true
    },
    {
      id: 'contractor',
      name: "Contractor",
      price: "$279",
      priceNote: "/month",
      description: "Unlimited assets for large operations",
      userCount: "Unlimited users",
      assetCount: "Unlimited assets",
      features: [
        "All core features",
        "Multi-department management",
        "Branding & white-labeling",
        "CSV/PDF exports",
        "Priority support"
      ],
      ctaText: "Get Contractor"
    },
    {
      id: 'enterprise',
      name: "Enterprise",
      price: "Custom",
      priceNote: "",
      description: "County-wide or multi-station departments",
      userCount: "Unlimited users",
      assetCount: "Unlimited assets + custom features",
      features: [
        "White-glove onboarding",
        "Dedicated account manager",
        "Custom integrations (case-by-case)",
        "SLA arrangements",
        "Custom contract terms"
      ],
      ctaText: "Contact Sales",
      isEnterprise: true
    }
  ];

  const handlePlanSelect = async (plan: PricingPlan) => {
    setIsLoading(plan.id);

    try {
      if (plan.isEnterprise) {
        // Track enterprise contact
        window.location.href = "mailto:sales@firegauge.app?subject=Enterprise%20Plan%20Inquiry";
        return;
      }

      if (plan.id === 'pilot') {
        // For free trial, go directly to onboarding
        navigate(`/onboarding?plan=${plan.id}`);
        return;
      }
      // Open inline dialog for billing cycle and promo, then start checkout
      setSelectedPlanId(plan.id);
      setDialogOpen(true);
      
    } catch (error) {
      console.error('Plan selection error:', error);
      toast.error("Something went wrong", {
        description: "Please try again or contact support",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const startCheckout = async () => {
    if (!selectedPlanId) return;
    const plan = getPlanById(selectedPlanId);
    if (!plan) {
      toast.error("Invalid plan selected");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId: selectedPlanId,
          billingCycle,
          promoCode: promoCode || undefined,
          metadata: {
            plan_name: selectedPlanId,
            billing_method: 'subscription',
            billing_cycle: billingCycle,
            source: 'home_pricing',
            checkout_session_id: Date.now().toString(),
            requires_account_creation: user ? 'false' : 'true',
            is_free_trial: selectedPlanId === 'pilot' ? 'true' : 'false',
          }
        }
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL returned');

      window.location.href = data.url;
    } catch (err) {
      console.error('[HOME PRICING] Checkout error:', err);
      toast.error("Checkout Error", { description: "Failed to create checkout session." });
    } finally {
      setDialogOpen(false);
      setSelectedPlanId(null);
      setPromoCode("");
      setBillingCycle(BillingCycle.MONTHLY);
    }
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-firegauge-charcoal mb-4">
            Choose Your FireGauge Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional fire equipment management solutions designed for departments of every size
          </p>
          
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
          {plans.map((plan) => (
            <div
              key={plan.id}
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
                    {plan.price}
                  </span>
                  {plan.priceNote && (
                    <span className="text-gray-500 ml-1">
                      {plan.priceNote}
                    </span>
                  )}
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

              <Button
                className={`w-full ${
                  plan.recommended 
                    ? 'bg-firegauge-red hover:bg-firegauge-red/90' 
                    : 'bg-firegauge-charcoal hover:bg-firegauge-charcoal/90'
                }`}
                onClick={() => handlePlanSelect(plan)}
                disabled={isLoading === plan.id}
              >
                {isLoading === plan.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {plan.ctaText}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            Need help choosing? <a href="mailto:sales@firegauge.app" className="text-firegauge-red hover:underline">Contact our team</a>
          </p>
        </div>
      </div>

      {/* Inline billing dialog */}
      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Select billing options"
        submitText="Continue to Checkout"
        onSubmit={async (e) => { e.preventDefault(); await startCheckout(); }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Billing cycle</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setBillingCycle(BillingCycle.MONTHLY)}
                className={`p-3 rounded-lg border-2 transition-all ${billingCycle === BillingCycle.MONTHLY ? 'border-firegauge-red bg-red-50 text-firegauge-red' : 'border-gray-200 hover:border-gray-300'}`}>Monthly</button>
              <button type="button" onClick={() => setBillingCycle(BillingCycle.ANNUAL)}
                className={`p-3 rounded-lg border-2 transition-all ${billingCycle === BillingCycle.ANNUAL ? 'border-firegauge-red bg-red-50 text-firegauge-red' : 'border-gray-200 hover:border-gray-300'}`}>Annual</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Promo code (optional)</label>
            <input value={promoCode} onChange={(e) => setPromoCode(e.target.value.trim())} placeholder="Enter promo code" className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-firegauge-red" />
          </div>
        </div>
      </FormDialog>
    </section>
  );
};

export default Pricing;

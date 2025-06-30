import React, { useState } from 'react';
import { Check, Loader2, Calculator, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { 
  getAllPlans, 
  getStripePriceId, 
  planSupportsInvoice,
  planSupportsAnnual,
  BillingMethod, 
  BillingCycle,
  type FireGaugePlan 
} from '@/config/stripe-config';
import { processBilling, type CheckoutResponse, type InvoiceResponse } from '@/api/billing';

// Declare gtag for analytics
declare global {
  function gtag(...args: any[]): void;
}

const Pricing = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(BillingCycle.MONTHLY);
  const navigate = useNavigate();
  const { user } = useAuth();

  const plans = getAllPlans();

  const handleSubscribe = async (plan: FireGaugePlan, method: BillingMethod = BillingMethod.SUBSCRIPTION) => {
    // Handle enterprise plan separately
    if (plan.isEnterprise) {
      window.open('mailto:firegaugellc@gmail.com?subject=Enterprise Plan Inquiry', '_blank');
      return;
    }

    // For free trial, always go to onboarding
    if (plan.id === 'pilot') {
      navigate(`/onboarding?plan=${plan.id}`);
      return;
    }

    // Check if plan supports the selected billing method
    if (method === BillingMethod.INVOICE && !planSupportsInvoice(plan.id)) {
      toast.error('Invoice billing not available', {
        description: 'This plan does not support invoice billing. Please use subscription billing.'
      });
      return;
    }

    // Check if plan supports annual billing if selected
    if (billingCycle === BillingCycle.ANNUAL && !planSupportsAnnual(plan.id)) {
      toast.error('Annual billing not available', {
        description: 'This plan does not support annual billing. Please select monthly billing.'
      });
      return;
    }

    // Get the appropriate price ID
    const priceId = getStripePriceId(plan.id, method, billingCycle);
    if (!priceId) {
      toast.error('Pricing configuration error', {
        description: 'Unable to find pricing for the selected options. Please try again or contact support.'
      });
      return;
    }

    const loadingKey = `${plan.id}-${method}-${billingCycle}`;
    setIsLoading(loadingKey);

    try {
      console.log(`[PRICING] Starting ${method} billing for ${plan.name} (${billingCycle})`);
      
      // Analytics tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', 'begin_checkout', {
          currency: 'USD',
          value: parseFloat(plan.displayPrice.replace('$', '') || '0'),
          items: [{
            item_id: priceId,
            item_name: plan.name,
            category: method,
            quantity: 1
          }]
        });
      }

      if (method === BillingMethod.SUBSCRIPTION) {
        // Handle subscription checkout
        const result = await processBilling({
          planId: plan.id,
          method,
          cycle: billingCycle,
          priceId,
        }) as CheckoutResponse;

        console.log(`[PRICING] Redirecting to Stripe checkout:`, result.url);
        window.location.href = result.url;
        
      } else if (method === BillingMethod.INVOICE) {
        // For invoice, redirect to onboarding with billing method info
        const searchParams = new URLSearchParams({
          plan: plan.id,
          billing_method: method,
          billing_cycle: billingCycle,
          price_id: priceId
        });
        navigate(`/onboarding?${searchParams.toString()}`);
      }
      
    } catch (error) {
      console.error(`[PRICING] ${method} error:`, error);
      toast.error(`Failed to start ${method} process`, {
        description: error instanceof Error ? error.message : 'Please try again or contact support'
      });
    } finally {
      setIsLoading(null);
    }
  };

  const formatPrice = (plan: FireGaugePlan) => {
    if (plan.displayPrice === 'Free' || plan.displayPrice === 'Custom') {
      return plan.displayPrice;
    }

    if (billingCycle === BillingCycle.ANNUAL && plan.annualSavings) {
      return plan.annualSavings.split(' ')[0]; // Extract price part before savings text
    }

    return plan.displayPrice;
  };

  const formatPriceAnnotation = (plan: FireGaugePlan) => {
    if (plan.displayPrice === 'Free') {
      return plan.description.includes('90') ? '90-day trial' : '';
    }
    if (plan.displayPrice === 'Custom') {
      return '';
    }

    if (billingCycle === BillingCycle.ANNUAL) {
      return '/yr';
    }

    return '/mo';
  };

  const getSavingsText = (plan: FireGaugePlan) => {
    if (billingCycle === BillingCycle.ANNUAL && plan.annualSavings) {
      const savingsMatch = plan.annualSavings.match(/\(([^)]+)\)/);
      return savingsMatch ? savingsMatch[1] : '';
    }
    return '';
  };

  const isButtonLoading = (plan: FireGaugePlan, method: BillingMethod) => {
    const loadingKey = `${plan.id}-${method}-${billingCycle}`;
    return isLoading === loadingKey;
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
          
          {/* Billing Cycle Toggle */}
          <div className="flex justify-center mt-8">
            <div className="bg-white rounded-lg p-1 shadow-sm border">
              <button
                onClick={() => setBillingCycle(BillingCycle.MONTHLY)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === BillingCycle.MONTHLY
                    ? 'bg-firegauge-red text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle(BillingCycle.ANNUAL)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === BillingCycle.ANNUAL
                    ? 'bg-firegauge-red text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annual
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                  Save up to 15%
                </Badge>
              </button>
            </div>
          </div>
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
                    {formatPrice(plan)}
                  </span>
                  <span className="text-gray-500 ml-1">
                    {formatPriceAnnotation(plan)}
                  </span>
                  {getSavingsText(plan) && (
                    <div className="text-sm text-green-600 font-medium mt-1">
                      {getSavingsText(plan)}
                    </div>
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
                <div className="text-center py-1 bg-blue-50 rounded text-blue-800 font-medium">
                  {plan.coreModules}
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                {/* Primary CTA - Subscription */}
                <Button
                  onClick={() => handleSubscribe(plan, BillingMethod.SUBSCRIPTION)}
                  disabled={isButtonLoading(plan, BillingMethod.SUBSCRIPTION)}
                  className={`w-full ${
                    plan.recommended 
                      ? 'bg-firegauge-red hover:bg-firegauge-red/90' 
                      : 'bg-firegauge-charcoal hover:bg-firegauge-charcoal/90'
                  }`}
                >
                  {isButtonLoading(plan, BillingMethod.SUBSCRIPTION) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <CreditCard className="mr-2 h-4 w-4" />
                  {plan.ctaText}
                </Button>

                {/* Secondary CTA - Invoice (if supported) */}
                {planSupportsInvoice(plan.id) && (
                  <Button
                    onClick={() => handleSubscribe(plan, BillingMethod.INVOICE)}
                    disabled={isButtonLoading(plan, BillingMethod.INVOICE)}
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {isButtonLoading(plan, BillingMethod.INVOICE) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Calculator className="mr-2 h-4 w-4" />
                    Request Quote
                  </Button>
                )}
              </div>

              {/* Billing cycle note for plans that don't support annual */}
              {billingCycle === BillingCycle.ANNUAL && !planSupportsAnnual(plan.id) && (
                <p className="text-xs text-amber-600 mt-2 text-center">
                  Annual billing not available for this plan
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            All plans include NFPA 1851, 1852, 1855 compliance • 99.9% uptime guarantee • Email support
          </p>
          <p className="text-sm text-gray-500">
            Need help choosing? <a href="mailto:firegaugellc@gmail.com" className="text-firegauge-red hover:underline">Contact our team</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;

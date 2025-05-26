
import React, { useEffect, useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Info, AlertCircle, Loader2, Check } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { useSubscription } from '@/components/hooks/useSubscription';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Updated PLAN_DETAILS mapping with your actual Stripe price IDs
const PLAN_DETAILS: { [key: string]: { name: string; monthlyPriceId: string; annualPriceId?: string; features: string[], priceDisplay: string } } = {
  "price_1RSqV400HE2ZS1pmK1uKuTCe": { name: "Pilot 90", monthlyPriceId: "price_1RSqV400HE2ZS1pmK1uKuTCe", priceDisplay: "Free", features: ["Up to 100 assets", "1 Admin + 1 Inspector"] },
  "price_1RSqVe00HE2ZS1pmDEo9KWsH": { name: "Essential", monthlyPriceId: "price_1RSqVe00HE2ZS1pmDEo9KWsH", annualPriceId: "price_1RSqW500HE2ZS1pmn2qPRJ16", priceDisplay: "$39/mo", features: ["Up to 300 assets", "1 Admin + 2 Inspectors"] },
  "price_1RSqW500HE2ZS1pmn2qPRJ16": { name: "Essential (Annual)", monthlyPriceId: "price_1RSqVe00HE2ZS1pmDEo9KWsH", annualPriceId: "price_1RSqW500HE2ZS1pmn2qPRJ16", priceDisplay: "$399/yr", features: ["Up to 300 assets", "1 Admin + 2 Inspectors"] },
  "price_1RSqWZ00HE2ZS1pmcp0iWhqg": { name: "Pro", monthlyPriceId: "price_1RSqWZ00HE2ZS1pmcp0iWhqg", annualPriceId: "price_1RSqWs00HE2ZS1pmkDdtxYdV", priceDisplay: "$99/mo", features: ["Up to 1,500 assets", "3 Admins + 5 Inspectors"] },
  "price_1RSqWs00HE2ZS1pmkDdtxYdV": { name: "Pro (Annual)", monthlyPriceId: "price_1RSqWZ00HE2ZS1pmcp0iWhqg", annualPriceId: "price_1RSqWs00HE2ZS1pmkDdtxYdV", priceDisplay: "$999/yr", features: ["Up to 1,500 assets", "3 Admins + 5 Inspectors"] },
  "price_1RSqXb00HE2ZS1pmNY4PlTA5": { name: "Contractor", monthlyPriceId: "price_1RSqXb00HE2ZS1pmNY4PlTA5", annualPriceId: "price_1RSqY000HE2ZS1pmKSzq7p3i", priceDisplay: "$279/mo", features: ["Unlimited assets", "Unlimited users"] },
  "price_1RSqY000HE2ZS1pmKSzq7p3i": { name: "Contractor (Annual)", monthlyPriceId: "price_1RSqXb00HE2ZS1pmNY4PlTA5", annualPriceId: "price_1RSqY000HE2ZS1pmKSzq7p3i", priceDisplay: "$2,999/yr", features: ["Unlimited assets", "Unlimited users"] },
  "price_1RSqYn00HE2ZS1pmrIORlH1Q": { name: "Enterprise", monthlyPriceId: "price_1RSqYn00HE2ZS1pmrIORlH1Q", priceDisplay: "Custom", features: ["Everything in Contractor", "SSO/LDAP"] },
};

const Billing = () => {
  const [isPlanChangeLoading, setIsPlanChangeLoading] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { 
    subscribed, 
    subscription_tier,
    subscription_end, 
    isLoading, 
    error, 
    checkSubscription, 
    createCheckoutSession,
    openCustomerPortal
  } = useSubscription();

  const activePlanDetails = subscription_tier ? PLAN_DETAILS[subscription_tier] : null;

  const currentPlan = {
    name: activePlanDetails?.name || "No Plan",
    status: subscribed ? "Active" : "Inactive",
    billingPeriod: activePlanDetails?.annualPriceId === subscription_tier ? "Annually" : "Monthly",
    price: activePlanDetails?.priceDisplay || "$0",
    nextBillingDate: subscription_end ? new Date(subscription_end).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : "Not applicable",
  };

  useEffect(() => {
    if (!isLoading && error) {
      toast.error("Failed to load subscription data", {
        description: "Please try refreshing the page."
      });
    }
  }, [isLoading, error]);

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      toast.success("Subscription successful!", {
        description: "Your subscription has been processed successfully."
      });
      checkSubscription();
    } else if (canceled === 'true') {
      toast.info("Subscription canceled", {
        description: "You've canceled the subscription process."
      });
    }
  }, [searchParams, checkSubscription]);

  const handlePlanAction = async (priceId: string, planName?: string) => {
    setIsPlanChangeLoading(priceId);
    
    if (priceId === "price_1RSqYn00HE2ZS1pmrIORlH1Q") {
      window.location.href = "mailto:sales@firegauge.app?subject=Enterprise%20Plan%20Inquiry";
      setIsPlanChangeLoading(null);
      return;
    }

    try {
      const checkoutUrl = await createCheckoutSession(priceId);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error("Could not initiate plan change.", { description: "Please try again or contact support."} );
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred.", { description: error.message });
    } finally {
      setIsPlanChangeLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    const portalUrl = await openCustomerPortal();
    if (portalUrl) {
      window.location.href = portalUrl;
    }
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      
      if (data.session) {
        checkSubscription();
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [checkSubscription]);

  if (isAuthenticated === false) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <DashboardHeader />
          
          <div className="flex flex-1 overflow-hidden">
            <DashboardSidebar />
            
            <main className="flex-1 overflow-y-auto p-6">
              <div className="container mx-auto max-w-6xl flex flex-col items-center justify-center h-full">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle className="text-xl">Authentication Required</CardTitle>
                    <CardDescription>
                      Please sign in to access the billing page.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button 
                      className="w-full bg-firegauge-red hover:bg-firegauge-red/90" 
                      onClick={() => window.location.href = '/auth'}
                    >
                      Sign In
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <DashboardHeader />
        
        <div className="flex flex-1 overflow-hidden">
          <DashboardSidebar />
          
          <main className="flex-1 overflow-y-auto p-6">
            <div className="container mx-auto max-w-6xl">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-firegauge-charcoal">Billing & Subscription</h1>
                
                {isLoading ? (
                  <Button disabled variant="outline" className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </Button>
                ) : (
                  <Button onClick={checkSubscription} variant="outline" className="flex items-center">
                    <Info className="mr-2 h-4 w-4" />
                    Refresh Status
                  </Button>
                )}
              </div>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">Subscription Overview</TabsTrigger>
                  <TabsTrigger value="plans">Change Plan</TabsTrigger>
                  <TabsTrigger value="payment">Payment & Billing</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  <Card className={`border-2 ${subscribed ? 'border-firegauge-accent' : 'border-gray-300'}`}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-2xl flex items-center">
                            {currentPlan.name} Plan
                            <Badge className={`ml-2 ${subscribed ? 'bg-green-500' : 'bg-gray-500'}`}>
                              {currentPlan.status}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {subscribed ? `Billed ${currentPlan.billingPeriod}` : 'No active subscription'}
                          </CardDescription>
                        </div>
                        {subscribed && (
                          <div className="text-right">
                            <div className="text-3xl font-bold">
                              {currentPlan.price}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {subscribed ? (
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">Plan Features</div>
                            <div className="font-medium">
                              {activePlanDetails?.features.join(", ") || "See plan details"}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">Next Billing Date</div>
                            <div className="font-medium">{currentPlan.nextBillingDate}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-6">
                          <div className="text-center">
                            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
                            <p className="text-gray-500 mb-6">
                              Select a plan to get started with FireGauge.
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      {subscribed ? (
                        <Button 
                          className="bg-firegauge-charcoal hover:bg-firegauge-charcoal/90"
                          onClick={handleManageSubscription}
                        >
                          Manage in Stripe Portal
                        </Button>
                      ) : (
                        <Button 
                          className="bg-firegauge-red hover:bg-firegauge-red/90 w-full"
                          onClick={() => window.location.href = '/pricing'}
                        >
                          Choose a Plan
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                  
                  {subscribed && activePlanDetails && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Plan Features</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          {activePlanDetails.features.map((feature, i) => (
                            <div key={i} className="flex items-center">
                              <Check className="h-5 w-5 text-firegauge-red mr-2" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="plans" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { name: "Essential", monthlyPriceId: "price_1RSqVe00HE2ZS1pmDEo9KWsH", priceDisplay: "$39/mo", features: ["Up to 300 assets", "1 Admin + 2 Inspectors"] },
                      { name: "Pro", monthlyPriceId: "price_1RSqWZ00HE2ZS1pmcp0iWhqg", priceDisplay: "$99/mo", features: ["Up to 1,500 assets", "3 Admins + 5 Inspectors"], recommended: true },
                      { name: "Contractor", monthlyPriceId: "price_1RSqXb00HE2ZS1pmNY4PlTA5", priceDisplay: "$279/mo", features: ["Unlimited assets", "Unlimited users"] },
                    ].map((plan) => (
                      <Card key={plan.name} className={`flex flex-col ${plan.recommended ? 'border-2 border-firegauge-accent shadow-lg' : 'border'}`}>
                        {plan.recommended && (
                            <div className="bg-firegauge-accent text-white text-center py-1 font-medium text-sm">
                            RECOMMENDED
                            </div>
                        )}
                        <CardHeader>
                          <CardTitle>{plan.name}</CardTitle>
                          <div className="mt-2">
                            <span className="text-3xl font-bold">{plan.priceDisplay.split('/')[0]}</span>
                            <span className="text-base font-normal text-gray-500">/mo</span>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <ul className="space-y-1">
                            {plan.features.map((feature, i) => (
                              <li key={i} className="flex items-start text-sm">
                                <Check className="h-4 w-4 text-firegauge-red mr-2 mt-0.5 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            className={`w-full ${plan.recommended ? 'bg-firegauge-red hover:bg-firegauge-red/90' : 'bg-firegauge-charcoal hover:bg-firegauge-charcoal/90'}`}
                            onClick={() => handlePlanAction(plan.monthlyPriceId, plan.name)}
                            disabled={isPlanChangeLoading === plan.monthlyPriceId}
                          >
                            {isPlanChangeLoading === plan.monthlyPriceId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `Choose ${plan.name}`}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="payment">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Methods & Billing</CardTitle>
                      <CardDescription>
                        Manage your payment methods and billing information through Stripe
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {subscribed ? (
                        <div className="space-y-4">
                          <p className="text-gray-600">
                            Use the Stripe Customer Portal to update your payment methods, view invoices, and manage your billing information.
                          </p>
                          <Button 
                            className="bg-firegauge-charcoal hover:bg-firegauge-charcoal/90"
                            onClick={handleManageSubscription}
                          >
                            Open Stripe Portal
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-6">
                          <div className="text-center">
                            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Payment Methods</h3>
                            <p className="text-gray-500 mb-6">
                              Subscribe to a plan to add payment methods.
                            </p>
                            <Button 
                              className="bg-firegauge-red hover:bg-firegauge-red/90"
                              onClick={() => window.location.href = '/pricing'}
                            >
                              Choose a Plan
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Billing;

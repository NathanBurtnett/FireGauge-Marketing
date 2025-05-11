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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Define a mapping from Price ID to a user-friendly plan name and its properties
// This should ideally match the structure in Pricing.tsx or be sourced from a shared config
// For now, we'll manually define a simplified version here.
// IMPORTANT: Keep these Price IDs consistent with your Stripe setup and Pricing.tsx
const PLAN_DETAILS: { [key: string]: { name: string; monthlyPriceId: string; annualPriceId?: string; features: string[], priceDisplay: string } } = {
  // Basic Plan
  "price_1RNJhVP1sYOfvCvLsAvRxcqb": { name: "Basic", monthlyPriceId: "price_1RNJhVP1sYOfvCvLsAvRxcqb", annualPriceId: "price_1RNJqcP1sYOfvCvLEoaumdgs", priceDisplay: "$75/mo", features: ["Offline PWA or Mobile App", "PDF Reports"] },
  "price_1RNJqcP1sYOfvCvLEoaumdgs": { name: "Basic (Annual)", monthlyPriceId: "price_1RNJhVP1sYOfvCvLsAvRxcqb", annualPriceId: "price_1RNJqcP1sYOfvCvLEoaumdgs", priceDisplay: "$765/yr", features: ["Offline PWA or Mobile App", "PDF Reports"] },
  // Standard Plan
  "price_1RNJrPP1sYOfvCvLdRBmGLrt": { name: "Standard", monthlyPriceId: "price_1RNJrPP1sYOfvCvLdRBmGLrt", annualPriceId: "price_1RNJrdP1sYOfvCvLmOcwLZes", priceDisplay: "$150/mo", features: ["Everything in Basic", "Audit Logs"] },
  "price_1RNJrdP1sYOfvCvLmOcwLZes": { name: "Standard (Annual)", monthlyPriceId: "price_1RNJrPP1sYOfvCvLdRBmGLrt", annualPriceId: "price_1RNJrdP1sYOfvCvLmOcwLZes", priceDisplay: "$1530/yr", features: ["Everything in Basic", "Audit Logs"] },
  // Professional Plan
  "price_1RNJryP1sYOfvCvLSMsb5zqQ": { name: "Professional", monthlyPriceId: "price_1RNJryP1sYOfvCvLSMsb5zqQ", annualPriceId: "price_1RNJsAP1sYOfvCvL4sOrMFAT", priceDisplay: "$250/mo", features: ["Everything in Standard", "API Access"] },
  "price_1RNJsAP1sYOfvCvL4sOrMFAT": { name: "Professional (Annual)", monthlyPriceId: "price_1RNJryP1sYOfvCvLSMsb5zqQ", annualPriceId: "price_1RNJsAP1sYOfvCvL4sOrMFAT", priceDisplay: "$2550/yr", features: ["Everything in Standard", "API Access"] },
  // Enterprise (has a Price ID for contact, but not typical self-serve)
  "price_1RNJsvP1sYOfvCvLpPjx4t8n": { name: "Enterprise", monthlyPriceId: "price_1RNJsvP1sYOfvCvLpPjx4t8n", priceDisplay: "Custom", features: ["Everything in Professional", "SSO/LDAP"] },
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
  
  const invoices = [
    { id: "INV-001", date: "Apr 15, 2025", amount: "$200.00", status: "Paid" },
    { id: "INV-002", date: "Mar 15, 2025", amount: "$200.00", status: "Paid" },
    { id: "INV-003", date: "Feb 15, 2025", amount: "$50.00", status: "Paid" },
    { id: "INV-004", date: "Jan 15, 2025", amount: "$50.00", status: "Paid" },
  ];

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
      // Refresh subscription status
      checkSubscription();
    } else if (canceled === 'true') {
      toast.info("Subscription canceled", {
        description: "You've canceled the subscription process."
      });
    }
  }, [searchParams, checkSubscription]);

  const handlePlanAction = async (priceId: string, planName?: string) => {
    setIsPlanChangeLoading(priceId);
    
    if (priceId === "price_1RNJsvP1sYOfvCvLpPjx4t8n") {
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

  // Check if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      
      // Only check subscription if the user is authenticated
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
                      onClick={() => window.location.href = '/login'}
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
                  <TabsTrigger value="payment">Payment Methods</TabsTrigger>
                  <TabsTrigger value="history">Billing History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  {/* Current Plan */}
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
                              <span className="text-sm font-normal text-gray-500">/month</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {currentPlan.name === "Growth" ? "During In-Season" : "Not applicable"}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {subscribed ? (
                        <div className="grid gap-6 md:grid-cols-3">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">Stations</div>
                            <div className="font-medium">
                              {activePlanDetails?.features.length === 2 ? "1-5 stations" :
                               activePlanDetails?.features.length === 5 ? "6-15 stations" :
                               activePlanDetails?.features.length === 6 ? "16+ stations" : "N/A"}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">Team Members</div>
                            <div className="font-medium">
                              {activePlanDetails?.features.length === 2 ? "2 members" :
                               activePlanDetails?.features.length === 5 ? "5 members" :
                               activePlanDetails?.features.length === 6 ? "Unlimited" : "N/A"}
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
                              Select a plan below to subscribe and access all features.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {subscribed && (
                        <div className="mt-6 pt-6 border-t">
                          <div className="flex justify-between items-center">
                            <div className="space-y-1">
                              <div className="font-medium">Season-Smart Pricing</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Automatically adjusts between seasons
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <div className={`px-3 py-1 rounded text-sm ${activePlanDetails?.annualPriceId === subscription_tier ? 'bg-firegauge-red/10 text-firegauge-red' : 'bg-gray-100'}`}>
                                  {activePlanDetails?.name} Plan
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      {subscribed ? (
                        <>
                          <Button 
                            className="bg-firegauge-charcoal hover:bg-firegauge-charcoal/90"
                            onClick={handleManageSubscription}
                          >
                            Manage Subscription (Portal)
                          </Button>
                        </>
                      ) : (
                        <Button 
                          className="bg-firegauge-red hover:bg-firegauge-red/90 w-full"
                          onClick={() => window.location.href = '/pricing'}
                        >
                          Subscribe Now
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                  
                  {/* Plan comparison */}
                  {!subscribed && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold mb-4 text-center">Choose Your Plan</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { name: "Basic", monthlyPriceId: "price_1RNJhVP1sYOfvCvLsAvRxcqb", priceDisplay: "$75/mo", features: ["Up to 75 hoses", "PDF Reports"] },
                          { name: "Standard", monthlyPriceId: "price_1RNJrPP1sYOfvCvLdRBmGLrt", priceDisplay: "$150/mo", features: ["Up to 500 hoses", "Audit Logs"], recommended: true },
                          { name: "Professional", monthlyPriceId: "price_1RNJryP1sYOfvCvLSMsb5zqQ", priceDisplay: "$250/mo", features: ["Up to 2000 hoses", "API Access"] },
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
                    </div>
                  )}
                  
                  {/* Plan Features */}
                  {subscribed && activePlanDetails && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Plan Features</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          {activePlanDetails.features.map((feature, i) => (
                            <div key={i} className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-firegauge-red mr-2"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="payment" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Methods</CardTitle>
                      <CardDescription>
                        Manage your payment methods and billing preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {subscribed ? (
                        <div className="space-y-4">
                          <div className="border rounded-lg p-4 flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-10 h-6 bg-blue-600 rounded mr-3 flex items-center justify-center text-white font-bold text-xs">
                                VISA
                              </div>
                              <div>
                                <p className="font-medium">Visa ending in 4242</p>
                                <p className="text-sm text-gray-500">Expires 12/2025</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge>Default</Badge>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleManageSubscription}
                              >
                                Edit
                              </Button>
                            </div>
                          </div>
                          
                          <Button 
                            className="mt-4"
                            variant="outline"
                            onClick={handleManageSubscription}
                          >
                            Manage Payment Methods
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
                              Subscribe Now
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Billing Information</CardTitle>
                      <CardDescription>
                        Your billing address for invoices
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {subscribed ? (
                        <div className="space-y-4">
                          <div>
                            <p className="font-medium">FireGauge Testing Co.</p>
                            <p>123 Main Street, Suite 100</p>
                            <p>San Francisco, CA 94103</p>
                            <p>United States</p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={handleManageSubscription}
                          >
                            Edit Billing Information
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-6">
                          <div className="text-center">
                            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Billing Information</h3>
                            <p className="text-gray-500 mb-6">
                              Subscribe to a plan to add billing information.
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="history">
                  <Card>
                    <CardHeader>
                      <CardTitle>Invoice History</CardTitle>
                      <CardDescription>
                        Your recent invoices and payment history
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {subscribed ? (
                        <div className="rounded-md border">
                          <div className="grid grid-cols-5 font-medium p-4 border-b bg-gray-50">
                            <div>Invoice</div>
                            <div>Date</div>
                            <div>Amount</div>
                            <div>Status</div>
                            <div className="text-right">Actions</div>
                          </div>
                          {invoices.map((invoice, i) => (
                            <div key={i} className="grid grid-cols-5 p-4 border-b last:border-0 items-center">
                              <div>{invoice.id}</div>
                              <div>{invoice.date}</div>
                              <div>{invoice.amount}</div>
                              <div>
                                <Badge variant={invoice.status === "Paid" ? "secondary" : "default"}>
                                  {invoice.status}
                                </Badge>
                              </div>
                              <div className="text-right">
                                <Button variant="ghost" size="sm">Download PDF</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-6">
                          <div className="text-center">
                            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Invoice History</h3>
                            <p className="text-gray-500 mb-6">
                              Subscribe to a plan to generate invoices.
                            </p>
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

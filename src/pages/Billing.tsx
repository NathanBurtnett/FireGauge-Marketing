
import React, { useEffect, useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Info, AlertCircle, Loader2 } from "lucide-react";
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
} from "@/components/ui/dialog";
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Billing = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isSeasonSwitchLoading, setIsSeasonSwitchLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { 
    subscribed, 
    subscription_tier, 
    season_status,
    subscription_end, 
    isLoading, 
    error, 
    checkSubscription, 
    createCheckoutSession,
    openCustomerPortal
  } = useSubscription();

  const currentPlan = {
    name: subscription_tier || "No Plan",
    status: subscribed ? "Active" : "Inactive",
    billingPeriod: "Monthly",
    price: season_status === "in-season" ? 
      (subscription_tier === "Growth" ? "$200" : 
       subscription_tier === "Scale" ? "$300" : 
       subscription_tier === "Starter" ? "$99" : "$0") :
      "$50",
    nextBillingDate: subscription_end ? new Date(subscription_end).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : "Not applicable",
    season: season_status === "in-season" ? "In-Season" : "Off-Season"
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

  const handleSubscribe = async (plan: string) => {
    setDialogOpen(true);
    setSelectedPlan(plan);
  };

  const handleConfirmSubscribe = async (seasonStatus: "in-season" | "off-season") => {
    if (!selectedPlan) return;
    
    const checkoutUrl = await createCheckoutSession(selectedPlan, seasonStatus);
    setDialogOpen(false);
    
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
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
                              During {currentPlan.season}
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
                              {subscription_tier === "Starter" ? "1-5 stations" :
                               subscription_tier === "Growth" ? "6-15 stations" :
                               subscription_tier === "Scale" ? "16+ stations" : "N/A"}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">Team Members</div>
                            <div className="font-medium">
                              {subscription_tier === "Starter" ? "2 members" :
                               subscription_tier === "Growth" ? "5 members" :
                               subscription_tier === "Scale" ? "Unlimited" : "N/A"}
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
                                <div className={`px-3 py-1 rounded text-sm ${season_status === 'in-season' ? 'bg-firegauge-red/10 text-firegauge-red' : 'bg-gray-100'}`}>
                                  In-Season: ${subscription_tier === "Growth" ? "200" : subscription_tier === "Scale" ? "300" : "99"}/mo
                                </div>
                                <div className={`px-3 py-1 rounded text-sm ${season_status === 'off-season' ? 'bg-firegauge-red/10 text-firegauge-red' : 'bg-gray-100'}`}>
                                  Off-Season: $50/mo
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
                          <Button variant="outline" onClick={() => handleSubscribe(subscription_tier || 'Growth')}>
                            Change Plan
                          </Button>
                          <Button 
                            className="bg-firegauge-charcoal hover:bg-firegauge-charcoal/90"
                            onClick={handleManageSubscription}
                          >
                            Manage Subscription
                          </Button>
                        </>
                      ) : (
                        <Button 
                          className="bg-firegauge-red hover:bg-firegauge-red/90 w-full"
                          onClick={() => handleSubscribe('Growth')}
                        >
                          Subscribe Now
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                  
                  {/* Plan comparison */}
                  {!subscribed && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                      {[
                        {
                          name: "Starter", 
                          inSeasonPrice: "$99",
                          offSeasonPrice: "$50",
                          stations: "1-5",
                          users: "2",
                          features: [
                            "Offline data capture",
                            "Basic NFPA reports",
                            "Email support",
                            "CSV exports",
                            "90-day data retention"
                          ]
                        },
                        {
                          name: "Growth", 
                          inSeasonPrice: "$200",
                          offSeasonPrice: "$50",
                          stations: "6-15",
                          users: "5",
                          features: [
                            "Everything in Starter",
                            "Advanced NFPA reports",
                            "Priority email support",
                            "QuickBooks integration",
                            "1-year data retention",
                            "Multi-user roles"
                          ],
                          recommended: true
                        },
                        {
                          name: "Scale", 
                          inSeasonPrice: "$300",
                          offSeasonPrice: "$50",
                          stations: "16+",
                          users: "Unlimited",
                          features: [
                            "Everything in Growth",
                            "Phone support",
                            "Jobber integration",
                            "Unlimited data storage",
                            "Custom branding",
                            "API access"
                          ]
                        },
                      ].map((plan, index) => (
                        <Card 
                          key={index}
                          className={`border ${plan.recommended ? 'border-2 border-firegauge-accent shadow-lg' : ''}`}
                        >
                          {plan.recommended && (
                            <div className="bg-firegauge-accent text-white text-center py-1 font-medium text-sm">
                              MOST POPULAR
                            </div>
                          )}
                          <CardHeader>
                            <CardTitle>{plan.name}</CardTitle>
                            <div className="mt-4">
                              <div className="text-3xl font-bold">
                                {season_status === 'in-season' ? plan.inSeasonPrice : plan.offSeasonPrice}
                                <span className="text-base font-normal text-gray-500">/mo</span>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {season_status === 'in-season' ? 'During Testing Season' : 'During Off-Season'}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <div className="text-sm text-gray-500 mb-1">Stations</div>
                                <div className="font-medium">{plan.stations}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500 mb-1">Users</div>
                                <div className="font-medium">{plan.users}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500 mb-1">Features</div>
                                <ul className="space-y-1">
                                  {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start text-sm">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-firegauge-red mr-2 flex-shrink-0"
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
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              className={`w-full ${
                                plan.recommended 
                                  ? 'bg-firegauge-red hover:bg-firegauge-red/90' 
                                  : 'bg-firegauge-charcoal hover:bg-firegauge-charcoal/90'
                              }`}
                              onClick={() => handleSubscribe(plan.name)}
                            >
                              Select {plan.name}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                  
                  {/* Plan Features */}
                  {subscribed && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Plan Features</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          {subscription_tier === "Starter" ? [
                            "Offline data capture",
                            "Basic NFPA reports",
                            "Email support",
                            "CSV exports",
                            "90-day data retention"
                          ] : subscription_tier === "Growth" ? [
                            "Everything in Starter",
                            "Advanced NFPA reports",
                            "Priority email support",
                            "QuickBooks integration",
                            "1-year data retention",
                            "Multi-user roles"
                          ] : [
                            "Everything in Growth",
                            "Phone support",
                            "Jobber integration",
                            "Unlimited data storage",
                            "Custom branding",
                            "API access"
                          ].map((feature, i) => (
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
                              onClick={() => handleSubscribe('Growth')}
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
      
      {/* Subscription Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Billing Season</DialogTitle>
            <DialogDescription>
              FireGauge offers season-smart pricing. Select the current season to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className={`flex flex-col items-center justify-center h-32 ${isSeasonSwitchLoading ? 'opacity-50' : ''}`}
              onClick={() => handleConfirmSubscribe("off-season")}
              disabled={isSeasonSwitchLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4M12 20V4"
                />
              </svg>
              <div className="font-medium">Off-Season</div>
              <div className="text-sm text-gray-500">
                $50/month
              </div>
            </Button>
            <Button
              variant="outline"
              className={`flex flex-col items-center justify-center h-32 ${isSeasonSwitchLoading ? 'opacity-50' : ''}`}
              onClick={() => handleConfirmSubscribe("in-season")}
              disabled={isSeasonSwitchLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mb-2 text-firegauge-red"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v18m9-9H3"
                />
              </svg>
              <div className="font-medium">In-Season</div>
              <div className="text-sm text-gray-500">
                {selectedPlan === "Growth" 
                  ? "$200/month" 
                  : selectedPlan === "Scale" 
                    ? "$300/month" 
                    : "$99/month"}
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Billing;

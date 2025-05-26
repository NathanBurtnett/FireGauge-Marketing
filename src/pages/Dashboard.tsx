
import React from 'react';
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Link as RouterLink } from 'react-router-dom';
import { ExternalLink, User, CreditCard, Loader2, Settings } from 'lucide-react';
import { SidebarProvider } from "../components/ui/sidebar";
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useSubscription } from '../components/hooks/useSubscription';
import { useAuth } from '../components/providers/AuthProvider';

// Updated PLAN_DETAILS mapping with your actual Stripe price IDs
const PLAN_DETAILS: { [key: string]: { name: string; priceDisplay: string } } = {
  "price_1RSqV400HE2ZS1pmK1uKuTCe": { name: "Pilot 90", priceDisplay: "Free" },
  "price_1RSqVe00HE2ZS1pmDEo9KWsH": { name: "Essential", priceDisplay: "$39/mo" },
  "price_1RSqW500HE2ZS1pmn2qPRJ16": { name: "Essential (Annual)", priceDisplay: "$399/yr" },
  "price_1RSqWZ00HE2ZS1pmcp0iWhqg": { name: "Pro", priceDisplay: "$99/mo" },
  "price_1RSqWs00HE2ZS1pmkDdtxYdV": { name: "Pro (Annual)", priceDisplay: "$999/yr" },
  "price_1RSqXb00HE2ZS1pmNY4PlTA5": { name: "Contractor", priceDisplay: "$279/mo" },
  "price_1RSqY000HE2ZS1pmKSzq7p3i": { name: "Contractor (Annual)", priceDisplay: "$2,999/yr" },
  "price_1RSqYn00HE2ZS1pmrIORlH1Q": { name: "Enterprise", priceDisplay: "Custom" },
};

const Dashboard = () => {
  console.log("Dashboard: Component rendering/re-rendering");
  const { 
    user: authUser, 
    loading: authLoading, 
    error: authContextError, 
    session 
  } = useAuth(); 
  
  const {
    subscribed,
    subscription_tier,
    subscription_end,
    isLoading: subscriptionLoading,
    error: subscriptionError,
  } = useSubscription();

  console.log("Dashboard: State from useAuth - authUser:", authUser, "session:", session, "authLoading:", authLoading, "authContextError:", authContextError);
  console.log("Dashboard: State from useSubscription - subscribed:", subscribed, "subscription_tier:", subscription_tier, "subscription_end:", subscription_end, "subscriptionLoading:", subscriptionLoading, "subscriptionError:", subscriptionError);

  const displayUser = authUser ? {
    email: authUser.email || null,
    fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
  } : null;

  const isLoading = authLoading || subscriptionLoading;
  const displayError = authContextError?.message || subscriptionError;

  console.log("Dashboard: Calculated states - displayUser:", displayUser, "isLoading:", isLoading, "displayError:", displayError);

  const currentPlanName = subscription_tier && PLAN_DETAILS[subscription_tier]?.name 
                          ? PLAN_DETAILS[subscription_tier].name 
                          : (subscribed ? "Active Plan" : "No Plan");
                          
  const nextBillingDateFormatted = subscription_end 
    ? new Date(subscription_end).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : subscribed ? "See portal" : "N/A";

  if (isLoading) {
    console.log("Dashboard: Rendering Loading State");
    return (
      <SidebarProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <DashboardHeader />
          <div className="flex flex-1 overflow-hidden">
            <DashboardSidebar />
            <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-firegauge-red mr-3" />
              <p className="text-xl text-gray-700">Loading dashboard...</p>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (displayError) {
    console.log("Dashboard: Rendering DisplayError State:", displayError);
    return (
      <SidebarProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <DashboardHeader />
          <div className="flex flex-1 overflow-hidden">
            <DashboardSidebar />
            <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
              <p className="text-xl text-red-600">Error: {displayError}</p>
              <p className="text-gray-600 mt-2">Could not load your dashboard. Please try again later or contact support.</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                  Refresh Page
              </Button>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }
  
  if (!displayUser) { 
    console.log("Dashboard: Rendering No DisplayUser State (prompt to login)");
    return (
      <SidebarProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <DashboardHeader />
          <div className="flex flex-1 overflow-hidden">
            <DashboardSidebar />
            <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
              <p className="text-xl text-gray-700">Please log in to view your dashboard.</p>
              <Button variant="default" className="mt-4 bg-firegauge-red hover:bg-firegauge-red-dark" asChild>
                <RouterLink to="/auth">Login / Sign Up</RouterLink>
              </Button>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  console.log("Dashboard: Rendering Main Dashboard Content for user:", displayUser.fullName);
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <DashboardHeader />
        
        <div className="flex flex-1 overflow-hidden">
          <DashboardSidebar />
          
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Welcome to FireGauge, {displayUser.fullName}!</h1>
                <p className="text-gray-600">Manage your subscription and account settings.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 md:col-span-2 lg:col-span-3 bg-firegauge-red text-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center">
                      <ExternalLink className="mr-3 h-7 w-7" /> Access Your FireGauge App
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-gray-100">
                      Ready to start testing? Access your full FireGauge application for equipment testing, reporting, and compliance management.
                    </p>
                    <Button 
                      size="lg"
                      className="bg-white text-firegauge-red hover:bg-gray-100 font-semibold py-3 px-6"
                      onClick={() => window.open('https://app.firegauge.app', '_blank')} 
                    >
                      Go to app.firegauge.app
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl text-firegauge-charcoal">
                      <Settings className="mr-2 h-5 w-5" /> Current Subscription
                    </CardTitle>
                    <CardDescription>Your plan and billing details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Current Plan</p>
                        <p className="font-semibold text-lg">{currentPlanName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className={`font-medium ${subscribed ? 'text-green-600' : 'text-gray-500'}`}>
                          {subscribed ? 'Active' : 'No Active Subscription'}
                        </p>
                      </div>
                      {subscribed && subscription_end && (
                        <div>
                          <p className="text-sm text-gray-500">Next Billing</p>
                          <p className="font-medium">{nextBillingDateFormatted}</p>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" className="mt-4 w-full" asChild>
                      <RouterLink to="/billing">Manage Subscription</RouterLink>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl text-firegauge-charcoal">
                        <User className="mr-2 h-5 w-5" /> Account Settings
                    </CardTitle>
                    <CardDescription>Profile and security settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{displayUser.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <RouterLink to="/account">Update Account</RouterLink>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl text-firegauge-charcoal">
                      <CreditCard className="mr-2 h-5 w-5" /> Billing & Invoices
                    </CardTitle>
                    <CardDescription>Payment methods and history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      View invoices, update payment methods, and manage your billing information.
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <RouterLink to="/billing">View Billing</RouterLink>
                    </Button>
                  </CardContent>
                </Card>

                {!subscribed && (
                  <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-2 border-firegauge-accent bg-gradient-to-r from-firegauge-accent/5 to-firegauge-red/5">
                    <CardHeader>
                      <CardTitle className="text-xl text-firegauge-charcoal">Get Started with FireGauge</CardTitle>
                      <CardDescription>Choose a plan to start managing your equipment testing and compliance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button className="bg-firegauge-red hover:bg-firegauge-red/90" onClick={() => window.location.href = '/pricing'}>
                          View Pricing Plans
                        </Button>
                        <Button variant="outline" onClick={() => window.location.href = 'mailto:sales@firegauge.app'}>
                          Contact Sales
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;

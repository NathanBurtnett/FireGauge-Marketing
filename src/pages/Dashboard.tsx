import React from 'react';
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Link as RouterLink } from 'react-router-dom';
import { ExternalLink, User, CreditCard, Users, Settings, Loader2 } from 'lucide-react';
import { supabase } from "../integrations/supabase/client";
import { SidebarProvider } from "../components/ui/sidebar";
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useSubscription } from '../components/hooks/useSubscription';
import { useAuth } from '../components/providers/AuthProvider';

// Re-using PLAN_DETAILS mapping, ensure consistency or centralize this
// This is a simplified version for display here.
const PLAN_DETAILS: { [key: string]: { name: string; priceDisplay: string } } = {
  "price_1RNJhVP1sYOfvCvLsAvRxcqb": { name: "Basic", priceDisplay: "$75/mo" },
  "price_1RNJqcP1sYOfvCvLEoaumdgs": { name: "Basic (Annual)", priceDisplay: "$765/yr" },
  "price_1RNJrPP1sYOfvCvLdRBmGLrt": { name: "Standard", priceDisplay: "$150/mo" },
  "price_1RNJrdP1sYOfvCvLmOcwLZes": { name: "Standard (Annual)", priceDisplay: "$1530/yr" },
  "price_1RNJryP1sYOfvCvLSMsb5zqQ": { name: "Professional", priceDisplay: "$250/mo" },
  "price_1RNJsAP1sYOfvCvL4sOrMFAT": { name: "Professional (Annual)", priceDisplay: "$2550/yr" },
  "price_1RNJsvP1sYOfvCvLpPjx4t8n": { name: "Enterprise", priceDisplay: "Custom" },
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

  const isAdmin = true;
  const isLoading = authLoading || subscriptionLoading;
  const displayError = authContextError?.message || subscriptionError;

  console.log("Dashboard: Calculated states - displayUser:", displayUser, "isLoading:", isLoading, "displayError:", displayError);

  const currentPlanName = subscription_tier && PLAN_DETAILS[subscription_tier]?.name 
                          ? PLAN_DETAILS[subscription_tier].name 
                          : (subscribed ? "Active Plan" : "N/A");
                          
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
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Welcome, {displayUser.fullName || 'User'}!</h1>
                <p className="text-gray-600">Manage your FireGauge account and services.</p>
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
                      Dive into your full FireGauge experience for equipment testing, reporting, and compliance management.
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
                      <Settings className="mr-2 h-5 w-5" /> Subscription Plan
                    </CardTitle>
                    <CardDescription>Your current plan details.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Current Plan: <span className="font-semibold">{currentPlanName}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {subscribed && subscription_end ? `Renews on: ${nextBillingDateFormatted}` : subscribed ? `Status: Active` : "No active subscription"}
                    </p>
                    <Button variant="outline" className="mt-4 w-full sm:w-auto" asChild>
                      <RouterLink to="/billing">Manage Subscription</RouterLink>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl text-firegauge-charcoal">
                        <User className="mr-2 h-5 w-5" /> Account Settings
                    </CardTitle>
                    <CardDescription>Update your profile and security.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" asChild>
                      <RouterLink to="/account">Go to Account Settings</RouterLink>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl text-firegauge-charcoal">
                      <CreditCard className="mr-2 h-5 w-5" /> Billing Details
                    </CardTitle>
                    <CardDescription>View invoices and payment methods.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" asChild>
                      <RouterLink to="/billing">Go to Billing</RouterLink>
                    </Button>
                  </CardContent>
                </Card>

                {isAdmin && (
                  <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl text-firegauge-charcoal">
                        <Users className="mr-2 h-5 w-5" /> Manage Users
                      </CardTitle>
                      <CardDescription>Invite and manage team members.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" asChild>
                        <RouterLink to="/team-management">Manage Team Users</RouterLink>
                      </Button>
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


import React from 'react';
import { Button } from "../components/ui/button";
import { Link as RouterLink } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { SidebarProvider } from "../components/ui/sidebar";
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useAuth } from '../components/providers/AuthProvider';
import { useSubscriptionData } from '../hooks/useSubscriptionData';
import SubscriptionCard from '../components/dashboard/SubscriptionCard';
import AccountCard from '../components/dashboard/AccountCard';
import BillingCard from '../components/dashboard/BillingCard';
import AppAccessCard from '../components/dashboard/AppAccessCard';
import GetStartedCard from '../components/dashboard/GetStartedCard';

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
    currentPlanName,
    nextBillingDateFormatted
  } = useSubscriptionData();

  const displayUser = authUser ? {
    email: authUser.email || null,
    fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
  } : null;

  const isLoading = authLoading || subscriptionLoading;
  const displayError = authContextError?.message || subscriptionError;

  if (isLoading) {
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
                <AppAccessCard />

                <SubscriptionCard 
                  currentPlanName={currentPlanName}
                  subscribed={subscribed}
                  nextBillingDateFormatted={nextBillingDateFormatted}
                  subscription_end={subscription_end}
                />

                <AccountCard userEmail={displayUser.email} />

                <BillingCard />

                {!subscribed && <GetStartedCard />}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;

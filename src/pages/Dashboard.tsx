import React from 'react';
import Navbar from '@/components/Navbar'; // Site-wide Navbar
import Footer from '@/components/Footer'; // Site-wide Footer
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Link as RouterLink } from 'react-router-dom'; // For navigation links
import { ExternalLink, User, CreditCard, Users, Settings } from 'lucide-react'; // Icons

// Placeholder for user data - will be fetched in a later subtask (7.2)
interface UserData {
  fullName?: string;
  email?: string;
  subscriptionPlan?: string;
  // add other relevant fields as needed
}

const Dashboard = () => {
  // Placeholder user data - replace with actual data fetching later
  const user: UserData = {
    fullName: "Jane Doe", // Example
    email: "jane.doe@example.com", // Example
    subscriptionPlan: "Standard Plan" // Example
  };

  // In a real app, this would come from user roles/permissions
  const isAdmin = true; // Placeholder

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.fullName || 'User'}!</h1>
            <p className="text-gray-600">Manage your FireGauge account and services.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Go to Main App */}
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
                  onClick={() => window.open('https://app.firegauge.app', '_blank')} // Opens in new tab
                >
                  Go to app.firegauge.app
                </Button>
              </CardContent>
            </Card>

            {/* Card 2: Subscription Details (Placeholder Content) */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-firegauge-charcoal">
                  <Settings className="mr-2 h-5 w-5" /> Subscription Plan
                </CardTitle>
                <CardDescription>Your current plan details.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Current Plan: <span className="font-semibold">{user.subscriptionPlan || 'N/A'}</span>
                </p>
                {/* Placeholder for more details like renewal date, status etc. */}
                <p className="text-sm text-gray-500 mt-2">Renews on: Dec 31, 2024 (Placeholder)</p>
                <Button variant="outline" className="mt-4 w-full sm:w-auto" asChild>
                  <RouterLink to="/billing">Manage Subscription</RouterLink>
                </Button>
              </CardContent>
            </Card>

            {/* Navigation Cards Area */}
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

            {/* User Management Card (Conditional) */}
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
                     {/* TODO: Create a /users or /team page for user management */}
                    <RouterLink to="/team-management">Manage Team Users</RouterLink>
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {/* Placeholder for Quick Stats - if desired later (Subtask 7.3) */}
            {/* 
            <Card className="lg:col-span-1">
              <CardHeader><CardTitle>Quick Stats</CardTitle></CardHeader>
              <CardContent><p>Active Stations: 5 (Placeholder)</p></CardContent>
            </Card>
            */}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;

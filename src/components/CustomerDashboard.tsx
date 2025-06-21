import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  User, 
  Settings, 
  HelpCircle, 
  BarChart3, 
  Shield, 
  ExternalLink, 
  Download,
  Bell,
  Calendar,
  Building2,
  Mail,
  Phone,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionData {
  id: string;
  planName: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  amount: number;
  currency: string;
  billing_cycle: 'month' | 'year';
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  customer_id: string;
}

interface UsageData {
  equipmentTracked: number;
  equipmentLimit: number;
  testsCompleted: number;
  usersActive: number;
  storageUsed: number; // in MB
  storageLimit: number; // in MB
}

interface CustomerInfo {
  id: string;
  email: string;
  name: string;
  department_name: string;
  department_type: string;
  phone?: string;
  created_at: string;
}

const CustomerDashboard = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);

  // Mock data for demo - in real implementation, this would come from APIs
  useEffect(() => {
    // Simulate loading customer data
    setCustomerInfo({
      id: "cust_123",
      email: "chief@cityfire.gov",
      name: "Chief John Smith",
      department_name: "City Fire Department",
      department_type: "Municipal Fire Department",
      phone: "(555) 123-4567",
      created_at: "2024-01-15T00:00:00Z"
    });

    setSubscriptionData({
      id: "sub_123",
      planName: "Professional Plan",
      status: 'active',
      amount: 299,
      currency: 'USD',
      billing_cycle: 'month',
      current_period_start: "2024-01-15T00:00:00Z",
      current_period_end: "2024-02-15T00:00:00Z",
      customer_id: "cust_123"
    });

    setUsageData({
      equipmentTracked: 147,
      equipmentLimit: 500,
      testsCompleted: 89,
      usersActive: 12,
      storageUsed: 2.1 * 1024, // 2.1 GB in MB
      storageLimit: 10 * 1024 // 10 GB in MB
    });
  }, []);

  const handleOpenBillingPortal = async () => {
    setIsLoading(true);
    try {
      // In real implementation, this would call your backend to create a Stripe billing portal session
      const response = await fetch('/api/create-billing-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: subscriptionData?.customer_id
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.open(url, '_blank');
      } else {
        // Demo fallback - open Stripe's demo billing portal
        window.open('https://billing.stripe.com/p/login/test_demo', '_blank');
        toast({
          title: "Demo Mode",
          description: "Opening demo billing portal. In production, this would be your actual billing portal.",
        });
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast({
        title: "Error",
        description: "Unable to open billing portal. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      trialing: 'secondary', 
      past_due: 'destructive',
      canceled: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  if (!customerInfo || !subscriptionData || !usageData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your FireGauge subscription and account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Account Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Contact Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{customerInfo.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{customerInfo.email}</span>
                      </div>
                      {customerInfo.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{customerInfo.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Department Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span>{customerInfo.department_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span>{customerInfo.department_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Member since {formatDate(customerInfo.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">{subscriptionData.planName}</h3>
                      {getStatusBadge(subscriptionData.status)}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">
                          ${subscriptionData.amount}/{subscriptionData.billing_cycle}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current period:</span>
                        <span>{formatDate(subscriptionData.current_period_start)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next billing date:</span>
                        <span>{formatDate(subscriptionData.current_period_end)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <Button 
                      onClick={handleOpenBillingPortal}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {isLoading ? 'Opening...' : 'Manage Billing'}
                    </Button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Update payment methods, download invoices, and change plans
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Usage Analytics
                </CardTitle>
                <CardDescription>
                  Current usage and limits for your {subscriptionData.planName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Equipment Tracked</span>
                      <span>{usageData.equipmentTracked} / {usageData.equipmentLimit}</span>
                    </div>
                    <Progress value={getUsagePercentage(usageData.equipmentTracked, usageData.equipmentLimit)} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Storage Used</span>
                      <span>{(usageData.storageUsed / 1024).toFixed(1)} GB / {usageData.storageLimit / 1024} GB</span>
                    </div>
                    <Progress value={getUsagePercentage(usageData.storageUsed, usageData.storageLimit)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{usageData.testsCompleted}</div>
                      <div className="text-sm text-gray-600">Tests Completed</div>
                      <div className="text-xs text-gray-500">This month</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{usageData.usersActive}</div>
                      <div className="text-sm text-gray-600">Active Users</div>
                      <div className="text-xs text-gray-500">In your department</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open('https://app.firegauge.app/dashboard', '_blank')}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Open FireGauge App
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Download Reports
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Notification Settings
                </Button>
              </CardContent>
            </Card>

            {/* Support Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Support Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a 
                  href="mailto:support@firegauge.app"
                  className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-sm">Email Support</div>
                  <div className="text-xs text-gray-600">support@firegauge.app</div>
                </a>
                <a 
                  href="/knowledge-base"
                  className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-sm">Knowledge Base</div>
                  <div className="text-xs text-gray-600">Guides and tutorials</div>
                </a>
                <a 
                  href="/contact"
                  className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-sm">Contact Sales</div>
                  <div className="text-xs text-gray-600">Upgrade or questions</div>
                </a>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compliance Status</span>
                    <Badge variant="default">Good Standing</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Backup</span>
                    <Badge variant="default">Up to Date</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Security Score</span>
                    <Badge variant="default">Excellent</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard; 
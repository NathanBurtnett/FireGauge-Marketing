import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Building, 
  CreditCard, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  ExternalLink,
  Shield,
  Database,
  Users,
  FileText,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

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

const CustomerDashboard: React.FC = () => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    id: '',
    email: '',
    name: '',
    department_name: '',
    department_type: '',
    created_at: '',
  });

  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    id: '',
    planName: '',
    status: 'active',
    amount: 0,
    currency: 'USD',
    billing_cycle: 'month',
    current_period_start: '',
    current_period_end: '',
    customer_id: '',
  });

  const [usageData, setUsageData] = useState<UsageData>({
    equipmentTracked: 0,
    equipmentLimit: 0,
    testsCompleted: 0,
    usersActive: 0,
    storageUsed: 0,
    storageLimit: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading - in production, this would fetch from your API
  useEffect(() => {
    const fetchCustomerData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data based on the documentation examples
      const mockCustomerInfo: CustomerInfo = {
        id: 'cust_123456',
        email: 'chief@samplefire.gov',
        name: 'Chief Johnson',
        department_name: 'Sample Fire Department',
        department_type: 'Municipal',
        phone: '(555) 123-4567',
        created_at: '2024-01-15T00:00:00Z',
      };

      const mockSubscriptionData: SubscriptionData = {
        id: 'sub_123456',
        planName: 'FireGauge Pro',
        status: 'active',
        amount: 12750, // $127.50 in cents
        currency: 'USD',
        billing_cycle: 'month',
        current_period_start: '2024-06-01T00:00:00Z',
        current_period_end: '2024-07-01T00:00:00Z',
        customer_id: 'cust_123456',
      };

      const mockUsageData: UsageData = {
        equipmentTracked: 147,
        equipmentLimit: 500,
        testsCompleted: 89,
        usersActive: 12,
        storageUsed: 2150, // 2.1 GB in MB
        storageLimit: 10240, // 10 GB in MB
      };

      setCustomerInfo(mockCustomerInfo);
      setSubscriptionData(mockSubscriptionData);
      setUsageData(mockUsageData);
      setIsLoading(false);
    };

    fetchCustomerData();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, label: 'Active', icon: CheckCircle },
      trialing: { variant: 'secondary' as const, label: 'Trial', icon: Clock },
      past_due: { variant: 'destructive' as const, label: 'Past Due', icon: AlertCircle },
      canceled: { variant: 'outline' as const, label: 'Canceled', icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100); // Convert from cents
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatStorage = (sizeInMB: number) => {
    if (sizeInMB >= 1024) {
      return `${(sizeInMB / 1024).toFixed(1)} GB`;
    }
    return `${sizeInMB} MB`;
  };

  const openBillingPortal = async () => {
    try {
      // In production, this would call your API to create a billing portal session
      const response = await fetch('/api/create-billing-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: subscriptionData.customer_id,
          return_url: window.location.href,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.open(url, '_blank');
      } else {
        // Fallback for demo purposes
        alert('Billing portal would open here. This is a demo interface.');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('Billing portal would open here. This is a demo interface.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-gray-500">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {customerInfo.name}</h1>
          <p className="text-gray-500">{customerInfo.department_name}</p>
        </div>
        <Button onClick={openBillingPortal} variant="outline">
          <CreditCard className="h-4 w-4 mr-2" />
          Manage Billing
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Contact Information</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{customerInfo.email}</span>
                    </div>
                    {customerInfo.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{customerInfo.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Department Information</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{customerInfo.department_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{customerInfo.department_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Member since {formatDate(customerInfo.created_at)}</span>
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
            <CardContent className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-semibold">{subscriptionData.planName}</h3>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(subscriptionData.amount)} per {subscriptionData.billing_cycle}
                  </p>
                </div>
                {getStatusBadge(subscriptionData.status)}
              </div>
              
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Current Billing Period</p>
                  <p className="text-sm">
                    {formatDate(subscriptionData.current_period_start)} - {formatDate(subscriptionData.current_period_end)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Next Billing Date</p>
                  <p className="text-sm">{formatDate(subscriptionData.current_period_end)}</p>
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
                Current usage for this billing period
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Equipment Tracked</span>
                    <span className="text-sm text-gray-500">
                      {usageData.equipmentTracked} / {usageData.equipmentLimit}
                    </span>
                  </div>
                  <Progress 
                    value={(usageData.equipmentTracked / usageData.equipmentLimit) * 100} 
                    className="h-2" 
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Storage Used</span>
                    <span className="text-sm text-gray-500">
                      {formatStorage(usageData.storageUsed)} / {formatStorage(usageData.storageLimit)}
                    </span>
                  </div>
                  <Progress 
                    value={(usageData.storageUsed / usageData.storageLimit) * 100} 
                    className="h-2" 
                  />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{usageData.testsCompleted}</div>
                  <div className="text-sm text-gray-500">Tests Completed</div>
                  <div className="text-xs text-gray-400">This month</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{usageData.usersActive}</div>
                  <div className="text-sm text-gray-500">Active Users</div>
                  <div className="text-xs text-gray-400">Department members</div>
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
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open FireGauge App
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Download Reports
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Notification Settings
              </Button>
            </CardContent>
          </Card>

          {/* Support Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Support Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="ghost" asChild>
                <a href="mailto:support@firegauge.app">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </a>
              </Button>
              <Button className="w-full justify-start" variant="ghost" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Knowledge Base
                </a>
              </Button>
              <Button className="w-full justify-start" variant="ghost" asChild>
                <a href="mailto:sales@firegauge.app">
                  <Users className="h-4 w-4 mr-2" />
                  Contact Sales
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Compliance Status</span>
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Backup Status</span>
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Current
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Security Status</span>
                <Badge variant="default">
                  <Shield className="h-3 w-3 mr-1" />
                  Secure
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
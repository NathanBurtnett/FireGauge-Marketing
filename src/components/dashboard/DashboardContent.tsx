import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Users, 
  Settings, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle,
  Crown,
  UserPlus,
  Calendar,
  Building
} from "lucide-react";
import { useAuth } from '@/components/providers/AuthProvider';

const DashboardContent = () => {
  const { user, tenant } = useAuth();

  // Mock subscription data - in real app this would come from Stripe/Supabase
  const subscription = {
    status: 'active',
    plan: 'Professional',
    price: '$49/month',
    currentPeriodEnd: '2025-06-10',
    cancelAtPeriodEnd: false
  };

  // Mock team members data
  const teamMembers = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john@firegauge.com',
      role: 'Admin',
      status: 'Active',
      lastLogin: '2025-05-09'
    },
    {
      id: 2, 
      name: 'Sarah Johnson',
      email: 'sarah@firegauge.com',
      role: 'User',
      status: 'Active',
      lastLogin: '2025-05-08'
    }
  ];

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      past_due: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || colors.active}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Account Dashboard</h1>
          <p className="text-gray-600">Manage your FireGauge account and subscription</p>
        </div>
        <Button 
          variant="outline"
          onClick={() => window.open('https://app.firegauge.app', '_blank')}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open FireGauge App
        </Button>
      </div>

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Subscription Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscription.plan}</div>
            <p className="text-xs text-muted-foreground">
              {subscription.price} • {getStatusBadge(subscription.status)}
            </p>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              Active users
            </p>
          </CardContent>
        </Card>

        {/* Organization */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organization</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenant?.name || 'Loading...'}</div>
            <p className="text-xs text-muted-foreground">
              Tenant ID: {tenant?.id}
            </p>
          </CardContent>
        </Card>

        {/* Next Billing */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Jun 10</div>
            <p className="text-xs text-muted-foreground">
              {subscription.price}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Subscription Management
            </CardTitle>
            <CardDescription>
              Manage your billing and subscription preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">{subscription.plan} Plan</h4>
                <p className="text-sm text-gray-600">{subscription.price}</p>
              </div>
              {getStatusBadge(subscription.status)}
            </div>
            
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                Update Payment Method
              </Button>
              <Button variant="outline" className="w-full">
                View Billing History
              </Button>
              <Button variant="outline" className="w-full">
                Change Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Team Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Management
            </CardTitle>
            <CardDescription>
              Manage team members and their access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full bg-firegauge-red hover:bg-firegauge-red/90">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Team Member
            </Button>
            
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{member.role}</Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      Last: {new Date(member.lastLogin).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks and links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => window.open('https://app.firegauge.app', '_blank')}
            >
              <ExternalLink className="h-6 w-6 mb-2" />
              Open Main App
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="h-6 w-6 mb-2" />
              Account Settings
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <AlertTriangle className="h-6 w-6 mb-2" />
              Support & Help
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Account Health
          </CardTitle>
          <CardDescription>
            Your account status and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Subscription Active</p>
                <p className="text-sm text-gray-600">Your subscription is current and active</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Payment Method Valid</p>
                <p className="text-sm text-gray-600">Your payment method is up to date</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <ExternalLink className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Ready to Use FireGauge</p>
                <p className="text-sm text-gray-600">
                  <a 
                    href="https://app.firegauge.app" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Click here to access your FireGauge application
                  </a>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardContent;

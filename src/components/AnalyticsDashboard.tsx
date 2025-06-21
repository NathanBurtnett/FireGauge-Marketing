import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign, 
  Eye, 
  MousePointer, 
  UserCheck,
  Activity,
  BarChart3,
  PieChart
} from "lucide-react";
import { analytics } from '../lib/analytics';

interface ConversionMetrics {
  totalVisitors: number;
  pricingPageViews: number;
  trialStarts: number;
  signupCompletions: number;
  onboardingCompletions: number;
  conversionRate: number;
  averageOrderValue: number;
}

interface FunnelStep {
  step: string;
  count: number;
  percentage: number;
  dropOff: number;
}

const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState<ConversionMetrics | null>(null);
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock analytics data (in real implementation, this would come from GA4 API)
  const mockMetrics: ConversionMetrics = {
    totalVisitors: 12450,
    pricingPageViews: 3890,
    trialStarts: 892,
    signupCompletions: 624,
    onboardingCompletions: 567,
    conversionRate: 5.01,
    averageOrderValue: 127.50
  };

  const mockFunnelData: FunnelStep[] = [
    { step: 'Website Visitors', count: 12450, percentage: 100, dropOff: 0 },
    { step: 'Pricing Page Views', count: 3890, percentage: 31.2, dropOff: 68.8 },
    { step: 'Trial Started', count: 892, percentage: 22.9, dropOff: 8.3 },
    { step: 'Signup Completed', count: 624, percentage: 69.9, dropOff: 30.1 },
    { step: 'Onboarding Completed', count: 567, percentage: 90.9, dropOff: 9.1 }
  ];

  useEffect(() => {
    // Simulate loading analytics data
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        // In real implementation, this would fetch from Google Analytics 4 API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMetrics(mockMetrics);
        setFunnelData(mockFunnelData);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [timeRange]);

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStepColor = (percentage: number): string => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Monitor conversion rates and marketing funnel performance</p>
          </div>
          
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics?.totalVisitors || 0)}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.conversionRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              +0.3% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.averageOrderValue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency((metrics?.signupCompletions || 0) * (metrics?.averageOrderValue || 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              +18.7% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="funnel" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="funnel" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Conversion Funnel
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Event Tracking
          </TabsTrigger>
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Setup Guide
          </TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-red-600" />
                Marketing Funnel Analysis
              </CardTitle>
              <CardDescription>
                Track user progression through the signup and onboarding process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {funnelData.map((step, index) => (
                  <div key={step.step} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${getStepColor(step.percentage)} flex items-center justify-center text-white text-sm font-semibold`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{step.step}</h4>
                          <p className="text-sm text-gray-600">
                            {formatNumber(step.count)} users ({step.percentage.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                      {index > 0 && (
                        <Badge variant={step.dropOff < 20 ? 'default' : step.dropOff < 50 ? 'secondary' : 'destructive'}>
                          -{step.dropOff.toFixed(1)}% drop-off
                        </Badge>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 ml-11">
                      <div 
                        className={`h-2 rounded-full ${getStepColor(step.percentage)}`}
                        style={{ width: `${step.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-red-600" />
                  Tracked Events
                </CardTitle>
                <CardDescription>
                  Key events being monitored across the marketing site
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {[
                    { event: 'page_view', description: 'Page visits and navigation', icon: Eye, count: '45.2k' },
                    { event: 'pricing_viewed', description: 'Pricing page interactions', icon: DollarSign, count: '3.9k' },
                    { event: 'trial_started', description: 'Trial signup initiations', icon: MousePointer, count: '892' },
                    { event: 'signup_complete', description: 'Successful signups', icon: UserCheck, count: '624' },
                    { event: 'onboarding_complete', description: 'Onboarding wizard completions', icon: Target, count: '567' }
                  ].map((item) => (
                    <div key={item.event} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 text-red-600" />
                        <div>
                          <h4 className="font-medium">{item.event}</h4>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-red-600" />
                Google Analytics 4 Setup
              </CardTitle>
              <CardDescription>
                Configure GA4 for comprehensive tracking and reporting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Analytics Integration Active</h4>
                  <p className="text-green-700 text-sm">
                    Google Analytics 4 is properly configured and tracking events.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Required Environment Variables:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-gray-100 rounded font-mono">
                      VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Tracking Events:</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Page views with custom parameters</li>
                    <li>• User identification and properties</li>
                    <li>• Conversion events (signup, trial start)</li>
                    <li>• E-commerce purchases with transaction data</li>
                    <li>• Funnel progression tracking</li>
                    <li>• Form submissions and errors</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Debug Information:</h4>
                  <div className="p-3 bg-gray-100 rounded">
                    <pre className="text-xs">
                      {JSON.stringify(analytics.getDebugInfo(), null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
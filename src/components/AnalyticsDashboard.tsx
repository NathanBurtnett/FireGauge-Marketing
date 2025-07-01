import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Eye, 
  MousePointer, 
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  totalVisitors: number;
  pricingViews: number;
  trialsStarted: number;
  signupsCompleted: number;
  onboardingCompleted: number;
  conversionRate: number;
  avgOrderValue: number;
  totalRevenue: number;
  activeUsers: number;
  bounceRate: number;
}

interface ConversionFunnelStep {
  name: string;
  count: number;
  percentage: number;
  dropOff: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalVisitors: 0,
    pricingViews: 0,
    trialsStarted: 0,
    signupsCompleted: 0,
    onboardingCompleted: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    totalRevenue: 0,
    activeUsers: 0,
    bounceRate: 0,
  });

  const [funnelData, setFunnelData] = useState<ConversionFunnelStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Simulate analytics data - in production, this would fetch from your analytics API
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data based on the documentation examples
      const mockData: AnalyticsData = {
        totalVisitors: 3247,
        pricingViews: 1006,
        trialsStarted: 746,
        signupsCompleted: 522,
        onboardingCompleted: 475,
        conversionRate: 5.01,
        avgOrderValue: 127.50,
        totalRevenue: 66585,
        activeUsers: 1834,
        bounceRate: 34.2,
      };

      const mockFunnelData: ConversionFunnelStep[] = [
        { name: 'Website Visitors', count: mockData.totalVisitors, percentage: 100, dropOff: 0 },
        { name: 'Pricing Page Views', count: mockData.pricingViews, percentage: 31, dropOff: 69 },
        { name: 'Trial Started', count: mockData.trialsStarted, percentage: 23, dropOff: 8 },
        { name: 'Signup Completed', count: mockData.signupsCompleted, percentage: 16, dropOff: 7 },
        { name: 'Onboarding Completed', count: mockData.onboardingCompleted, percentage: 15, dropOff: 1 },
      ];

      setAnalyticsData(mockData);
      setFunnelData(mockFunnelData);
      setLastUpdated(new Date());
      setIsLoading(false);
    };

    fetchAnalyticsData();
  }, []);

  const refreshData = () => {
    setAnalyticsData(prev => ({
      ...prev,
      totalVisitors: prev.totalVisitors + Math.floor(Math.random() * 10),
      activeUsers: prev.activeUsers + Math.floor(Math.random() * 5) - 2,
    }));
    setLastUpdated(new Date());
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    description: string;
    icon: React.ReactNode;
    trend?: number;
    format?: 'number' | 'currency' | 'percentage';
  }> = ({ title, value, description, icon, trend, format = 'number' }) => {
    const formatValue = (val: string | number) => {
      if (format === 'currency') {
        return `$${Number(val).toLocaleString()}`;
      }
      if (format === 'percentage') {
        return `${val}%`;
      }
      return Number(val).toLocaleString();
    };

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatValue(value)}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend !== undefined && (
            <div className={`flex items-center text-xs mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend >= 0 ? '+' : ''}{trend}% from last month
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-500" />
            <p className="text-gray-500">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-500">Real-time insights into FireGauge marketing performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="events">Event Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Visitors"
              value={analyticsData.totalVisitors}
              description="Unique website visitors"
              icon={<Users className="h-4 w-4 text-blue-600" />}
              trend={12.5}
            />
            <MetricCard
              title="Conversion Rate"
              value={analyticsData.conversionRate}
              description="Visitor to customer rate"
              icon={<TrendingUp className="h-4 w-4 text-green-600" />}
              format="percentage"
              trend={2.1}
            />
            <MetricCard
              title="Avg Order Value"
              value={analyticsData.avgOrderValue}
              description="Average purchase amount"
              icon={<DollarSign className="h-4 w-4 text-green-600" />}
              format="currency"
              trend={5.3}
            />
            <MetricCard
              title="Total Revenue"
              value={analyticsData.totalRevenue}
              description="Total monthly revenue"
              icon={<BarChart3 className="h-4 w-4 text-purple-600" />}
              format="currency"
              trend={18.7}
            />
          </div>

          {/* Additional Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Active Users"
              value={analyticsData.activeUsers}
              description="Currently active users"
              icon={<Eye className="h-4 w-4 text-orange-600" />}
            />
            <MetricCard
              title="Bounce Rate"
              value={analyticsData.bounceRate}
              description="Single page visit rate"
              icon={<MousePointer className="h-4 w-4 text-red-600" />}
              format="percentage"
              trend={-3.2}
            />
            <MetricCard
              title="Trials Started"
              value={analyticsData.trialsStarted}
              description="Users who started trials"
              icon={<ShoppingCart className="h-4 w-4 text-blue-600" />}
              trend={8.9}
            />
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel Analysis</CardTitle>
              <CardDescription>
                Track user progression through the marketing funnel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {funnelData.map((step, index) => (
                  <div key={step.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{step.name}</span>
                        <Badge variant="secondary">{step.percentage}%</Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {step.count.toLocaleString()} users
                      </div>
                    </div>
                    <Progress value={step.percentage} className="h-3" />
                    {index < funnelData.length - 1 && step.dropOff > 0 && (
                      <div className="text-xs text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {step.dropOff}% drop-off to next step
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Key Events Tracked</CardTitle>
                <CardDescription>
                  Custom events automatically monitored
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'page_view', count: 8934, status: 'active' },
                    { name: 'pricing_viewed', count: 1006, status: 'active' },
                    { name: 'trial_started', count: 746, status: 'active' },
                    { name: 'signup_complete', count: 522, status: 'active' },
                    { name: 'onboarding_complete', count: 475, status: 'active' },
                    { name: 'contact_form_submit', count: 89, status: 'active' },
                  ].map((event) => (
                    <div key={event.name} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-mono text-sm">{event.name}</span>
                      </div>
                      <Badge variant="outline">{event.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuration Status</CardTitle>
                <CardDescription>
                  Analytics setup and integration status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Google Analytics 4', status: 'connected' },
                    { name: 'Enhanced E-commerce', status: 'enabled' },
                    { name: 'Conversion Goals', status: 'configured' },
                    { name: 'Custom Events', status: 'tracking' },
                    { name: 'Real-time Data', status: 'active' },
                    { name: 'Privacy Compliance', status: 'compliant' },
                  ].map((item) => (
                    <div key={item.name} className="flex justify-between items-center">
                      <span className="text-sm">{item.name}</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
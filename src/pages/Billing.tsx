
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

const Billing = () => {
  const currentPlan = {
    name: "Growth",
    status: "Active",
    billingPeriod: "Monthly",
    price: "$200",
    nextBillingDate: "May 15, 2025",
    season: "In-Season"
  };
  
  const invoices = [
    { id: "INV-001", date: "Apr 15, 2025", amount: "$200.00", status: "Paid" },
    { id: "INV-002", date: "Mar 15, 2025", amount: "$200.00", status: "Paid" },
    { id: "INV-003", date: "Feb 15, 2025", amount: "$50.00", status: "Paid" },
    { id: "INV-004", date: "Jan 15, 2025", amount: "$50.00", status: "Paid" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <DashboardHeader />
        
        <div className="flex flex-1 overflow-hidden">
          <DashboardSidebar />
          
          <main className="flex-1 overflow-y-auto p-6">
            <div className="container mx-auto max-w-6xl">
              <h1 className="text-3xl font-bold mb-6 text-firegauge-charcoal">Billing & Subscription</h1>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">Subscription Overview</TabsTrigger>
                  <TabsTrigger value="payment">Payment Methods</TabsTrigger>
                  <TabsTrigger value="history">Billing History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  {/* Current Plan */}
                  <Card className="border-2 border-firegauge-accent">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-2xl">
                            {currentPlan.name} Plan
                            <Badge className="ml-2 bg-green-500">
                              {currentPlan.status}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Billed {currentPlan.billingPeriod}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">
                            {currentPlan.price}
                            <span className="text-sm font-normal text-gray-500">/month</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            During {currentPlan.season}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Stations</div>
                          <div className="font-medium">6-15 stations</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Team Members</div>
                          <div className="font-medium">3 of 5 used</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Next Billing Date</div>
                          <div className="font-medium">{currentPlan.nextBillingDate}</div>
                        </div>
                      </div>
                      
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
                              <div className="px-3 py-1 bg-gray-100 rounded text-sm">
                                In-Season: $200/mo
                              </div>
                              <div className="px-3 py-1 bg-gray-100 rounded text-sm">
                                Off-Season: $50/mo
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline">Change Plan</Button>
                      <Button 
                        className="bg-firegauge-charcoal hover:bg-firegauge-charcoal/90"
                      >
                        Manage Subscription
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  {/* Plan Features */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Plan Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        {[
                          "Everything in Starter",
                          "Advanced NFPA reports",
                          "Priority email support",
                          "QuickBooks integration",
                          "1-year data retention",
                          "Multi-user roles"
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
                            <Button variant="ghost" size="sm">Edit</Button>
                          </div>
                        </div>
                        
                        <Button 
                          className="mt-4"
                          variant="outline"
                        >
                          Add Payment Method
                        </Button>
                      </div>
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
                      <div className="space-y-4">
                        <div>
                          <p className="font-medium">FireGauge Testing Co.</p>
                          <p>123 Main Street, Suite 100</p>
                          <p>San Francisco, CA 94103</p>
                          <p>United States</p>
                        </div>
                        <Button variant="outline">Edit Billing Information</Button>
                      </div>
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
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Billing;

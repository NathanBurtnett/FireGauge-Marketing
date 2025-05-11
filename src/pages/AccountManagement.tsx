import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from '@supabase/supabase-js';

const AccountManagement = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('(555) 123-4567');
  const [notifications, setNotifications] = useState(true);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();
        if (authError) {
          throw authError;
        }

        if (supabaseUser) {
          const userEmail = supabaseUser.email || '';
          let userFirstName = '';
          let userLastName = '';

          if (supabaseUser.user_metadata?.full_name) {
            const nameParts = supabaseUser.user_metadata.full_name.split(' ');
            userFirstName = nameParts[0] || '';
            userLastName = nameParts.slice(1).join(' ') || '';
          } else if (userEmail) {
            userFirstName = userEmail.split('@')[0] || '';
          }
          
          setFirstName(userFirstName);
          setLastName(userLastName);
          setEmail(userEmail);
        } else {
          setError("No user session found. Please log in.");
        }
      } catch (e: any) {
        console.error("Error fetching user data for account management:", e);
        setError(e.message || "Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);
  
  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <DashboardHeader />
          <div className="flex flex-1 overflow-hidden">
            <DashboardSidebar />
            <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
              <p>Loading account data...</p>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <DashboardHeader />
          <div className="flex flex-1 overflow-hidden">
            <DashboardSidebar />
            <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
              <p className="text-red-600">Error: {error}</p>
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
            <div className="container mx-auto max-w-6xl">
              <h1 className="text-3xl font-bold mb-6 text-firegauge-charcoal">Account Management</h1>
              
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="team">Team Management</TabsTrigger>
                  <TabsTrigger value="organization">Organization</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details and profile image
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex flex-col items-center space-y-4 mb-6">
                          <Avatar className="w-32 h-32">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <Button variant="outline" size="sm">Change Photo</Button>
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">First Name</Label>
                              <Input 
                                id="firstName" 
                                value={firstName} 
                                onChange={(e) => setFirstName(e.target.value)} 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input 
                                id="lastName" 
                                value={lastName} 
                                onChange={(e) => setLastName(e.target.value)} 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input 
                                id="email" 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input 
                                id="phone" 
                                value={phoneNumber} 
                                onChange={(e) => setPhoneNumber(e.target.value)} 
                              />
                            </div>
                          </div>
                          
                          <div className="pt-2">
                            <Button className="bg-firegauge-red hover:bg-firegauge-red/90">Save Changes</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>
                        Manage your notification preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive updates about test results and stations</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setNotifications(!notifications)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${notifications ? 'bg-firegauge-red' : 'bg-gray-300'}`}
                          >
                            <span 
                              className={`block w-4 h-4 rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`}
                            />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="team">
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Members</CardTitle>
                      <CardDescription>
                        Manage your team and their access levels
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-500">Managing 3 of 5 team members (Growth Plan)</p>
                          <Button className="bg-firegauge-charcoal hover:bg-firegauge-charcoal/90">Invite Member</Button>
                        </div>
                        
                        <div className="border rounded-md divide-y">
                          {[
                            { name: 'John Doe', email: 'john.doe@firegauge.com', role: 'Admin', photo: 'https://github.com/shadcn.png' },
                            { name: 'Jane Smith', email: 'jane.smith@firegauge.com', role: 'Tester', photo: '' },
                            { name: 'Mike Johnson', email: 'mike.johnson@firegauge.com', role: 'Viewer', photo: '' }
                          ].map((member, i) => (
                            <div key={i} className="flex items-center justify-between p-4">
                              <div className="flex items-center space-x-4">
                                <Avatar>
                                  <AvatarImage src={member.photo} />
                                  <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{member.name}</p>
                                  <p className="text-sm text-gray-500">{member.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">{member.role}</span>
                                <Button variant="ghost" size="sm">Edit</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="organization">
                  <Card>
                    <CardHeader>
                      <CardTitle>Organization Settings</CardTitle>
                      <CardDescription>
                        Manage your organization details and branding
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Company Name</Label>
                          <Input id="companyName" defaultValue="FireGauge Testing Co." />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="address">Business Address</Label>
                          <Input id="address" defaultValue="123 Main Street, Suite 100" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" defaultValue="San Francisco" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input id="state" defaultValue="CA" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zip">ZIP Code</Label>
                            <Input id="zip" defaultValue="94103" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Company Logo</Label>
                          <div className="flex items-center space-x-4">
                            <div className="h-16 w-32 bg-gray-100 rounded flex items-center justify-center">
                              <span className="text-sm text-gray-500">Your Logo</span>
                            </div>
                            <Button variant="outline">Upload Logo</Button>
                          </div>
                        </div>
                        
                        <Button className="mt-4 bg-firegauge-red hover:bg-firegauge-red/90">Save Organization Settings</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>
                        Manage your password and security preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Change Password</h3>
                          <div className="grid gap-2">
                            <Label htmlFor="current">Current Password</Label>
                            <Input id="current" type="password" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="new">New Password</Label>
                            <Input id="new" type="password" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="confirm">Confirm Password</Label>
                            <Input id="confirm" type="password" />
                          </div>
                          <Button className="bg-firegauge-red hover:bg-firegauge-red/90">Update Password</Button>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                          <div className="flex justify-between items-center">
                            <div>
                              <p>Protect your account with 2FA</p>
                              <p className="text-sm text-gray-500">Currently disabled</p>
                            </div>
                            <Button variant="outline">Enable 2FA</Button>
                          </div>
                        </div>
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

export default AccountManagement;

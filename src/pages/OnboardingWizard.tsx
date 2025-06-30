import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, ArrowLeft, Building, Settings, Rocket, Loader2, CreditCard, Calculator, AlertCircle, Users, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { emailService, ContactData } from '../lib/emailService';
import { trackingHelpers } from '../lib/analytics';
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { getWelcomeEmailHTML } from "@/components/WelcomeEmailTemplate";
import { 
  getPlanById, 
  getStripePriceId, 
  planSupportsInvoice, 
  planSupportsAnnual,
  BillingMethod, 
  BillingCycle, 
  type FireGaugePlan 
} from '@/config/stripe-config';
import { processBilling, type CheckoutResponse, type InvoiceResponse } from '@/api/billing';

// Form schemas
const departmentInfoSchema = z.object({
  departmentName: z.string().min(2, 'Department name must be at least 2 characters'),
  departmentType: z.string().min(1, 'Please select a department type'),
  numberOfStations: z.string().min(1, 'Please select number of stations'),
  primaryContact: z.string().min(2, 'Primary contact name is required'),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(5, 'Department address is required'),
});

const userCredentialsSchema = z.object({
  adminUsername: z.string().min(3, 'Admin username must be at least 3 characters').max(50, 'Username too long'),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
  adminConfirmPassword: z.string(),
  operatorUsername: z.string().min(3, 'Operator username must be at least 3 characters').max(50, 'Username too long'),
  operatorPassword: z.string().min(8, 'Password must be at least 8 characters'),
  operatorConfirmPassword: z.string(),
}).refine((data) => data.adminPassword === data.adminConfirmPassword, {
  message: "Admin passwords don't match",
  path: ["adminConfirmPassword"],
}).refine((data) => data.operatorPassword === data.operatorConfirmPassword, {
  message: "Operator passwords don't match",
  path: ["operatorConfirmPassword"],
}).refine((data) => data.adminUsername !== data.operatorUsername, {
  message: "Admin and operator usernames must be different",
  path: ["operatorUsername"],
});

type DepartmentInfoForm = z.infer<typeof departmentInfoSchema>;
type UserCredentialsForm = z.infer<typeof userCredentialsSchema>;

const OnboardingWizard = () => {
  // const navigate = useNavigate(); // not currently used
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(user ? 1 : 0);
  
  // Debug logging
  useEffect(() => {
    console.log('🎯 OnboardingWizard loaded:', {
      user: user ? { email: user.email, id: user.id } : null,
      searchParams: Object.fromEntries(searchParams.entries()),
      currentStep,
      url: window.location.href,
      hash: window.location.hash
    });
  }, [user, searchParams, currentStep]);
  // Email state for account creation step
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [departmentData, setDepartmentData] = useState<DepartmentInfoForm | null>(null);
  const [userCredentials, setUserCredentials] = useState<UserCredentialsForm | null>(null);
  
  // Enhanced plan and billing state
  const [selectedPlan, setSelectedPlan] = useState(() => {
    const planSlug = searchParams.get('plan');
    if (!planSlug) return 'Professional';
    switch(planSlug) {
      case 'pilot': return 'Pilot 90';
      case 'essential': return 'Essential';
      case 'pro': return 'Pro';
      case 'contractor': return 'Contractor';
      default: return 'Professional';
    }
  });
  
  // Billing method and cycle from URL parameters or defaults
  const [billingMethod, setBillingMethod] = useState<BillingMethod>(() => {
    const method = searchParams.get('billing_method');
    return (method === 'invoice') ? BillingMethod.INVOICE : BillingMethod.SUBSCRIPTION;
  });
  
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(() => {
    const cycle = searchParams.get('billing_cycle');
    return (cycle === 'annual') ? BillingCycle.ANNUAL : BillingCycle.MONTHLY;
  });
  
  // Billing process state
  const [billingProcessing, setBillingProcessing] = useState(false);
  const [billingCompleted, setBillingCompleted] = useState(false);
  const [billingResult, setBillingResult] = useState<CheckoutResponse | InvoiceResponse | null>(null);
  
  // Get the actual plan configuration
  const planConfig = getPlanById(selectedPlan.toLowerCase().replace(/\s+/g, '')) || null;
  
  // Password visibility state for user credentials step
  const [showPasswords, setShowPasswords] = useState({
    adminPassword: false,
    adminConfirmPassword: false,
    operatorPassword: false,
    operatorConfirmPassword: false,
  });
  
  const sessionId = searchParams.get('session_id');
  const totalSteps = user ? 5 : 6;

  // Track onboarding start
  useEffect(() => {
    trackingHelpers.trackOnboardingStart();
  }, []);

  // Advance automatically once user is detected after sign-up
  useEffect(() => {
    if (user && currentStep === 0) {
      setCurrentStep(1);
    }
  }, [user, currentStep]);

  const departmentForm = useForm<DepartmentInfoForm>({
    resolver: zodResolver(departmentInfoSchema),
    defaultValues: {
      departmentName: '',
      departmentType: '',
      numberOfStations: '',
      primaryContact: '',
      phoneNumber: '',
      address: '',
    }
  });

  const userCredentialsForm = useForm<UserCredentialsForm>({
    resolver: zodResolver(userCredentialsSchema),
    defaultValues: {
      adminUsername: '',
      adminPassword: '',
      adminConfirmPassword: '',
      operatorUsername: '',
      operatorPassword: '',
      operatorConfirmPassword: '',
    }
  });

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDepartmentSubmit = async (data: DepartmentInfoForm) => {
    setIsLoading(true);
    try {
      setDepartmentData(data);
      toast({
        title: "Information Saved",
        description: "Department information has been saved successfully.",
      });
      nextStep();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save department information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserCredentialsSubmit = async (data: UserCredentialsForm) => {
    setIsLoading(true);
    try {
      setUserCredentials(data);
      toast({
        title: "User Accounts Configured",
        description: "Admin and operator credentials have been saved successfully.",
      });
      nextStep();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save user credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBilling = async (method: BillingMethod) => {
    if (!planConfig || !departmentData) {
      toast({
        title: "Missing Information",
        description: "Please complete department information first.",
        variant: "destructive",
      });
      return;
    }

    // For free trial, skip billing and go to next step
    if (planConfig.id === 'pilot') {
      setBillingCompleted(true);
      setBillingResult({
        url: '',
        sessionId: 'free-trial',
        flowType: 'free-trial'
      } as CheckoutResponse);
      nextStep();
      return;
    }

    setBillingProcessing(true);

    try {
      const priceId = getStripePriceId(planConfig.id, method, billingCycle);
      if (!priceId) {
        throw new Error('Unable to find pricing for the selected options');
      }

      console.log(`[ONBOARDING] Processing ${method} billing for ${planConfig.name} (${billingCycle})`);

      if (method === BillingMethod.SUBSCRIPTION) {
        // Handle subscription checkout
        const result = await processBilling({
          planId: planConfig.id,
          method,
          cycle: billingCycle,
          priceId,
        }) as CheckoutResponse;

        // Store billing result for completion tracking
        setBillingResult(result);
        
        console.log(`[ONBOARDING] Redirecting to Stripe checkout:`, result.url);
        window.location.href = result.url;
        
      } else if (method === BillingMethod.INVOICE) {
        // Handle invoice creation
        const customerInfo = {
          email: user?.email || '',
          name: departmentData.primaryContact,
          phone: departmentData.phoneNumber,
          address: {
            line1: departmentData.address.split(',')[0] || '',
            city: departmentData.address.split(',')[1]?.trim() || '',
            state: departmentData.address.split(',')[2]?.trim() || '',
            postal_code: '',
            country: 'US'
          }
        };

        const result = await processBilling({
          planId: planConfig.id,
          method,
          cycle: billingCycle,
          priceId,
        }, customerInfo) as InvoiceResponse;

        setBillingResult(result);
        setBillingCompleted(true);
        
        toast({
          title: "Invoice Created Successfully",
          description: "We've sent an invoice to your email. You can continue setting up your account.",
        });
        
        nextStep();
      }
      
    } catch (error) {
      console.error(`[ONBOARDING] ${method} error:`, error);
      toast({
        title: `Failed to process ${method}`,
        description: error instanceof Error ? error.message : 'Please try again or contact support',
        variant: "destructive",
      });
    } finally {
      setBillingProcessing(false);
    }
  };

  const completeOnboarding = async () => {
    if (!user || !departmentData || !userCredentials) {
      toast({
        title: "Missing Information",
        description: "Please complete all required steps including user credentials.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create account in main app with department, billing info, and user credentials
      const accountData = {
        email: user.email,
        userData: {
          ...departmentData,
          selectedPlan,
          billingMethod,
          billingCycle,
          billingResult,
        },
        userCredentials: {
          adminUsername: userCredentials.adminUsername,
          adminPassword: userCredentials.adminPassword,
          operatorUsername: userCredentials.operatorUsername,
          operatorPassword: userCredentials.operatorPassword,
        }
      };

      const response = await fetch('https://app.firegauge.app/api/create-account-from-marketing-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create account`);
      }

      const result = await response.json();

      // Trigger email automation for onboarding completion
      const contactData: ContactData = {
        email: user.email || 'user@example.com',
        firstName: departmentData.primaryContact.split(' ')[0],
        lastName: departmentData.primaryContact.split(' ').slice(1).join(' '),
        departmentName: departmentData.departmentName,
        planType: selectedPlan,
        signupDate: new Date().toISOString()
      };

      // Send beautiful welcome email using our custom template
      try {
        const welcomeEmailHTML = getWelcomeEmailHTML({
          userName: contactData.firstName,
          departmentName: contactData.departmentName,
          redirectUrl: 'https://app.firegauge.app'
        });
        
        // Trigger onboarding completion email sequence
        await emailService.triggerEmailSequence('onboarding_complete', contactData);
        
        // Add contact to SendGrid marketing lists
        await emailService.addContactToList(contactData, ['onboarded-users']);
      } catch (emailError) {
        console.warn('Email sending failed, but continuing onboarding:', emailError);
      }

      // Track onboarding completion with user credentials
      if (typeof gtag !== 'undefined') {
        gtag('event', 'onboarding_complete', {
          plan: selectedPlan,
          department_type: departmentData.departmentType,
          billing_method: billingMethod,
          has_user_credentials: true,
        });
      }

      toast({
        title: "Account Created Successfully!",
        description: "Your department and user accounts are set up. Redirecting to your FireGauge dashboard...",
      });

      // Store completion info in localStorage for welcome flow
      localStorage.setItem('firegauge_onboarding_completed', 'true');
      localStorage.setItem('firegauge_department_name', departmentData?.departmentName || '');
      localStorage.setItem('firegauge_admin_username', userCredentials?.adminUsername || '');
      localStorage.setItem('firegauge_operator_username', userCredentials?.operatorUsername || '');
      
      setTimeout(() => {
        const appUrl = import.meta.env.VITE_API_URL || 'https://app.firegauge.app';
        window.location.href = appUrl;
      }, 2000);

    } catch (error) {
      console.error('Onboarding completion error:', error);
      toast({
        title: "Setup Error",
        description: error instanceof Error ? error.message : 'Failed to complete setup. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIcon = (step: number) => {
    if (step < currentStep) return <CheckCircle className="h-6 w-6 text-green-500" />;
    if (step === currentStep) {
      switch (step) {
        case 1: return <Building className="h-6 w-6 text-red-600" />;
        case 2: return <CreditCard className="h-6 w-6 text-red-600" />;
        case 3: return <Settings className="h-6 w-6 text-red-600" />;
        case 4: return <Users className="h-6 w-6 text-red-600" />;
        case 5: return <Rocket className="h-6 w-6 text-red-600" />;
        default: return null;
      }
    }
    return <div className="h-6 w-6 rounded-full border-2 border-gray-300" />;
  };

  const renderStep = () => {
    // ---------- STEP 0: Account creation ----------
    if (currentStep === 0) {
      return (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create your FireGauge account</CardTitle>
            <CardDescription>
              Enter your email to receive a secure sign-in link. No password required!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isLoading || !email}
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    const { error } = await supabase.auth.signInWithOtp({ 
                      email, 
                      options: { 
                        shouldCreateUser: true, 
                        emailRedirectTo: `${window.location.origin}${window.location.search}` 
                      } 
                    });
                    if (error && error.message !== 'User already registered') {
                      throw error;
                    }
                    toast({
                      title: 'Check your inbox!',
                      description: 'We\'ve sent you a magic link. Click it to continue your onboarding.',
                    });
                  } catch (err) {
                    console.error('Signup error', err);
                    toast({
                      title: 'Signup failed',
                      description: err instanceof Error ? err.message : 'Please try again.',
                      variant: 'destructive',
                    });
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send magic link'}
              </Button>
              
              {/* Enhanced email instructions */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 text-sm mb-1">After clicking "Send magic link":</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Check your email inbox (and spam folder)</li>
                  <li>• Click the "Complete Sign In" link in the email</li>
                  <li>• You'll be brought back here to continue setup</li>
                  <li>• Keep this page open while checking email</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-6 w-6 text-red-600" />
                Department Information
              </CardTitle>
              <CardDescription>
                Tell us about your fire department to customize your FireGauge experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={departmentForm.handleSubmit(handleDepartmentSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departmentName">Department Name</Label>
                    <Input
                      id="departmentName"
                      {...departmentForm.register('departmentName')}
                      placeholder="City Fire Department"
                    />
                    {departmentForm.formState.errors.departmentName && (
                      <p className="text-sm text-red-500">
                        {departmentForm.formState.errors.departmentName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="departmentType">Department Type</Label>
                    <Select onValueChange={(value) => departmentForm.setValue('departmentType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="municipal">Municipal Fire Department</SelectItem>
                        <SelectItem value="volunteer">Volunteer Fire Department</SelectItem>
                        <SelectItem value="industrial">Industrial Fire Brigade</SelectItem>
                        <SelectItem value="airport">Airport Fire Department</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {departmentForm.formState.errors.departmentType && (
                      <p className="text-sm text-red-500">
                        {departmentForm.formState.errors.departmentType.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfStations">Number of Stations</Label>
                    <Select onValueChange={(value) => departmentForm.setValue('numberOfStations', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Station</SelectItem>
                        <SelectItem value="2-5">2-5 Stations</SelectItem>
                        <SelectItem value="6-10">6-10 Stations</SelectItem>
                        <SelectItem value="11-25">11-25 Stations</SelectItem>
                        <SelectItem value="25+">25+ Stations</SelectItem>
                      </SelectContent>
                    </Select>
                    {departmentForm.formState.errors.numberOfStations && (
                      <p className="text-sm text-red-500">
                        {departmentForm.formState.errors.numberOfStations.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryContact">Primary Contact</Label>
                    <Input
                      id="primaryContact"
                      {...departmentForm.register('primaryContact')}
                      placeholder="Chief John Smith"
                    />
                    {departmentForm.formState.errors.primaryContact && (
                      <p className="text-sm text-red-500">
                        {departmentForm.formState.errors.primaryContact.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      {...departmentForm.register('phoneNumber')}
                      placeholder="(555) 123-4567"
                    />
                    {departmentForm.formState.errors.phoneNumber && (
                      <p className="text-sm text-red-500">
                        {departmentForm.formState.errors.phoneNumber.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Department Address</Label>
                  <Textarea
                    id="address"
                    {...departmentForm.register('address')}
                    placeholder="123 Main Street, City, State 12345"
                    rows={3}
                  />
                  {departmentForm.formState.errors.address && (
                    <p className="text-sm text-red-500">
                      {departmentForm.formState.errors.address.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-red-600" />
                Plan & Billing
              </CardTitle>
              <CardDescription>
                Confirm your selected plan and choose your billing method.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Plan Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Selected Plan</h3>
                  {planConfig ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-lg">{planConfig.name}</p>
                          <p className="text-sm text-gray-600 mb-2">{planConfig.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="bg-white p-2 rounded border">
                              <span className="font-medium">Users:</span> {planConfig.userCount}
                            </div>
                            <div className="bg-white p-2 rounded border">
                              <span className="font-medium">Assets:</span> {planConfig.assetCount}
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          {planConfig.displayPrice !== 'Free' && planConfig.displayPrice !== 'Custom' ? (
                            <>
                              <p className="text-2xl font-bold text-red-600">
                                {billingCycle === BillingCycle.ANNUAL && planConfig.annualSavings 
                                  ? planConfig.annualSavings.split(' ')[0] 
                                  : planConfig.displayPrice}
                              </p>
                              <p className="text-sm text-gray-600">
                                per {billingCycle === BillingCycle.ANNUAL ? 'year' : 'month'}
                              </p>
                              {billingCycle === BillingCycle.ANNUAL && planConfig.annualSavings && (
                                <p className="text-xs text-green-600 font-medium">
                                  {planConfig.annualSavings.match(/\(([^)]+)\)/)?.[1]}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-2xl font-bold text-red-600">{planConfig.displayPrice}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="h-5 w-5" />
                      <p>Plan configuration not found. Please go back and select a plan.</p>
                    </div>
                  )}
                </div>

                {/* Billing Cycle Selection (if plan supports annual) */}
                {planConfig && planSupportsAnnual(planConfig.id) && planConfig.displayPrice !== 'Free' && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-3">Billing Cycle</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={billingCycle === BillingCycle.MONTHLY ? "default" : "outline"}
                        onClick={() => setBillingCycle(BillingCycle.MONTHLY)}
                        className="justify-start"
                      >
                        <span className="font-medium">Monthly</span>
                      </Button>
                      <Button
                        variant={billingCycle === BillingCycle.ANNUAL ? "default" : "outline"}
                        onClick={() => setBillingCycle(BillingCycle.ANNUAL)}
                        className="justify-start"
                      >
                        <span className="font-medium">Annual</span>
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Save {planConfig.annualSavings?.match(/\(([^)]+)\)/)?.[1]}
                        </span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Billing Status */}
                {billingCompleted ? (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h4 className="font-medium text-green-800">Billing Configured</h4>
                    </div>
                    <p className="text-sm text-green-700">
                      {planConfig?.id === 'pilot' 
                        ? 'Your free trial is active. No payment required.'
                        : billingMethod === BillingMethod.INVOICE 
                          ? 'Invoice has been sent to your email. You can continue setup while processing payment.'
                          : 'Your subscription is active and billing has been set up successfully.'
                      }
                    </p>
                  </div>
                ) : planConfig && planConfig.displayPrice === 'Free' ? (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                      <h4 className="font-medium text-blue-800">Free Trial</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      No payment required for your 90-day free trial. You can upgrade at any time.
                    </p>
                  </div>
                ) : (
                  /* Billing Method Selection */
                  <div className="space-y-4">
                    <h4 className="font-medium">Choose Billing Method</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Subscription Option */}
                      <Button
                        onClick={() => handleBilling(BillingMethod.SUBSCRIPTION)}
                        disabled={billingProcessing || !planConfig}
                        className="h-auto p-4 flex flex-col items-center space-y-2 bg-red-600 hover:bg-red-700"
                      >
                        {billingProcessing && billingMethod === BillingMethod.SUBSCRIPTION ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <CreditCard className="h-6 w-6" />
                        )}
                        <span className="font-medium">Pay Now</span>
                        <span className="text-xs text-center opacity-90">
                          Instant access with credit card
                        </span>
                      </Button>

                      {/* Invoice Option (if supported) */}
                      {planConfig && planSupportsInvoice(planConfig.id) && (
                        <Button
                          onClick={() => handleBilling(BillingMethod.INVOICE)}
                          disabled={billingProcessing || !planConfig}
                          variant="outline"
                          className="h-auto p-4 flex flex-col items-center space-y-2 border-gray-300 hover:bg-gray-50"
                        >
                          {billingProcessing && billingMethod === BillingMethod.INVOICE ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            <Calculator className="h-6 w-6" />
                          )}
                          <span className="font-medium">Request Invoice</span>
                          <span className="text-xs text-center text-gray-600">
                            30-day payment terms
                          </span>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button onClick={prevStep} disabled={billingProcessing}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  {billingCompleted || planConfig?.displayPrice === 'Free' ? (
                    <Button 
                      onClick={() => {
                        if (planConfig?.displayPrice === 'Free') {
                          handleBilling(BillingMethod.SUBSCRIPTION); // This will handle free trial
                        } else {
                          nextStep();
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Continue Setup
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Select a billing method to continue
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-red-600" />
                Initial Setup
              </CardTitle>
              <CardDescription>
                Configure your basic preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">Quick Setup</h4>
                  <p className="text-sm text-blue-700">
                    We'll configure your account with default settings for {departmentData?.departmentType} departments.
                    You can customize everything later in your dashboard.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">Equipment Categories</p>
                    <p className="text-gray-600">Standard fire department equipment</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">Testing Schedules</p>
                    <p className="text-gray-600">NFPA recommended intervals</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">User Roles</p>
                    <p className="text-gray-600">Chief, Captain, Firefighter</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">Reporting</p>
                    <p className="text-gray-600">Monthly compliance reports</p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={nextStep} className="bg-red-600 hover:bg-red-700">
                    Apply Defaults
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-red-600" />
                User Account Setup
              </CardTitle>
              <CardDescription>
                Create login credentials for your department's admin and operator accounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={userCredentialsForm.handleSubmit(handleUserCredentialsSubmit)} className="space-y-6">
                {/* Admin Account Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Users className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold text-lg">Admin Account</h3>
                    <span className="text-sm text-gray-500">(Full access)</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminUsername">Admin Username</Label>
                      <Input
                        id="adminUsername"
                        {...userCredentialsForm.register('adminUsername')}
                        placeholder="chief_admin"
                      />
                      {userCredentialsForm.formState.errors.adminUsername && (
                        <p className="text-sm text-red-500">
                          {userCredentialsForm.formState.errors.adminUsername.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminPassword">Admin Password</Label>
                      <div className="relative">
                        <Input
                          id="adminPassword"
                          type={showPasswords.adminPassword ? "text" : "password"}
                          {...userCredentialsForm.register('adminPassword')}
                          placeholder="Secure password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords(prev => ({ ...prev, adminPassword: !prev.adminPassword }))}
                        >
                          {showPasswords.adminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {userCredentialsForm.formState.errors.adminPassword && (
                        <p className="text-sm text-red-500">
                          {userCredentialsForm.formState.errors.adminPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="adminConfirmPassword">Confirm Admin Password</Label>
                      <div className="relative">
                        <Input
                          id="adminConfirmPassword"
                          type={showPasswords.adminConfirmPassword ? "text" : "password"}
                          {...userCredentialsForm.register('adminConfirmPassword')}
                          placeholder="Re-enter password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords(prev => ({ ...prev, adminConfirmPassword: !prev.adminConfirmPassword }))}
                        >
                          {showPasswords.adminConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {userCredentialsForm.formState.errors.adminConfirmPassword && (
                        <p className="text-sm text-red-500">
                          {userCredentialsForm.formState.errors.adminConfirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Operator Account Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Users className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-lg">Operator Account</h3>
                    <span className="text-sm text-gray-500">(Equipment management)</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="operatorUsername">Operator Username</Label>
                      <Input
                        id="operatorUsername"
                        {...userCredentialsForm.register('operatorUsername')}
                        placeholder="operator1"
                      />
                      {userCredentialsForm.formState.errors.operatorUsername && (
                        <p className="text-sm text-red-500">
                          {userCredentialsForm.formState.errors.operatorUsername.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="operatorPassword">Operator Password</Label>
                      <div className="relative">
                        <Input
                          id="operatorPassword"
                          type={showPasswords.operatorPassword ? "text" : "password"}
                          {...userCredentialsForm.register('operatorPassword')}
                          placeholder="Secure password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords(prev => ({ ...prev, operatorPassword: !prev.operatorPassword }))}
                        >
                          {showPasswords.operatorPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {userCredentialsForm.formState.errors.operatorPassword && (
                        <p className="text-sm text-red-500">
                          {userCredentialsForm.formState.errors.operatorPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="operatorConfirmPassword">Confirm Operator Password</Label>
                      <div className="relative">
                        <Input
                          id="operatorConfirmPassword"
                          type={showPasswords.operatorConfirmPassword ? "text" : "password"}
                          {...userCredentialsForm.register('operatorConfirmPassword')}
                          placeholder="Re-enter password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords(prev => ({ ...prev, operatorConfirmPassword: !prev.operatorConfirmPassword }))}
                        >
                          {showPasswords.operatorConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {userCredentialsForm.formState.errors.operatorConfirmPassword && (
                        <p className="text-sm text-red-500">
                          {userCredentialsForm.formState.errors.operatorConfirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Information Panel */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">User Roles Explained</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                    <div>
                      <p className="font-medium">👑 Admin Access:</p>
                      <ul className="mt-1 space-y-1 text-xs">
                        <li>• Manage all department equipment</li>
                        <li>• Create/edit user accounts</li>
                        <li>• Access billing and settings</li>
                        <li>• Generate compliance reports</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">⚙️ Operator Access:</p>
                      <ul className="mt-1 space-y-1 text-xs">
                        <li>• Record equipment testing</li>
                        <li>• Update maintenance logs</li>
                        <li>• View equipment status</li>
                        <li>• Generate basic reports</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button onClick={prevStep} type="button">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Continue Setup
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Rocket className="h-8 w-8 text-red-600" />
                Welcome to FireGauge!
              </CardTitle>
              <CardDescription className="text-lg">
                Your account is set up and ready to use.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 text-center">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Setup Complete!</h3>
                  <p className="text-gray-600 mb-4">
                    Your FireGauge account for <strong>{departmentData?.departmentName}</strong> 
                    is now configured and ready for equipment management.
                  </p>
                  {userCredentials && (
                    <div className="bg-blue-50 p-4 rounded border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">Your Login Credentials</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-blue-700">Admin Access:</p>
                          <p className="text-blue-600">Username: <strong>{userCredentials.adminUsername}</strong></p>
                        </div>
                        <div>
                          <p className="font-medium text-blue-700">Operator Access:</p>
                          <p className="text-blue-600">Username: <strong>{userCredentials.operatorUsername}</strong></p>
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 mt-2">
                        💡 Save these credentials! You'll use them to access your FireGauge dashboard.
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Building className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <p className="font-medium">Department Setup</p>
                    <p className="text-gray-600">Complete</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <p className="font-medium">Billing Active</p>
                    <p className="text-gray-600">
                      {planConfig?.id === 'pilot' ? 'Free trial' : 'Subscription confirmed'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Settings className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <p className="font-medium">Preferences Set</p>
                    <p className="text-gray-600">Ready to customize</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="font-medium">User Accounts</p>
                    <p className="text-gray-600">Admin & Operator</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button 
                    onClick={completeOnboarding} 
                    disabled={isLoading}
                    className="w-full bg-red-600 hover:bg-red-700 text-lg py-6"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Setting up your dashboard...
                      </>
                    ) : (
                      <>
                        Launch FireGauge Dashboard
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <a href="/dashboard" className="flex items-center justify-center gap-2">
                        Account Settings
                      </a>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <a href="/contact" className="flex items-center justify-center gap-2">
                        Need Help?
                      </a>
                    </Button>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 text-center">
                      🎉 <strong>Setup Complete!</strong> You'll receive a welcome email with additional resources and your account will be ready for immediate use.
                    </p>
                  </div>
                  
                  <p className="text-sm text-gray-500 text-center">
                    You'll be redirected to your FireGauge dashboard where you can start managing your equipment immediately.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Welcome to FireGauge</h1>
          <p className="text-gray-300 mb-6">Let's set up your account in just a few steps</p>
          
          <div className="max-w-md mx-auto mb-6">
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
            <p className="text-sm text-gray-400 mt-2">Step {currentStep} of {totalSteps}</p>
          </div>

          <div className="flex justify-center items-center space-x-8 mb-8">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex flex-col items-center">
                {getStepIcon(step)}
                <span className={`text-xs mt-2 ${step <= currentStep ? 'text-white' : 'text-gray-500'}`}>
                  {step === 1 && 'Department'}
                  {step === 2 && 'Billing'}
                  {step === 3 && 'Setup'}
                  {step === 4 && 'Users'}
                  {step === 5 && 'Complete'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard; 
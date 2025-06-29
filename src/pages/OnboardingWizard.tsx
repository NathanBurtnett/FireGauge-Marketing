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
import { CheckCircle, ArrowRight, ArrowLeft, Building, Settings, Rocket, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { emailService, ContactData } from '../lib/emailService';
import { trackingHelpers } from '../lib/analytics';
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";

// Form schemas
const departmentInfoSchema = z.object({
  departmentName: z.string().min(2, 'Department name must be at least 2 characters'),
  departmentType: z.string().min(1, 'Please select a department type'),
  numberOfStations: z.string().min(1, 'Please select number of stations'),
  primaryContact: z.string().min(2, 'Primary contact name is required'),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(5, 'Department address is required'),
});

type DepartmentInfoForm = z.infer<typeof departmentInfoSchema>;

const OnboardingWizard = () => {
  // const navigate = useNavigate(); // not currently used
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(user ? 1 : 0);
  const [isLoading, setIsLoading] = useState(false);
  const [departmentData, setDepartmentData] = useState<DepartmentInfoForm | null>(null);
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
  
  const sessionId = searchParams.get('session_id');
  const totalSteps = user ? 4 : 5;

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

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      // Trigger email automation for onboarding completion
      if (departmentData) {
        const contactData: ContactData = {
          email: 'user@example.com', // This would come from auth context
          firstName: departmentData.primaryContact.split(' ')[0],
          lastName: departmentData.primaryContact.split(' ').slice(1).join(' '),
          departmentName: departmentData.departmentName,
          planType: 'Pro', // This would come from the selected plan
          signupDate: new Date().toISOString()
        };

        // Trigger onboarding completion email sequence
        await emailService.triggerEmailSequence('onboarding_complete', contactData);
        
        // Add contact to SendGrid marketing lists
        await emailService.addContactToList(contactData, ['onboarded-users']);
      }

      // Track onboarding completion
      trackingHelpers.trackOnboardingComplete();

      toast({
        title: "Welcome to FireGauge!",
        description: "Your account is now set up and ready to use. Check your email for next steps!",
      });

      setTimeout(() => {
        window.location.href = 'https://app.firegauge.app/dashboard';
      }, 2000);
    } catch (error) {
      console.error('Onboarding completion error:', error);
      toast({
        title: "Welcome to FireGauge!",
        description: "Your account is set up! If you don't receive welcome emails, please contact support.",
      });
      
      // Still redirect to dashboard even if email fails
      setTimeout(() => {
        window.location.href = 'https://app.firegauge.app/dashboard';
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIcon = (step: number) => {
    if (step < currentStep) return <CheckCircle className="h-6 w-6 text-green-500" />;
    if (step === currentStep) {
      switch (step) {
        case 1: return <Building className="h-6 w-6 text-red-600" />;
        case 2: return <CheckCircle className="h-6 w-6 text-red-600" />;
        case 3: return <Settings className="h-6 w-6 text-red-600" />;
        case 4: return <Rocket className="h-6 w-6 text-red-600" />;
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
            <CardDescription>Enter your email to receive a magic-link sign-in.</CardDescription>
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
                    const { error } = await supabase.auth.signUp({ email: email });
                    if (error && error.message !== 'User already registered') {
                      throw error;
                    }
                    toast({
                      title: 'Check your inbox',
                      description: 'We\'ve sent you a magic link to complete sign-in.',
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
                <CheckCircle className="h-6 w-6 text-green-500" />
                Plan Confirmation
              </CardTitle>
              <CardDescription>
                Confirm your selected plan and billing details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Selected Plan</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{selectedPlan} Plan</p>
                      <p className="text-sm text-gray-600">
                        Perfect for {departmentData?.numberOfStations || 'multiple'} stations
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">$299</p>
                      <p className="text-sm text-gray-600">per month</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h4 className="font-medium text-green-800">Payment Successful</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    Your subscription is active and billing has been set up successfully.
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={nextStep} className="bg-red-600 hover:bg-red-700">
                    Continue Setup
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
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
                  <p className="text-gray-600">
                    Your FireGauge account for <strong>{departmentData?.departmentName}</strong> 
                    is now configured and ready for equipment management.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Building className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <p className="font-medium">Department Setup</p>
                    <p className="text-gray-600">Complete</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <p className="font-medium">Billing Active</p>
                    <p className="text-gray-600">Subscription confirmed</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Settings className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <p className="font-medium">Preferences Set</p>
                    <p className="text-gray-600">Ready to customize</p>
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
                  
                  <p className="text-sm text-gray-500">
                    You'll be redirected to your FireGauge dashboard where you can start managing your equipment.
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
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center">
                {getStepIcon(step)}
                <span className={`text-xs mt-2 ${step <= currentStep ? 'text-white' : 'text-gray-500'}`}>
                  {step === 1 && 'Department'}
                  {step === 2 && 'Plan'}
                  {step === 3 && 'Setup'}
                  {step === 4 && 'Complete'}
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
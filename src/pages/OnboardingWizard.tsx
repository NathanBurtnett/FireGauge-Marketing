import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle, Building, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';

const OnboardingWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(user ? 1 : 0);
  
  // Form state
  const [email, setEmail] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [departmentType, setDepartmentType] = useState('');
  const [contactName, setContactName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const selectedPlan = searchParams.get('plan') || 'pilot';
  const appUrl = import.meta.env.VITE_API_URL || 'https://app.firegauge.com';

  useEffect(() => {
    if (user && step === 0) {
      setStep(1);
    }
  }, [user]);

  const handleEmailSignup = async () => {
    if (!email) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email, 
        options: { 
          shouldCreateUser: true, 
          emailRedirectTo: `${window.location.origin}/onboarding?plan=${selectedPlan}` 
        } 
      });
      
      if (error && error.message !== 'User already registered') {
        throw error;
      }
      
      toast({
        title: 'Check your inbox!',
        description: 'We\'ve sent you a magic link. Click it to continue.',
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
  };

  const handleDepartmentSetup = async () => {
    if (!departmentName || !contactName) {
      toast({
        title: 'Please fill in required fields',
        description: 'Department name and contact name are required.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Store information locally for now (can be sent to main app later)
      const setupData = {
        department_name: departmentName,
        department_type: departmentType,
        contact_name: contactName,
        phone_number: phoneNumber,
        selected_plan: selectedPlan,
        setup_completed: true
      };
      
      localStorage.setItem('firegauge_setup_data', JSON.stringify(setupData));
      
      setStep(2);
    } catch (error) {
      console.error('Department setup error:', error);
      toast({
        title: 'Setup Error',
        description: error instanceof Error ? error.message : 'Failed to save information. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    // Track completion
    if (typeof gtag !== 'undefined') {
      gtag('event', 'onboarding_complete', {
        plan: selectedPlan,
        department_type: departmentType
      });
    }

    // Redirect to main app
    window.location.href = appUrl;
  };

  // Step 0: Email signup (if not authenticated)
  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-firegauge-charcoal">
              Welcome to FireGauge
            </CardTitle>
            <CardDescription>
              Enter your email to get started with your {selectedPlan === 'pilot' ? '90-day free trial' : `${selectedPlan} plan`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEmailSignup()}
              />
            </div>
            <Button
              className="w-full bg-firegauge-red hover:bg-firegauge-red/90"
              disabled={isLoading || !email}
              onClick={handleEmailSignup}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Send Magic Link
            </Button>
            
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm">
              <p className="text-blue-800 font-medium mb-1">Next steps:</p>
              <ul className="text-blue-700 space-y-1 text-xs">
                <li>• Check your email inbox (and spam folder)</li>
                <li>• Click the "Complete Sign In" link</li>
                <li>• You'll return here to complete setup</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 1: Department information
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-firegauge-charcoal">
              <Building className="h-6 w-6 text-firegauge-red" />
              Department Setup
            </CardTitle>
            <CardDescription>
              Tell us about your department to customize FireGauge for your needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departmentName">Department Name *</Label>
                <Input
                  id="departmentName"
                  placeholder="City Fire Department"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departmentType">Department Type</Label>
                <Select onValueChange={setDepartmentType}>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactName">Primary Contact *</Label>
                <Input
                  id="contactName"
                  placeholder="Chief John Smith"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="(555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Your Plan: {selectedPlan === 'pilot' ? 'Pilot 90 (Free Trial)' : selectedPlan}</h4>
              <p className="text-sm text-green-700">
                {selectedPlan === 'pilot' 
                  ? 'You\'ll have 90 days to test FireGauge with your equipment at no cost.'
                  : 'You can upgrade or downgrade your plan anytime from your account settings.'
                }
              </p>
            </div>

            <Button
              className="w-full bg-firegauge-red hover:bg-firegauge-red/90"
              disabled={isLoading}
              onClick={handleDepartmentSetup}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Continue Setup
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                * Required fields
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Completion
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-firegauge-charcoal">
            Welcome to FireGauge! 🎉
          </CardTitle>
          <CardDescription>
            Your account is ready. Time to start managing your fire equipment like a pro.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">What's next?</h4>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              <li>• Add your first piece of equipment</li>
              <li>• Set up your testing schedule</li>
              <li>• Invite team members</li>
              <li>• Explore the mobile app</li>
            </ul>
          </div>

          <Button
            className="w-full bg-firegauge-red hover:bg-firegauge-red/90"
            onClick={handleComplete}
          >
            <Rocket className="mr-2 h-4 w-4" />
            Launch FireGauge
          </Button>
          
          <p className="text-xs text-gray-500">
            Need help? Email us at <a href="mailto:support@firegauge.app" className="text-firegauge-red hover:underline">support@firegauge.app</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingWizard; 
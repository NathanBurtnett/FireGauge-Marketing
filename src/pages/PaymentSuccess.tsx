import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, ArrowRight, Mail } from "lucide-react";
import { trackingHelpers, analytics } from '../lib/analytics';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showAccountInfo, setShowAccountInfo] = useState(false);
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) return;

    // Track successful conversion
    trackingHelpers.trackSignupComplete('Pro', 99);

    // Test mode to bypass delay (e.g., /payment-success?session_id=...&test=1)
    const isTest = searchParams.get('test') === '1';
    if (isTest) {
      setShowAccountInfo(true);
      return;
    }

    const timer = setTimeout(() => setShowAccountInfo(true), 2000);
    return () => clearTimeout(timer);
  }, [sessionId, searchParams]);

  const handleOnboardingRedirect = () => {
    // Redirect to onboarding wizard for consistent flow
    navigate('/onboarding');
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-firegauge-charcoal to-gray-800">
        <div className="text-center text-white p-8 rounded-lg bg-white/10 backdrop-blur-sm max-w-md mx-4">
          <div className="text-red-400 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 6.5c-.77.833-.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Payment Session Not Found</h1>
          <p className="text-gray-300 mb-6">No payment session found. Please try again.</p>
          <Button 
            asChild
            variant="outline"
            className="w-full border-white text-white hover:bg-white hover:text-firegauge-charcoal"
          >
            <a href="/pricing">Return to Pricing</a>
          </Button>
        </div>
      </div>
    );
  }

  if (!showAccountInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-firegauge-charcoal to-gray-800">
        <div className="text-center text-white p-8 rounded-lg bg-white/10 backdrop-blur-sm max-w-md mx-4">
          <Loader2 className="h-16 w-16 text-firegauge-accent mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-gray-300 mb-6">
            Setting up your FireGauge account...
          </p>
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-sm text-gray-300">
              This will only take a moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-firegauge-charcoal to-gray-800">
      <div className="text-center text-white p-8 rounded-lg bg-white/10 backdrop-blur-sm max-w-lg mx-4">
        <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-gray-300 mb-6">
          Welcome to FireGauge! Your payment has been processed successfully. 
          Let's complete your account setup and get you started.
        </p>
        
        <div className="bg-white/20 rounded-lg p-4 mb-6">
          <Mail className="h-8 w-8 text-firegauge-accent mx-auto mb-2" />
          <p className="text-sm text-gray-300 mb-2">
            <strong>Next Step:</strong> Complete your department setup and create your admin account.
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleOnboardingRedirect}
            className="w-full bg-firegauge-red hover:bg-firegauge-red/90 text-white"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Continue to Setup
          </Button>
          
          <p className="text-xs text-gray-400">
            We'll guide you through setting up your department and creating your administrator account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 
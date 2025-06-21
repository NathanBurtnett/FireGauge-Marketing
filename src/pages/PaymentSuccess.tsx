import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { emailService, ContactData } from '../lib/emailService';
import { trackingHelpers, analytics } from '../lib/analytics';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [isCreatingAccount, setIsCreatingAccount] = useState(true);
  const [accountCreated, setAccountCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError('No payment session found. Please try again.');
      setIsCreatingAccount(false);
      return;
    }

    // Create account via API after successful payment
    const createAccount = async () => {
      try {
        const response = await fetch('/api/create-account-after-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: sessionId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create account');
        }

        const { accountId, loginUrl, userEmail, planType, transactionValue } = await response.json();
        
        // Track successful conversion
        trackingHelpers.trackSignupComplete(planType || 'Pro', transactionValue || 99);
        
        // Identify user in analytics
        analytics.identifyUser({
          userId: accountId,
          email: userEmail,
          planType: planType,
          signupDate: new Date().toISOString()
        });
        
        // Trigger welcome email sequence
        try {
          const contactData: ContactData = {
            email: userEmail || 'user@example.com',
            firstName: 'New', // This would be collected during payment
            lastName: 'User',
            planType: planType || 'Pro',
            signupDate: new Date().toISOString()
          };

          // Trigger signup email sequence
          await emailService.triggerEmailSequence('signup', contactData);
          
          // Add contact to SendGrid marketing lists
          await emailService.addContactToList(contactData, ['new-signups']);
        } catch (emailError) {
          console.error('Welcome email error:', emailError);
          // Don't block the user flow if email fails
        }

        setAccountCreated(true);
        setIsCreatingAccount(false);

        // Redirect to onboarding wizard after 3 seconds
        setTimeout(() => {
          window.location.href = `/onboarding?session_id=${sessionId}`;
        }, 3000);

      } catch (error) {
        console.error('Account creation error:', error);
        setError('Failed to create your account. Please contact support.');
        setIsCreatingAccount(false);
      }
    };

    createAccount();
  }, [sessionId]);

  const handleManualRedirect = () => {
    window.location.href = `/onboarding?session_id=${sessionId}`;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-firegauge-charcoal to-gray-800">
        <div className="text-center text-white p-8 rounded-lg bg-white/10 backdrop-blur-sm max-w-md mx-4">
          <div className="text-red-400 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 6.5c-.77.833-.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Something Went Wrong</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-3">
            <Button 
              asChild
              className="w-full bg-firegauge-red hover:bg-firegauge-red/90 text-white"
            >
              <a href="mailto:support@firegauge.app">Contact Support</a>
            </Button>
            <Button 
              asChild
              variant="outline"
              className="w-full border-white text-white hover:bg-white hover:text-firegauge-charcoal"
            >
              <a href="/">Return to Home</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isCreatingAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-firegauge-charcoal to-gray-800">
        <div className="text-center text-white p-8 rounded-lg bg-white/10 backdrop-blur-sm max-w-md mx-4">
          <Loader2 className="h-16 w-16 text-firegauge-accent mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold mb-4">Setting Up Your Account</h1>
          <p className="text-gray-300 mb-6">
            Payment successful! We're creating your FireGauge account now...
          </p>
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-sm text-gray-300">
              This may take a few moments. Please don't close this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-firegauge-charcoal to-gray-800">
      <div className="text-center text-white p-8 rounded-lg bg-white/10 backdrop-blur-sm max-w-md mx-4">
        <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Welcome to FireGauge!</h1>
        <p className="text-gray-300 mb-6">
          Your account has been created successfully. You'll be redirected to complete your setup in a few seconds...
        </p>
        <Button 
          onClick={handleManualRedirect}
          className="w-full bg-firegauge-red hover:bg-firegauge-red/90 text-white"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Continue Setup
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccess; 
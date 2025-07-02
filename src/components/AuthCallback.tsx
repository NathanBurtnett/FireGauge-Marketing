import React, { useEffect, useState } from 'react';
import { useAuth } from './providers/AuthProvider';
import { useNavigate } from 'react-router-dom';

// Debug component to handle authentication callbacks
export const AuthCallback: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    // Capture debug information
    const currentUrl = window.location.href;
    const currentHash = window.location.hash;
    const hasAccessToken = currentUrl.includes('access_token=') || currentHash.includes('access_token=');
    const hasMagicLink = currentUrl.includes('type=magiclink') || currentHash.includes('type=magiclink');
    const hasStripeSession = currentUrl.includes('session_id=');
    const isRootWithTokens = window.location.pathname === '/' && (hasAccessToken || hasMagicLink);
    
    console.log('🔍 AuthCallback Debug:', {
      currentUrl,
      currentHash,
      pathname: window.location.pathname,
      hasAccessToken,
      hasMagicLink,
      hasStripeSession,
      isRootWithTokens,
      user: user ? { id: user.id, email: user.email } : null,
      loading,
      timestamp: new Date().toISOString()
    });
    
    setDebugInfo({
      currentUrl,
      currentHash,
      pathname: window.location.pathname,
      hasAccessToken,
      hasMagicLink,
      hasStripeSession,
      isRootWithTokens,
      user: user ? { id: user.id, email: user.email } : null,
      loading,
      timestamp: new Date().toISOString()
    });

    // Priority 1: Don't interfere with Stripe payment success flow
    if (hasStripeSession) {
      console.log('💳 Stripe session detected, letting PaymentSuccess handle routing...');
      return;
    }

    // Priority 2: Handle magic link auth on root page
    if (isRootWithTokens && !loading && !hasStripeSession) {
      console.log('🔄 Detected magic link callback on root page, redirecting to onboarding...');
      
      // Use navigate for better React Router integration
      navigate('/onboarding', { replace: true });
      return;
    }

    // Priority 3: Handle authenticated user on root with tokens (fallback)
    if ((hasAccessToken || hasMagicLink) && user && !loading && window.location.pathname === '/' && !hasStripeSession) {
      console.log('✅ Magic link authentication successful, redirecting to onboarding...');
      
      // Use navigate for better React Router integration
      navigate('/onboarding', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show debug info for troubleshooting
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed top-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50 opacity-90">
        <h3 className="font-bold mb-2">🔍 Auth Debug</h3>
        <pre className="text-xs overflow-auto max-h-40">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    );
  }

  return null;
};

export default AuthCallback; 
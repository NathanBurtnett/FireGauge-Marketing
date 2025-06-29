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
    const hasAccessToken = currentUrl.includes('access_token=');
    const hasMagicLink = currentUrl.includes('type=magiclink');
    
    setDebugInfo({
      currentUrl,
      hasAccessToken,
      hasMagicLink,
      user: user ? { id: user.id, email: user.email } : null,
      loading,
      timestamp: new Date().toISOString()
    });

    // If we have authentication tokens and user is authenticated, redirect
    if ((hasAccessToken || hasMagicLink) && user && !loading) {
      console.log('✅ Magic link authentication successful, redirecting to onboarding...');
      
      // Clean up URL and redirect
      window.history.replaceState({}, document.title, '/onboarding');
      navigate('/onboarding', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show debug info for troubleshooting
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed top-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
        <h3 className="font-bold mb-2">🔍 Auth Callback Debug</h3>
        <pre className="text-xs overflow-auto max-h-40">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    );
  }

  return null;
};

export default AuthCallback; 
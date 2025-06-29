import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const AuthCallbackHandler: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processing authentication callback...');
        
        // Get the current URL and hash
        const currentUrl = window.location.href;
        const currentHash = window.location.hash;
        
        console.log('📍 Current URL:', currentUrl);
        console.log('📍 Current Hash:', currentHash);
        
        // Check if we have auth tokens
        const hasAccessToken = currentUrl.includes('access_token=') || currentHash.includes('access_token=');
        const hasMagicLink = currentUrl.includes('type=magiclink') || currentHash.includes('type=magiclink');
        
        if (hasAccessToken && hasMagicLink) {
          setStatus('Authentication successful! Redirecting to onboarding...');
          console.log('✅ Auth tokens detected, processing session...');
          
          // Let Supabase handle the session
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('❌ Session error:', error);
            setStatus('Authentication error. Redirecting to home...');
            setTimeout(() => navigate('/'), 2000);
            return;
          }
          
          if (data.session) {
            console.log('✅ Session established:', data.session.user.email);
            setStatus('Welcome! Redirecting to onboarding...');
            
            // Clean URL and redirect to onboarding
            window.history.replaceState({}, document.title, '/onboarding');
            setTimeout(() => navigate('/onboarding', { replace: true }), 1000);
          } else {
            console.log('⚠️ No session found, redirecting to home...');
            setStatus('No session found. Redirecting to home...');
            setTimeout(() => navigate('/'), 2000);
          }
        } else {
          console.log('⚠️ No auth tokens found, redirecting to home...');
          setStatus('No authentication tokens found. Redirecting to home...');
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (error) {
        console.error('❌ Auth callback error:', error);
        setStatus('Authentication error. Redirecting to home...');
        setTimeout(() => navigate('/'), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-firegauge-charcoal to-gray-800">
      <div className="text-center text-white p-8 rounded-lg bg-white/10 backdrop-blur-sm max-w-md mx-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-firegauge-accent mx-auto mb-6" />
        <h1 className="text-xl font-semibold mb-4">🔥 FireGauge</h1>
        <p className="text-gray-300">{status}</p>
      </div>
    </div>
  );
};

export default AuthCallbackHandler; 
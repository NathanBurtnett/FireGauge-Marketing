import { useState, useCallback, useEffect } from 'react';
// Re-use the singleton Supabase client used across the app to avoid creating
// a new connection (and thereby new auth listeners) on every hook invocation.
import { supabase } from '@/lib/supabase';
import { toast } from "@/components/ui/sonner";
import { useAuth } from '@/components/providers/AuthProvider';

export type SubscriptionStatus = {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  isLoading: boolean;
  error: string | null;
  retryCount?: number;
};

// Global cache for subscription status - 60 seconds cache for better billing page performance
let globalSubscriptionCache: SubscriptionStatus | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

// Global promise to prevent multiple simultaneous checks
let globalCheckPromise: Promise<any> | null = null;

// Reduced timeouts for faster loading - AGGRESSIVE FALLBACK
const SUBSCRIPTION_TIMEOUT = 10000; // Increased from default to 10 seconds
const CHECKOUT_TIMEOUT = 15000; // Increased from default to 15 seconds
const RETRY_DELAY = 2000;
const MAX_RETRY_ATTEMPTS = 1; // Reduced retries to prevent spam

// Emergency fallback mode for development when edge functions are failing
const EMERGENCY_FALLBACK_MODE = false; // Set to false when edge functions are working

export const useSubscription = () => {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: true, // Default to subscribed (free tier) to prevent hanging
    subscription_tier: 'price_1RSqV400HE2ZS1pmK1uKuTCe', // Default to free tier
    subscription_end: null,
    isLoading: false, // Start with loading false to prevent hanging
    error: null,
    retryCount: 0,
  });
  const [isCheckingInternal, setIsCheckingInternal] = useState(false);

  const checkSubscription = useCallback(async (retryAttempt = 0) => {
    // Emergency fallback mode - skip edge function calls when they're failing
    if (EMERGENCY_FALLBACK_MODE) {
      console.log("useSubscription: Emergency fallback mode enabled - returning free tier subscription");
      const emergencyFallbackStatus = {
        subscribed: true,
        subscription_tier: 'price_1RSqV400HE2ZS1pmK1uKuTCe', // Pilot 90 - Free tier
        subscription_end: null,
        isLoading: false,
        error: null,
        retryCount: 0,
      };
      setStatus(emergencyFallbackStatus);
      globalSubscriptionCache = emergencyFallbackStatus;
      cacheTimestamp = Date.now();
      return;
    }

    if (!user) {
      console.log("useSubscription: checkSubscription - No user, setting not subscribed");
      const noUserStatus = {
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        isLoading: false,
        error: null,
        retryCount: retryAttempt,
      };
      setStatus(noUserStatus);
      return;
    }

    // Check cache first - more aggressive caching for billing page
    if (globalSubscriptionCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
      console.log("useSubscription: checkSubscription - Using cached subscription status");
      setStatus(globalSubscriptionCache);
      return;
    }

    // Check if there's already a subscription check in progress
    if (globalCheckPromise) {
      try {
        await globalCheckPromise;
      } catch (e) {
        // Ignore errors from concurrent checks
      }
      return;
    }

    setIsCheckingInternal(true);
    
    globalCheckPromise = (async () => {
      try {
        console.log(`useSubscription: checkSubscription - Starting subscription check (attempt ${retryAttempt + 1}/${MAX_RETRY_ATTEMPTS + 1})`);
        
        const { data, error } = await Promise.race([
          supabase.functions.invoke('check-subscription', {}),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Subscription check timeout')), SUBSCRIPTION_TIMEOUT)
          )
        ]) as any;

        console.log("useSubscription: checkSubscription - Response:", { data, error });

        if (error) {
          console.error("useSubscription: checkSubscription - Error details:", {
            message: error.message,
            status: error.status,
            statusText: error.statusText,
            context: error.context,
            name: error.name
          });
          
          // Handle specific HTTP status codes
          if (error.status === 500) {
            console.error("useSubscription: checkSubscription - 500 Internal Server Error - likely edge function deployment issue");
          } else if (error.status === 401) {
            console.error("useSubscription: checkSubscription - 401 Unauthorized - authentication issue");
          } else if (error.status === 404) {
            console.error("useSubscription: checkSubscription - 404 Not Found - edge function not deployed");
          }
          
          throw error;
        }

        if (!data) {
          console.error("useSubscription: checkSubscription - No data in response");
          throw new Error('No data received from subscription check');
        }

        const subscriptionStatus = {
          subscribed: data.subscribed || false,
          subscription_tier: data.subscription_tier || null,
          subscription_end: data.subscription_end || null,
          isLoading: false,
          error: null,
          retryCount: retryAttempt,
        };

        console.log("useSubscription: checkSubscription - Setting status:", subscriptionStatus);
        setStatus(subscriptionStatus);
        
        // Cache the result
        globalSubscriptionCache = subscriptionStatus;
        cacheTimestamp = Date.now();
        
      } catch (err: any) {
        console.error("useSubscription: checkSubscription - Caught error:", err);
        
        // Handle timeout specifically
        if (err instanceof Error && err.message === 'Subscription check timeout') {
          console.warn("useSubscription: checkSubscription - Subscription check timed out, falling back to free tier");
          // Fallback to free tier immediately on timeout
          const timeoutFallbackStatus = {
            subscribed: true,
            subscription_tier: 'price_1RSqV400HE2ZS1pmK1uKuTCe', // Pilot 90 - Free tier
            subscription_end: null,
            isLoading: false,
            error: null,
            retryCount: retryAttempt,
          };
          setStatus(timeoutFallbackStatus);
          globalSubscriptionCache = timeoutFallbackStatus;
          cacheTimestamp = Date.now();
          return;
        }
        
        // Retry logic for caught errors
        if (retryAttempt < MAX_RETRY_ATTEMPTS) {
          console.log(`useSubscription: Retrying after error in ${RETRY_DELAY}ms (attempt ${retryAttempt + 1}/${MAX_RETRY_ATTEMPTS})`);
          setTimeout(() => checkSubscription(retryAttempt + 1), RETRY_DELAY);
          return;
        }
        
        // Fallback to free tier after max retries
        const errorFallbackStatus = {
          subscribed: true,
          subscription_tier: 'price_1RSqV400HE2ZS1pmK1uKuTCe', // Pilot 90 - Free tier
          subscription_end: null,
          isLoading: false,
          error: null, // Don't show error to user, just fallback gracefully
          retryCount: retryAttempt,
        };
        setStatus(errorFallbackStatus);
        globalSubscriptionCache = errorFallbackStatus;
        cacheTimestamp = Date.now();
      }
    })();

    try {
      await globalCheckPromise;
    } finally {
      setIsCheckingInternal(false);
      globalCheckPromise = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // isCheckingInternal intentionally excluded to prevent infinite loops

  const createCheckoutSession = async (priceId: string) => {
    console.log("useSubscription: createCheckoutSession called for priceId:", priceId);
    
    // Emergency fallback mode - show message instead of failing
    if (EMERGENCY_FALLBACK_MODE) {
      console.log("useSubscription: Emergency fallback mode - checkout disabled");
      toast.error("Checkout temporarily unavailable", {
        description: "Edge functions are being deployed. Please try again in a few minutes.",
      });
      return null;
    }
    
    try {
      if (!user) {
        toast.error("Authentication required", {
          description: "Please sign in to subscribe",
        });
        return null;
      }

      console.log("useSubscription: createCheckoutSession - Invoking create-checkout function...");
      const { data, error } = await Promise.race([
        supabase.functions.invoke('create-checkout', {
          body: { priceId },
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), CHECKOUT_TIMEOUT)
        )
      ]) as any;

      console.log("useSubscription: createCheckoutSession - Response:", { data, error });

      if (error) {
        console.error("useSubscription: createCheckoutSession - Error details:", {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          context: error.context,
          name: error.name
        });
        
        // Handle specific HTTP status codes
        if (error.status === 500) {
          console.error("useSubscription: createCheckoutSession - 500 Internal Server Error - likely edge function deployment issue");
        } else if (error.status === 401) {
          console.error("useSubscription: createCheckoutSession - 401 Unauthorized - authentication issue");
        } else if (error.status === 404) {
          console.error("useSubscription: createCheckoutSession - 404 Not Found - edge function not deployed");
        }
        
        toast.error("Error creating checkout session", {
          description: error.message || "Please try again later.",
        });
        return null;
      }

      if (!data?.url) {
        console.error("useSubscription: createCheckoutSession - No URL in response");
        toast.error("Invalid response", {
          description: "No checkout URL received. Please try again.",
        });
        return null;
      }

      console.log("useSubscription: createCheckoutSession - Success, returning URL:", data.url);
      return data.url;
    } catch (err) {
      console.error("useSubscription: createCheckoutSession - Caught error:", err);
      if (err instanceof Error && err.message === 'Request timeout') {
        toast.error("Request timed out", {
          description: "The checkout process is taking too long. Please try again.",
        });
      } else {
        toast.error("Failed to create checkout session", {
          description: "Please try again later.",
        });
      }
      return null;
    }
  };

  const openCustomerPortal = async () => {
    console.log("useSubscription: openCustomerPortal called");
    try {
      if (!user) {
        toast.error("Authentication required", {
          description: "Please sign in to manage your subscription",
        });
        return null;
      }

      // Add timeout for customer portal as well
      const { data, error } = await Promise.race([
        supabase.functions.invoke('customer-portal', {}),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Portal request timeout')), 5000)
        )
      ]) as any;
      
      if (error) {
        console.error("useSubscription: openCustomerPortal - Error:", error);
        toast.error("Error opening customer portal", {
          description: error.message || "Please try again later.",
        });
        return null;
      }

      if (!data?.url) {
        console.error("useSubscription: openCustomerPortal - No URL in response");
        toast.error("Invalid response", {
          description: "No portal URL received. Please try again.",
        });
        return null;
      }

      return data.url;
    } catch (err) {
      console.error("useSubscription: openCustomerPortal - Caught error:", err);
      if (err instanceof Error && err.message === 'Portal request timeout') {
        toast.error("Request timed out", {
          description: "The portal is taking too long to load. Please try again.",
        });
      } else {
        toast.error("Failed to open customer portal", {
          description: "Please try again later.",
        });
      }
      return null;
    }
  };

  useEffect(() => {
    console.log("useSubscription: useEffect triggered. User from useAuth:", user, "AuthLoading state:", authLoading);
    
    // Wait for auth to finish loading before starting subscription check
    if (!authLoading) {
      if (user) {
        console.log("useSubscription: useEffect - Auth is loaded and user exists. Setting immediate fallback and calling checkSubscription.");
        
        // Check if we already have cached data for this user
        const now = Date.now();
        if (globalSubscriptionCache && (now - cacheTimestamp < CACHE_DURATION)) {
          console.log("useSubscription: Using cached subscription data");
          setStatus(globalSubscriptionCache);
          return;
        }
        
        // Set immediate fallback to prevent hanging
        const immediateFallback = {
          subscribed: true,
          subscription_tier: 'price_1RSqV400HE2ZS1pmK1uKuTCe', // Free tier
          subscription_end: null,
          isLoading: false,
          error: null,
          retryCount: 0,
        };
        setStatus(immediateFallback);
        
        // Then try to get real subscription data with very short timeout
        const timeoutId = setTimeout(() => {
          checkSubscription(0);
        }, 100); // Increased from 50ms to 100ms for stability
        return () => clearTimeout(timeoutId);
      } else {
        console.log("useSubscription: useEffect - Auth is loaded but NO user. Setting subscription status to not subscribed, loading false.");
        // Clear cache when user logs out
        globalSubscriptionCache = null;
        cacheTimestamp = 0;
        globalCheckPromise = null;
        
        const loggedOutStatus = {
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          isLoading: false, 
          error: null,
          retryCount: 0,
        };
        setStatus(loggedOutStatus);
      }
    }
  }, [user?.id, authLoading]); // Only depend on user.id and authLoading, not the full user object

  // Export function to clear cache (useful for logout)
  const clearSubscriptionCache = useCallback(() => {
    globalSubscriptionCache = null;
    cacheTimestamp = 0;
    globalCheckPromise = null;
  }, []);

  return {
    ...status,
    checkSubscription: () => checkSubscription(0),
    createCheckoutSession,
    openCustomerPortal,
    clearSubscriptionCache,
  };
};

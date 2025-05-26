
import { useState, useEffect } from "react";
import { supabase } from "../../integrations/supabase/client";
import { toast } from "../ui/sonner";
import { useAuth } from "../providers/AuthProvider";

export type SubscriptionStatus = {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  isLoading: boolean;
  error: string | null;
};

export const useSubscription = () => {
  console.log("useSubscription: Hook initialized");
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    isLoading: true,
    error: null,
  });

  const checkSubscription = async () => {
    console.log("useSubscription: checkSubscription() called. Current user:", user);
    if (!user) {
      console.log("useSubscription: checkSubscription - No user, setting status to not subscribed, loading false.");
      setStatus({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        isLoading: false,
        error: null
      });
      return;
    }

    console.log("useSubscription: checkSubscription - User exists, proceeding to invoke function.");
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log("useSubscription: checkSubscription - Invoking 'check-subscription' function...");
      const { data, error: functionError } = await supabase.functions.invoke('check-subscription', {});
      console.log("useSubscription: checkSubscription - 'check-subscription' function response:", { data, functionError });
      
      if (functionError) {
        console.error("useSubscription: checkSubscription - Error from invoking function:", functionError);
        setStatus({
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          isLoading: false,
          error: functionError.message || "Failed to check subscription status",
        });
        return;
      }
      
      console.log("useSubscription: checkSubscription - Success from function. Setting status with data:", data);
      setStatus({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || data.plan_id || null,
        subscription_end: data.subscription_end || data.current_period_end || null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("useSubscription: checkSubscription - Caught error during function invocation:", err);
      setStatus({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        isLoading: false,
        error: errorMessage,
      });
    }
  };

  const createCheckoutSession = async (priceId: string) => {
    console.log("useSubscription: createCheckoutSession called for priceId:", priceId);
    try {
      if (!user) {
        toast.error("Authentication required", {
          description: "Please sign in to subscribe",
        });
        return null;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });

      if (error) {
        toast.error("Error creating checkout session", {
          description: error.message || "Please try again later.",
        });
        return null;
      }

      return data.url;
    } catch (err) {
      console.error("Error creating checkout session:", err);
      toast.error("Failed to create checkout session", {
        description: "Please try again later.",
      });
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

      const { data, error } = await supabase.functions.invoke('customer-portal', {});
      
      if (error) {
        toast.error("Error opening customer portal", {
          description: error.message || "Please try again later.",
        });
        return null;
      }

      return data.url;
    } catch (err) {
      console.error("Error opening customer portal:", err);
      toast.error("Failed to open customer portal", {
        description: "Please try again later.",
      });
      return null;
    }
  };

  useEffect(() => {
    console.log("useSubscription: useEffect triggered. User from useAuth:", user, "AuthLoading state:", authLoading);
    if (!authLoading) {
      if (user) {
        console.log("useSubscription: useEffect - Auth is loaded and user exists. Calling checkSubscription.");
        checkSubscription();
      } else {
        console.log("useSubscription: useEffect - Auth is loaded but NO user. Setting subscription status to not subscribed, loading false.");
        setStatus({
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          isLoading: false, 
          error: null
        });
      }
    }
  }, [user, authLoading]);

  return {
    ...status,
    checkSubscription,
    createCheckoutSession,
    openCustomerPortal,
  };
};

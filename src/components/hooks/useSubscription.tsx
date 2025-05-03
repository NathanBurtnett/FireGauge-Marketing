
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/components/providers/AuthProvider";

export type SubscriptionStatus = {
  subscribed: boolean;
  subscription_tier: string | null;
  season_status: "in-season" | "off-season" | null;
  subscription_end: string | null;
  isLoading: boolean;
  error: string | null;
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    subscription_tier: null,
    season_status: null,
    subscription_end: null,
    isLoading: true,
    error: null,
  });

  const checkSubscription = async () => {
    try {
      if (!user) {
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          error: "User not authenticated"
        }));
        return;
      }

      setStatus(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {});
      
      if (error) {
        console.error("Error checking subscription status:", error);
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || "Failed to check subscription status",
        }));
        return;
      }
      
      setStatus({
        subscribed: data.subscribed,
        subscription_tier: data.subscription_tier,
        season_status: data.season_status || "off-season",
        subscription_end: data.subscription_end,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Error in useSubscription hook:", err);
      
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const createCheckoutSession = async (plan: string, seasonStatus = "in-season") => {
    try {
      if (!user) {
        toast.error("Authentication required", {
          description: "Please sign in to subscribe",
        });
        return null;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan, seasonStatus },
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
    if (user) {
      checkSubscription();
    } else {
      setStatus(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  return {
    ...status,
    checkSubscription,
    createCheckoutSession,
    openCustomerPortal,
  };
};

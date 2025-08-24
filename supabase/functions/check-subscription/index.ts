import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

/**
 * Extract user ID from JWT token
 */
const extractUserIdFromToken = (authHeader: string): string | null => {
  try {
    if (!authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
};

/**
 * Make raw fetch request to Supabase REST API
 */
const fetchFromSupabase = async (endpoint: string, authHeader: string): Promise<any> => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
    method: 'GET',
    headers: {
      'apikey': supabaseKey,
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    logStep("Starting subscription check");

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No authorization header found");
      return new Response(
        JSON.stringify({ 
          subscribed: false, 
          subscription_tier: null, 
          subscription_end: null,
          error: "Authentication required" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        },
      );
    }

    // Extract user ID from token
    const userId = extractUserIdFromToken(authHeader);
    if (!userId) {
      logStep("Failed to extract user ID from token");
      return new Response(
        JSON.stringify({ 
          subscribed: false, 
          subscription_tier: null, 
          subscription_end: null,
          error: "Invalid authentication token" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        },
      );
    }

    logStep("Checking subscription for user", { userId });

    // First, check if user record exists using raw fetch
    try {
      const userData = await fetchFromSupabase(
        `user?supabase_auth_user_id=eq.${userId}&select=tenant_id`,
        authHeader
      );

      logStep("User data fetched", { userCount: userData?.length });

      // If no user record exists, return neutral non-subscribed state
      if (!userData || userData.length === 0) {
        logStep("No user record found, returning neutral subscription state");
        return new Response(
          JSON.stringify({ 
            subscribed: false,
            subscription_tier: null,
            subscription_end: null,
            plan_id: null,
            current_period_end: null
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      }

      const userRecord = userData[0];
      const tenantId = userRecord.tenant_id;

      logStep("User record found", { tenantId });

      // Check for active subscription using raw fetch
      try {
        const subscriptionData = await fetchFromSupabase(
          `subscriptions?tenant_id=eq.${tenantId}&status=eq.active&select=stripe_price_id,status,current_period_end,stripe_subscription_id,stripe_customer_id&order=created_at.desc&limit=1`,
          authHeader
        );

        logStep("Subscription data fetched", { subscriptionCount: subscriptionData?.length });

        // If no active subscription found, return neutral non-subscribed
        if (!subscriptionData || subscriptionData.length === 0) {
          logStep("No active subscription found in database, returning neutral state");
          return new Response(
            JSON.stringify({ 
              subscribed: false,
              subscription_tier: null,
              subscription_end: null,
              plan_id: null,
              current_period_end: null
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            },
          );
        }

        // Return active subscription data
        const subscription = subscriptionData[0];
        const priceId = subscription.stripe_price_id;
        const currentPeriodEnd = subscription.current_period_end;

        logStep("Returning active subscription", { priceId, currentPeriodEnd });

        return new Response(
          JSON.stringify({
            subscribed: true,
            subscription_tier: priceId,
            subscription_end: currentPeriodEnd,
            plan_id: priceId,
            current_period_end: currentPeriodEnd,
            stripe_subscription_id: subscription.stripe_subscription_id,
            stripe_customer_id: subscription.stripe_customer_id
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );

      } catch (subscriptionError) {
        logStep("Error fetching subscription", { error: subscriptionError.message });
        // Return neutral state if subscription lookup fails
        return new Response(
          JSON.stringify({ 
            subscribed: false,
            subscription_tier: null,
            subscription_end: null,
            plan_id: null,
            current_period_end: null
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      }

    } catch (userError) {
      logStep("Error fetching user record", { error: userError.message });
      // Return neutral state if user lookup fails
      return new Response(
        JSON.stringify({ 
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          plan_id: null,
          current_period_end: null
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

  } catch (error) {
    logStep("Unexpected error in check-subscription", { error: error.message });
    return new Response(
      JSON.stringify({ 
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        plan_id: null,
        current_period_end: null,
        error: "Internal server error" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 with free tier instead of 500
      },
    );
  }
});

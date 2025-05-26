
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    if (!supabaseServiceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
    if (!supabaseUrl) throw new Error("SUPABASE_URL is not set.");

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.45.0");
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false } 
    });

    const { data: authUserData, error: authUserError } = await supabase.auth.getUser(token);
    
    if (authUserError) throw new Error(`Authentication error: ${authUserError.message}`);
    const authUser = authUserData.user;
    if (!authUser?.id) throw new Error("User not authenticated or ID not available");
    logStep("User authenticated via Supabase Auth", { userId: authUser.id });

    // Get user profile to find tenant_id
    const { data: userProfile, error: userError } = await supabase
      .from('user')
      .select('tenant_id, role')
      .eq('supabase_auth_user_id', authUser.id)
      .maybeSingle();

    if (userError) {
      logStep("Error fetching user from public.user table", { error: userError.message });
      throw new Error(`Could not retrieve user details: ${userError.message}`);
    }
    
    if (!userProfile || userProfile.tenant_id === null || userProfile.tenant_id === undefined) {
      logStep("User not found in public.user table or tenant_id is missing", { supabase_auth_user_id: authUser.id });
      return new Response(JSON.stringify({ subscribed: false, error: "User not associated with a tenant." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }
    
    const tenantId = userProfile.tenant_id;
    logStep("Fetched tenant_id for user", { userId: authUser.id, tenantId });

    // Check for active subscriptions
    const activeSubscriptionStatuses = ['active', 'trialing']; 

    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('tenant_id', tenantId)
      .in('status', activeSubscriptionStatuses)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscriptionError) {
      logStep("Error fetching subscription from public.subscriptions table", { error: subscriptionError.message });
      throw new Error(`Could not retrieve subscription details: ${subscriptionError.message}`);
    }

    if (subscriptionData) {
      logStep("Active subscription found in DB for tenant", { tenantId, subscriptionId: subscriptionData.id, status: subscriptionData.status });
      return new Response(JSON.stringify({
        subscribed: true,
        status: subscriptionData.status,
        plan_id: subscriptionData.stripe_price_id,
        current_period_end: subscriptionData.current_period_end,
        subscription_tier: subscriptionData.stripe_price_id,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      logStep("No active subscription found in DB for tenant", { tenantId });
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[CHECK-SUBSCRIPTION] Error: ${errorMessage}`);
    
    return new Response(JSON.stringify({ error: errorMessage, subscribed: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

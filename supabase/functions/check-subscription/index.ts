import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
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
    
    // Supabase client for fetching user and then subscription details
    // Using SERVICE_ROLE_KEY to ensure we can read user and subscription tables
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

    // Get the user's record from public.user to find their tenant_id
    const { data: publicUserData, error: publicUserError } = await supabase
      .from('user') // Our public.user table
      .select('tenant_id, role') // Include role if needed for other logic, tenant_id is key
      .eq('supabase_auth_user_id', authUser.id)
      .single();

    if (publicUserError) {
      logStep("Error fetching user from public.user table", { error: publicUserError.message });
      throw new Error(`Could not retrieve user details: ${publicUserError.message}`);
    }
    if (!publicUserData || publicUserData.tenant_id === null || publicUserData.tenant_id === undefined) { // Check for null or undefined tenant_id
      logStep("User not found in public.user table or tenant_id is missing", { supabase_auth_user_id: authUser.id });
      // Depending on app logic, you might return { subscribed: false } or throw an error
      return new Response(JSON.stringify({ subscribed: false, error: "User not associated with a tenant." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403, // Or 200 with subscribed: false
      });
    }
    
    const tenantId = publicUserData.tenant_id;
    logStep("Fetched tenant_id for user", { userId: authUser.id, tenantId });

    // Fetch active subscription for the tenant from public.subscriptions table
    // Assuming 'active' and 'trialing' are considered active subscribed states
    const activeSubscriptionStatuses = ['active', 'trialing']; 

    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions') // Our new subscriptions table
      .select('*') // Select all relevant fields: status, current_period_end, stripe_plan_id (or stripe_price_id) etc.
      .eq('tenant_id', tenantId)
      .in('status', activeSubscriptionStatuses) // Check for active or trialing subscriptions
      .order('created_at', { ascending: false }) // Get the latest one if multiple (should ideally be one active per tenant)
      .limit(1)
      .maybeSingle(); // Use maybeSingle as there might be no active subscription

    if (subscriptionError) {
      logStep("Error fetching subscription from public.subscriptions table", { error: subscriptionError.message });
      throw new Error(`Could not retrieve subscription details: ${subscriptionError.message}`);
    }

    if (subscriptionData) {
      logStep("Active subscription found in DB for tenant", { tenantId, subscriptionId: subscriptionData.id, status: subscriptionData.status });
      // You can map stripe_plan_id or stripe_price_id to your plan names (Starter, Growth, Scale) if needed for the response
      // For now, just returning the status and relevant details from the subscription record.
      return new Response(JSON.stringify({
        subscribed: true,
        status: subscriptionData.status, // e.g., "active", "trialing"
        plan_id: subscriptionData.stripe_plan_id || subscriptionData.stripe_price_id, // The Stripe Price ID or Plan ID stored
        current_period_end: subscriptionData.current_period_end,
        // Add other relevant fields from subscriptionData as needed by the frontend
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

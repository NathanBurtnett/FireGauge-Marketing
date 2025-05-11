import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") as string; // Using anon key for auth context
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.45.0");
    
    // Create Supabase client with Authorization header for user context
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");
    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }, // Pass the original auth header
    });
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(); // getUser() now uses the passed token via global headers
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    if (!user) throw new Error("User not authenticated or user data not available"); // Simplified check
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    let customerId = user.user_metadata?.stripe_customer_id as string | undefined;
    logStep("Attempting to retrieve Stripe customer ID from user_metadata", { customerId });

    if (!customerId) {
      // Fallback: If not in metadata, try to find by email (should be rare if create-checkout works)
      logStep("Stripe customer ID not found in metadata, falling back to email lookup.");
      if (!user.email) {
        throw new Error("User email is not available for Stripe customer lookup.");
      }
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length === 0) {
        throw new Error("No Stripe customer found for this user (checked metadata and email).");
      }
      customerId = customers.data[0].id;
      logStep("Found Stripe customer by email", { customerId });
      // Optional: consider updating user_metadata here too if found by email and not in metadata
    } else {
      // Verify the customer from metadata actually exists in Stripe
      try {
        const customerFromStripe = await stripe.customers.retrieve(customerId);
        if (customerFromStripe.deleted) {
          logStep("Customer from metadata was deleted in Stripe. Cannot open portal.", { customerId });
          throw new Error("Associated Stripe customer has been deleted.");
        }
        logStep("Successfully verified customer from metadata with Stripe.", { customerId });
      } catch (stripeError) {
        logStep("Failed to retrieve/verify customer from metadata with Stripe.", { customerId, error: stripeError.message });
        // Depending on the error, you might allow fallback to email or throw.
        // For now, if metadata customerId is invalid, we error out.
        throw new Error("Could not verify Stripe customer from user metadata.");
      }
    }
    
    const origin = req.headers.get("origin") || "http://localhost:5173"; // Or your production URL
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/billing`,
    });
    
    logStep("Customer portal session created", { sessionId: portalSession.id, url: portalSession.url });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

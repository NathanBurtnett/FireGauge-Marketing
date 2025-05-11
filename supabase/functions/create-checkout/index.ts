import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
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
    
    const { priceId } = await req.json();
    logStep("Request data", { priceId });
    
    if (!priceId) {
      throw new Error("priceId is required");
    }
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    // Extract token
    const token = authHeader.replace("Bearer ", "");
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.45.0");
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    
    // Fetch user details, including user_metadata
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    let customerId = user.user_metadata?.stripe_customer_id as string | undefined;
    
    if (customerId) {
      logStep("Found existing Stripe customer ID in user metadata", { customerId });
      // Optional: Verify customer exists in Stripe to prevent issues if metadata is stale
      try {
        const customerFromStripe = await stripe.customers.retrieve(customerId);
        if (customerFromStripe.deleted) {
          logStep("Customer was deleted in Stripe, will create a new one.", { customerId });
          customerId = undefined; // Treat as if not found
        }
      } catch (stripeError) {
        logStep("Failed to retrieve customer from Stripe, will create a new one.", { customerId, error: stripeError.message });
        customerId = undefined; // Treat as if not found
      }
    }

    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing customer by email in Stripe", { customerId });
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            supabase_user_id: user.id, // Use supabase_user_id for clarity
          },
        });
        customerId = customer.id;
        logStep("Created new customer in Stripe", { customerId });
      }
      
      // Save the Stripe customer ID to Supabase user_metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { stripe_customer_id: customerId },
      });
      if (updateError) {
        logStep("Error updating user metadata with Stripe customer ID", { error: updateError.message });
        // Non-fatal for checkout creation, but log it.
      } else {
        logStep("Successfully updated user metadata with Stripe customer ID", { customerId });
      }
    }
    
    const origin = req.headers.get("origin") || "http://localhost:5173";
    
    const sessionMetadata: { [key: string]: string | number } = {
      supabase_user_id: user.id, // Use supabase_user_id
      stripe_price_id: priceId, // Store the chosen Stripe Price ID
    };
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/billing?success=true`,
      cancel_url: `${origin}/billing?canceled=true`,
      metadata: sessionMetadata,
    });
    
    logStep("Created checkout session", { sessionId: session.id, url: session.url });
    
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[CREATE-CHECKOUT] Error: ${errorMessage}`);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

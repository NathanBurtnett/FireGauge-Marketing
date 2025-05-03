
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
    
    const { plan, seasonStatus = "in-season" } = await req.json();
    logStep("Request data", { plan, seasonStatus });
    
    if (!plan) throw new Error("Plan is required");
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    // Extract token
    const token = authHeader.replace("Bearer ", "");
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.45.0");
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });
    
    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
      logStep("Created new customer", { customerId });
    }
    
    // Define plan prices based on the season status and plan
    const prices: Record<string, Record<string, { priceId: string; amount: number }>> = {
      "in-season": {
        "starter": { priceId: "price_in_season_starter", amount: 9900 }, // $99
        "growth": { priceId: "price_in_season_growth", amount: 20000 }, // $200
        "scale": { priceId: "price_in_season_scale", amount: 30000 }, // $300
      },
      "off-season": {
        "starter": { priceId: "price_off_season_starter", amount: 5000 }, // $50
        "growth": { priceId: "price_off_season_growth", amount: 5000 }, // $50
        "scale": { priceId: "price_off_season_scale", amount: 5000 }, // $50
      },
    };
    
    // Get the pricing for the selected plan and season
    const pricing = prices[seasonStatus][plan.toLowerCase()];
    if (!pricing) throw new Error(`Invalid plan or season status: ${plan}, ${seasonStatus}`);
    
    const origin = req.headers.get("origin") || "http://localhost:5173";
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `FireGauge ${plan} Plan - ${seasonStatus === "in-season" ? "In-Season" : "Off-Season"}`,
              description: `Subscription to FireGauge ${plan} plan during ${seasonStatus === "in-season" ? "testing season" : "off-season"}`,
            },
            unit_amount: pricing.amount, // amount in cents
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/billing?success=true`,
      cancel_url: `${origin}/billing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan,
        season_status: seasonStatus,
      },
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

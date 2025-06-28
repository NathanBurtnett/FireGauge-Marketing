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

const logError = (step: string, error: any) => {
  console.error(`[CREATE-CHECKOUT ERROR] ${step}: ${error.message || error}`);
  if (error.stack) {
    console.error(`[CREATE-CHECKOUT STACK] ${error.stack}`);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    // Check environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logError("Environment check", new Error("STRIPE_SECRET_KEY is not set"));
      return new Response(
        JSON.stringify({ error: "Stripe configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    logStep("Environment variables OK");

    // Parse request body
    const body = await req.json();
    logStep("Request body parsed", { bodyKeys: Object.keys(body) });

    const { priceId, metadata = {} } = body;

    if (!priceId) {
      logError("Validation", new Error("priceId is required"));
      return new Response(
        JSON.stringify({ error: "priceId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Price ID validated", { priceId });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    logStep("Stripe client initialized");

    // Get user info from JWT token (if present)
    let user = null;
    let userEmail = null;
    let isAuthenticatedFlow = false;

    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        logStep("Processing authenticated request");
        
        // Extract user from Supabase JWT
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
        
        if (supabaseUrl && supabaseAnonKey) {
          const jwt = authHeader.split(" ")[1];
          
          // Simple JWT payload extraction (for user ID only)
          // In production, you'd want proper JWT verification
          const payload = JSON.parse(atob(jwt.split('.')[1]));
          user = { id: payload.sub, email: payload.email };
          userEmail = payload.email;
          isAuthenticatedFlow = true;
          
          logStep("User extracted from JWT", { userId: user.id, email: userEmail });
        }
      } catch (error) {
        logStep("JWT extraction failed (continuing as anonymous)", { error: error.message });
        // Continue as anonymous user - this is OK for pay-first flow
      }
    }

    // Determine the flow type
    const flowType = isAuthenticatedFlow ? "authenticated" : "anonymous";
    logStep("Flow type determined", { flowType, hasUser: !!user });

    // Create customer email for anonymous flow
    if (!isAuthenticatedFlow && !userEmail) {
      userEmail = `temp-${Date.now()}@firegaugellc.gmail.com`; // Temporary email for anonymous checkout
      logStep("Generated temporary email for anonymous user", { email: userEmail });
    }

    // Create checkout session metadata
    const sessionMetadata = {
      price_id: priceId,
      flow_type: flowType,
      ...metadata,
      // For authenticated users, store their user ID
      ...(user && { supabase_user_id: user.id }),
      // For anonymous users, we'll create the account in the webhook
      ...(flowType === "anonymous" && { 
        requires_account_creation: "true",
        temp_email: userEmail 
      })
    };

    logStep("Session metadata prepared", sessionMetadata);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin") || "https://firegauge.app"}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin") || "https://firegauge.app"}/pricing`,
      customer_email: userEmail,
      metadata: sessionMetadata,
      subscription_data: {
        metadata: sessionMetadata, // Also add to subscription metadata
      },
      // Collect customer information for anonymous users
      ...(flowType === "anonymous" && {
        customer_creation: "always",
        billing_address_collection: "required",
      }),
    });

    logStep("Stripe checkout session created", { 
      sessionId: session.id, 
      customerId: session.customer,
      url: session.url 
    });

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id,
        flowType: flowType
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    logError("Unhandled error", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

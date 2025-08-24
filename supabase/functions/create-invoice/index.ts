import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-INVOICE] ${step}${detailsStr}`);
};

const logError = (step: string, error: any) => {
  console.error(`[CREATE-INVOICE ERROR] ${step}: ${error.message || error}`);
  if (error.stack) {
    console.error(`[CREATE-INVOICE STACK] ${error.stack}`);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Invoice creation function started");
    
    // Check environment variables and resolve Stripe key based on STRIPE_MODE
    const stripeModeRaw = (Deno.env.get("STRIPE_MODE") || "test").toLowerCase();
    const resolvedMode = stripeModeRaw === "live" ? "live" : "test";
    const keyByMode = resolvedMode === "live" 
      ? Deno.env.get("STRIPE_SECRET_KEY_LIVE") 
      : Deno.env.get("STRIPE_SECRET_KEY_TEST");
    const stripeKey = keyByMode || Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logError("Environment check", new Error("No Stripe secret key found. Expected STRIPE_SECRET_KEY_" + resolvedMode.toUpperCase() + " or STRIPE_SECRET_KEY"));
      return new Response(
        JSON.stringify({ error: "Stripe configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Environment variables OK", { mode: resolvedMode, keySource: keyByMode ? `STRIPE_SECRET_KEY_${resolvedMode.toUpperCase()}` : "STRIPE_SECRET_KEY" });

    // Parse request body
    const body = await req.json();
    logStep("Request body parsed", { bodyKeys: Object.keys(body) });

    const { 
      priceId: incomingPriceId, 
      customerInfo, 
      metadata = {},
      billingCycle = 'monthly',
      planName,
      planId,
      promoCode
    } = body;

    // Resolve priceId: prefer explicit priceId, else map via DB/env using planId + billingCycle
    let resolvedPriceId: string | null = (incomingPriceId && String(incomingPriceId).trim().length > 0)
      ? String(incomingPriceId).trim()
      : null;

    if (!resolvedPriceId && planId && billingCycle) {
      // 1) Try database map first (public.billing_price_map)
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (supabaseUrl && supabaseServiceKey) {
          const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });
          const { data: row, error: dbErr } = await supabase
            .from('billing_price_map')
            .select('price_id')
            .eq('mode', resolvedMode)
            .eq('plan_id', planId)
            .eq('cycle', billingCycle)
            .eq('active', true)
            .maybeSingle();
          if (dbErr) {
            logStep("DB price map lookup error (non-fatal)", { error: dbErr.message });
          } else if (row?.price_id) {
            resolvedPriceId = String(row.price_id);
            logStep("Resolved price from DB map", { planId, billingCycle, resolvedPriceId });
          }
        }
      } catch (e: any) {
        logStep("DB price map exception (non-fatal)", { error: e.message });
      }

      // 2) Fallback to env JSON map
      if (!resolvedPriceId) {
        try {
          const mapEnvRaw = resolvedMode === "live"
            ? Deno.env.get("PRICE_MAP_LIVE_JSON")
            : Deno.env.get("PRICE_MAP_TEST_JSON");
          if (mapEnvRaw) {
            const priceMap = JSON.parse(mapEnvRaw);
            const candidate = priceMap?.[planId]?.[billingCycle];
            if (candidate && typeof candidate === 'string' && candidate.trim().length > 0) {
              resolvedPriceId = candidate.trim();
              logStep("Resolved price from env price map", { planId, billingCycle, resolvedPriceId });
            } else {
              logStep("Env price map missing mapping", { planId, billingCycle });
            }
          } else {
            logStep("No env price map set (PRICE_MAP_*_JSON)", { mode: resolvedMode });
          }
        } catch (e: any) {
          logStep("Env price map parse error (non-fatal)", { error: e.message });
        }
      }
    }

    if (!resolvedPriceId) {
      logError("Validation", new Error("priceId or planId/billingCycle is required (and must map to a configured price)"));
      return new Response(
        JSON.stringify({ error: "Price not configured for selection" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!customerInfo?.email) {
      logError("Validation", new Error("customerInfo.email is required"));
      return new Response(
        JSON.stringify({ error: "Customer email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Basic validation passed", { priceId, email: customerInfo.email });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    logStep("Stripe client initialized");

    // Create or retrieve customer
    let customer: Stripe.Customer;
    
    try {
      // First, try to find existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: customerInfo.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
        logStep("Found existing customer", { customerId: customer.id });
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: customerInfo.email,
          name: customerInfo.name || customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address ? {
            line1: customerInfo.address.line1,
            line2: customerInfo.address.line2,
            city: customerInfo.address.city,
            state: customerInfo.address.state,
            postal_code: customerInfo.address.postal_code,
            country: customerInfo.address.country || 'US',
          } : undefined,
          metadata: {
            source: 'firegauge_marketing',
            plan_requested: planName || 'unknown',
            billing_cycle: billingCycle,
            ...metadata,
          },
        });
        logStep("Created new customer", { customerId: customer.id });
      }
    } catch (error) {
      logError("Customer creation/retrieval failed", error);
      return new Response(
        JSON.stringify({ error: "Failed to create customer" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get price details to calculate invoice amount
    let price: Stripe.Price;
    try {
      price = await stripe.prices.retrieve(resolvedPriceId);
      logStep("Retrieved price details", { 
        priceId: price.id, 
        amount: price.unit_amount, 
        currency: price.currency 
      });
    } catch (error) {
      const message = (error as any)?.message || String(error);
      logError("Price retrieval failed", error);
      if (/No such price/i.test(message)) {
        return new Response(
          JSON.stringify({
            error: "Invalid Stripe price for current mode",
            details: `Price ${resolvedPriceId} not found in ${resolvedMode} mode. Verify STRIPE_MODE and price IDs.`,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Invalid price ID", details: message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create invoice
    try {
      const invoice = await stripe.invoices.create({
        customer: customer.id,
        collection_method: 'send_invoice',
        days_until_due: 30, // Give them 30 days to pay
        auto_advance: false, // Don't auto-finalize, we'll do it manually
        metadata: {
          source: 'firegauge_marketing',
          plan_name: planName || 'unknown',
          billing_cycle: billingCycle,
          quote_request: 'true',
          ...metadata,
        },
        custom_fields: [
          {
            name: 'FireGauge Plan',
            value: planName || 'Unknown Plan',
          },
          {
            name: 'Billing Cycle',
            value: billingCycle === 'annual' ? 'Annual' : 'Monthly',
          },
        ],
      });

      logStep("Created invoice", { invoiceId: invoice.id });

      // Add line item to invoice
      await stripe.invoiceItems.create({
        customer: customer.id,
        invoice: invoice.id,
        price: resolvedPriceId,
        quantity: 1,
      });

      logStep("Added line item to invoice");

      // Apply promoCode if provided (coupon or promotion code)
      if (promoCode && typeof promoCode === 'string') {
        try {
          const promoList = await stripe.promotionCodes.list({ code: promoCode, active: true, limit: 1 });
          if (promoList.data.length > 0) {
            await stripe.invoices.update(invoice.id, { discounts: [{ promotion_code: promoList.data[0].id }] as any });
          } else {
            try {
              const coupon = await stripe.coupons.retrieve(promoCode);
              if (coupon && coupon.valid) {
                await stripe.invoices.update(invoice.id, { discounts: [{ coupon: coupon.id }] as any });
              }
            } catch (_) {}
          }
        } catch (_) {}
      }

      // Finalize the invoice to make it sendable
      const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
      
      logStep("Finalized invoice", { 
        invoiceId: finalizedInvoice.id,
        total: finalizedInvoice.total,
        status: finalizedInvoice.status 
      });

      // Send the invoice
      const sentInvoice = await stripe.invoices.sendInvoice(finalizedInvoice.id);
      
      logStep("Sent invoice", { 
        invoiceId: sentInvoice.id,
        hostedInvoiceUrl: sentInvoice.hosted_invoice_url 
      });

      return new Response(
        JSON.stringify({ 
          success: true,
          invoice: {
            id: sentInvoice.id,
            total: sentInvoice.total,
            currency: sentInvoice.currency,
            status: sentInvoice.status,
            hostedInvoiceUrl: sentInvoice.hosted_invoice_url,
            invoicePdf: sentInvoice.invoice_pdf,
          },
          customer: {
            id: customer.id,
            email: customer.email,
          },
          message: 'Invoice created and sent successfully',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );

    } catch (error) {
      logError("Invoice creation failed", error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to create invoice",
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

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
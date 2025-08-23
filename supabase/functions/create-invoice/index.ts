import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

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

    const { 
      priceId, 
      customerInfo, 
      metadata = {},
      billingCycle = 'monthly',
      planName,
      promoCode
    } = body;

    if (!priceId) {
      logError("Validation", new Error("priceId is required"));
      return new Response(
        JSON.stringify({ error: "priceId is required" }),
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
      price = await stripe.prices.retrieve(priceId);
      logStep("Retrieved price details", { 
        priceId: price.id, 
        amount: price.unit_amount, 
        currency: price.currency 
      });
    } catch (error) {
      logError("Price retrieval failed", error);
      return new Response(
        JSON.stringify({ error: "Invalid price ID" }),
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
        price: priceId,
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
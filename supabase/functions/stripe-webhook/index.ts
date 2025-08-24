import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0"; // Ensure consistent Stripe version
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Adjust for production if needed
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Function to initialize Supabase client with Service Role Key
const initSupabaseAdminClient = (): SupabaseClient => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase URL or Service Role Key is not set in environment variables.");
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });
};


// Helper function to manage subscription data in Supabase
const manageSubscriptionInSupabase = async (
  supabaseAdmin: SupabaseClient,
  stripeSubscriptionObject: Stripe.Subscription,
  tenantId: number, // We need tenant_id to link the subscription
  stripeCustomerId: string
) => {
  const subscriptionData = {
    tenant_id: tenantId,
    stripe_subscription_id: stripeSubscriptionObject.id,
    stripe_customer_id: stripeCustomerId,
    stripe_price_id: stripeSubscriptionObject.items.data[0]?.price.id, 
    status: stripeSubscriptionObject.status,
    current_period_start: new Date(stripeSubscriptionObject.current_period_start * 1000).toISOString(),
    current_period_end: new Date(stripeSubscriptionObject.current_period_end * 1000).toISOString(),
    cancel_at_period_end: stripeSubscriptionObject.cancel_at_period_end,
    // ended_at: stripeSubscriptionObject.ended_at ? new Date(stripeSubscriptionObject.ended_at * 1000).toISOString() : null,
    // trial_start: stripeSubscriptionObject.trial_start ? new Date(stripeSubscriptionObject.trial_start * 1000).toISOString() : null,
    // trial_end: stripeSubscriptionObject.trial_end ? new Date(stripeSubscriptionObject.trial_end * 1000).toISOString() : null,
  };

  logStep("Attempting to upsert subscription", { data: subscriptionData });

  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .upsert(subscriptionData, {
      onConflict: "stripe_subscription_id", // Assumes stripe_subscription_id is unique
      // if you want to update specific columns on conflict and ignore others:
      // ignoreDuplicates: false, 
    })
    .select()
    .single();

  if (error) {
    logStep("Error upserting subscription", { error: error.message });
    throw error;
  }
  logStep("Subscription upserted successfully", { subscriptionId: data.id });
  return data;
};


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Resolve Stripe keys/secrets by STRIPE_MODE with safe fallbacks
  const stripeModeRaw = (Deno.env.get("STRIPE_MODE") || "test").toLowerCase();
  const resolvedMode = stripeModeRaw === "live" ? "live" : "test";
  const stripeKeyByMode = resolvedMode === "live" 
    ? Deno.env.get("STRIPE_SECRET_KEY_LIVE")
    : Deno.env.get("STRIPE_SECRET_KEY_TEST");
  const stripeKey = stripeKeyByMode || Deno.env.get("STRIPE_SECRET_KEY");
  const stripeSignature = req.headers.get("stripe-signature");
  const webhookSecretByMode = resolvedMode === "live"
    ? Deno.env.get("STRIPE_WEBHOOK_SECRET_LIVE")
    : Deno.env.get("STRIPE_WEBHOOK_SECRET_TEST");
  const stripeWebhookSecret = webhookSecretByMode || Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!stripeKey || !stripeWebhookSecret || !stripeSignature) {
    logStep("Missing Stripe config", { stripeKey: !!stripeKey, stripeWebhookSecret: !!stripeWebhookSecret, stripeSignature: !!stripeSignature, mode: resolvedMode });
    return new Response("Stripe configuration error.", { status: 400 });
  }
  
  const stripe = new Stripe(stripeKey, {
    apiVersion: "2023-10-16", // Use a fixed API version
    httpClient: Stripe.createFetchHttpClient() // For Deno
  });

  let event: Stripe.Event;
  const requestBody = await req.text();

  try {
    event = await stripe.webhooks.constructEventAsync(
      requestBody,
      stripeSignature,
      stripeWebhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider() // For Deno signature verification
    );
    logStep("Webhook event constructed", { eventId: event.id, eventType: event.type, mode: resolvedMode });
  } catch (err: any) {
    logStep("Webhook signature verification failed", { error: err.message });
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabaseAdmin = initSupabaseAdminClient();
  let relevantSubscription: Stripe.Subscription | null = null;
  let stripeCustomerId: string | null = null;

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout.session.completed", { sessionId: session.id, customer: session.customer, subscription: session.subscription });

        if (session.mode === 'subscription' && session.subscription && session.customer) {
          const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
          stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
          
          relevantSubscription = await stripe.subscriptions.retrieve(subscriptionId);
          if (!relevantSubscription) {
            throw new Error(`Could not retrieve subscription ${subscriptionId} from Stripe.`);
          }

          // Record referral if present on session
          const referralCode = session.metadata?.referral_code;
          try {
            if (referralCode && stripeCustomerId) {
              // Get price from line items
              const expandedSession = await stripe.checkout.sessions.retrieve(session.id, { expand: ['line_items'] });
              const priceId = expandedSession.line_items?.data?.[0]?.price?.id as string | undefined;

              // Upsert referral row
              const { data: existingRef, error: existingRefErr } = await supabaseAdmin
                .from('referral')
                .select('id, reward_applied_cents')
                .eq('code', referralCode)
                .eq('referred_stripe_customer_id', stripeCustomerId)
                .single();

              if (existingRefErr && existingRefErr.code !== 'PGRST116') {
                logStep('Referral lookup error (non-fatal)', { error: existingRefErr.message });
              }

              if (!existingRef) {
                const { error: insertRefErr } = await supabaseAdmin
                  .from('referral')
                  .insert({
                    code: referralCode,
                    referred_stripe_customer_id: stripeCustomerId,
                    referred_subscription_id: subscriptionId,
                    referred_price_id: priceId || null,
                    qualified: false,
                    reward_cents: 0,
                    reward_applied_cents: 0,
                  });
                if (insertRefErr) {
                  logStep('Referral insert error (non-fatal)', { error: insertRefErr.message });
                } else {
                  logStep('Referral recorded from checkout.session.completed', { referralCode, stripeCustomerId, subscriptionId });
                }
              }
            }
          } catch (refErr: any) {
            logStep('Referral record exception (non-fatal)', { error: refErr.message });
          }

          const supabaseUserIdFromMetadata = session.metadata?.supabase_user_id;
          const requiresAccountCreation = session.metadata?.requires_account_creation === "true";

          // Handle new user account creation flow
          if (requiresAccountCreation && !supabaseUserIdFromMetadata) {
            logStep("New user signup detected - calling main app account creation", { sessionId: session.id });
            
            try {
              // Extract customer information for account creation
              const customerEmail = session.customer_details?.email;
              const customerName = session.customer_details?.name;
              
              if (!customerEmail) {
                throw new Error("Customer email not found in checkout session");
              }

              // Get subscription and price information
              const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
              
              // Get price ID from line items
              const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
                expand: ['line_items']
              });
              const priceId = expandedSession.line_items?.data?.[0]?.price?.id;
              
              // Call the main app's account creation endpoint
              const mainAppAccountUrl = "https://firegauge-api.onrender.com/api/create-account-from-marketing-site";
              
              const accountData = {
                customer_email: customerEmail,
                customer_name: customerName || customerEmail,
                stripe_customer_id: stripeCustomerId,
                stripe_subscription_id: subscriptionId,
                stripe_price_id: priceId
              };

              const accountResponse = await fetch(mainAppAccountUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(accountData),
              });

              if (!accountResponse.ok) {
                const errorText = await accountResponse.text();
                throw new Error(`Account creation failed: ${accountResponse.status} - ${errorText}`);
              }

              const accountResult = await accountResponse.json();
              logStep("Account created successfully in main app", { 
                tenantId: accountResult.tenant_id,
                userId: accountResult.user_id,
                email: customerEmail
              });

              // Also upsert subscription in Supabase now that we have tenantId
              try {
                const createdTenantId = accountResult.tenant_id as number | undefined;
                if (createdTenantId && relevantSubscription && stripeCustomerId) {
                  await manageSubscriptionInSupabase(supabaseAdmin, relevantSubscription, createdTenantId, stripeCustomerId);
                  // Ensure tenant has stripe_customer_id set
                  const { error: tenantUpdateErrorNew } = await supabaseAdmin
                    .from('tenant')
                    .update({ stripe_customer_id: stripeCustomerId })
                    .eq('id', createdTenantId)
                    .is('stripe_customer_id', null);
                  if (tenantUpdateErrorNew) {
                    logStep("Warning: Could not update tenant with stripe_customer_id (new user)", { tenantId: createdTenantId, error: tenantUpdateErrorNew.message });
                  }
                } else {
                  logStep("Skipping subscription upsert for new user: missing tenantId or subscription/customer", { createdTenantId, hasSub: !!relevantSubscription, hasCustomer: !!stripeCustomerId });
                }
              } catch (subUpsertErr: any) {
                logStep("Non-fatal: Failed to upsert subscription for new user", { error: subUpsertErr.message });
              }

              // Done handling new users
              break;
              
            } catch (error: any) {
              logStep("Failed to create account in main app", { error: error.message });
              throw new Error(`Account creation failed: ${error.message}`);
            }
          }

          // Handle existing user flow (original logic)
          if (!supabaseUserIdFromMetadata) {
            throw new Error("supabase_user_id not found in checkout session metadata for existing user.");
          }
          if(!stripeCustomerId){
             throw new Error("Stripe Customer ID not found in checkout session.");
          }

          // Get tenant_id from supabase_user_id
          const { data: userData, error: userError } = await supabaseAdmin
            .from('user')
            .select('tenant_id')
            .eq('supabase_auth_user_id', supabaseUserIdFromMetadata)
            .single();

          if (userError || !userData) {
            throw new Error(`Could not find user or tenant_id for supabase_auth_user_id ${supabaseUserIdFromMetadata}: ${userError?.message}`);
          }
          const tenantId = userData.tenant_id;

          await manageSubscriptionInSupabase(supabaseAdmin, relevantSubscription, tenantId, stripeCustomerId);
          
          // Potentially update tenant table with stripe_customer_id if not already set
          // This ensures the tenant record is linked to the Stripe customer
          const { error: tenantUpdateError } = await supabaseAdmin
            .from('tenant')
            .update({ stripe_customer_id: stripeCustomerId }) // Assuming you add this column to your tenant table
            .eq('id', tenantId)
            .is('stripe_customer_id', null); // Only update if not already set

          if (tenantUpdateError) {
              logStep("Warning: Could not update tenant with stripe_customer_id", { tenantId, stripeCustomerId, error: tenantUpdateError.message });
          } else {
              logStep("Tenant updated with stripe_customer_id if it was null", { tenantId, stripeCustomerId });
          }

        } else {
          logStep("Skipping checkout.session.completed as mode is not subscription or subscription/customer info missing.");
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": // Handles direct creation/update via API/dashboard
      case "customer.subscription.resumed": // When a paused subscription is resumed
      case "customer.subscription.trial_will_end": // Good for sending notifications
        relevantSubscription = event.data.object as Stripe.Subscription;
        stripeCustomerId = typeof relevantSubscription.customer === 'string' ? relevantSubscription.customer : relevantSubscription.customer.id;
        logStep(`Processing ${event.type}`, { subscriptionId: relevantSubscription.id, customerId: stripeCustomerId });
        
        if(!stripeCustomerId){
            throw new Error("Stripe Customer ID not found in subscription object.");
        }
        // Find tenant_id by stripe_customer_id (assuming stripe_customer_id is now on tenant table)
         const { data: tenantData, error: tenantError } = await supabaseAdmin
            .from('tenant')
            .select('id')
            .eq('stripe_customer_id', stripeCustomerId)
            .single();
        
        if(tenantError || !tenantData){
            // Fallback: Try to find via existing subscription if tenant link failed
            const {data: existingSubData, error: existingSubError} = await supabaseAdmin
                .from('subscriptions')
                .select('tenant_id')
                .eq('stripe_subscription_id', relevantSubscription.id)
                .single();
            if(existingSubError || !existingSubData){
                 throw new Error(`Could not find tenant for customer ${stripeCustomerId} or subscription ${relevantSubscription.id}`);
            }
            await manageSubscriptionInSupabase(supabaseAdmin, relevantSubscription, existingSubData.tenant_id, stripeCustomerId);
        } else {
            await manageSubscriptionInSupabase(supabaseAdmin, relevantSubscription, tenantData.id, stripeCustomerId);
        }
        break;

      case "customer.subscription.deleted": // Includes cancellations at period end if they result in deletion
        relevantSubscription = event.data.object as Stripe.Subscription;
        stripeCustomerId = typeof relevantSubscription.customer === 'string' ? relevantSubscription.customer : relevantSubscription.customer.id;
        logStep("Processing customer.subscription.deleted", { subscriptionId: relevantSubscription.id, customerId: stripeCustomerId });
        
        // Update status to 'canceled' or 'ended'. Stripe object has status.
        const { error: deleteError } = await supabaseAdmin
          .from("subscriptions")
          .update({ 
            status: relevantSubscription.status, // should be 'canceled' or a similar terminal status from Stripe
            cancel_at_period_end: relevantSubscription.cancel_at_period_end, // ensure this is accurate
           })
          .eq("stripe_subscription_id", relevantSubscription.id);

        if (deleteError) {
          throw new Error(`Error updating subscription to canceled: ${deleteError.message}`);
        }
        logStep("Subscription marked as deleted/ended in DB", { subscriptionId: relevantSubscription.id });
        break;
      
      case "invoice.payment_succeeded":
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Processing invoice.payment_succeeded", { invoiceId: invoice.id, customer: invoice.customer, subscription: invoice.subscription });
        
        if (invoice.subscription && invoice.customer && invoice.billing_reason === 'subscription_cycle') {
          const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
          stripeCustomerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id;
          
          relevantSubscription = await stripe.subscriptions.retrieve(subscriptionId);
           if (!relevantSubscription) {
            throw new Error(`Could not retrieve subscription ${subscriptionId} from Stripe for invoice payment.`);
          }
          if(!stripeCustomerId){
             throw new Error("Stripe Customer ID not found in invoice object.");
          }

          // Find tenant_id by stripe_customer_id
           const { data: tenantDataInv, error: tenantErrorInv } = await supabaseAdmin
            .from('tenant')
            .select('id')
            .eq('stripe_customer_id', stripeCustomerId)
            .single();

          if(tenantErrorInv || !tenantDataInv){
            // Fallback: Try to find via existing subscription if tenant link failed
            const {data: existingSubDataInv, error: existingSubErrorInv} = await supabaseAdmin
                .from('subscriptions')
                .select('tenant_id')
                .eq('stripe_subscription_id', relevantSubscription.id)
                .single();
            if(existingSubErrorInv || !existingSubDataInv){
                 throw new Error(`Could not find tenant for customer ${stripeCustomerId} or subscription ${relevantSubscription.id} for invoice payment.`);
            }
            await manageSubscriptionInSupabase(supabaseAdmin, relevantSubscription, existingSubDataInv.tenant_id, stripeCustomerId);
          } else {
            await manageSubscriptionInSupabase(supabaseAdmin, relevantSubscription, tenantDataInv.id, stripeCustomerId);
          }
          // Referral qualification and crediting
          try {
            // Determine referral code from invoice or subscription metadata
            const referralCode = (invoice.metadata && (invoice.metadata as any).referral_code) || (relevantSubscription.metadata && (relevantSubscription.metadata as any).referral_code) || null;
            // Determine if annual
            const isAnnual = relevantSubscription.items.data.some((it) => it.price?.recurring?.interval === 'year');

            if (referralCode && isAnnual) {
              // Upsert/find referral row
              const { data: refRow, error: refFetchErr } = await supabaseAdmin
                .from('referral')
                .select('id, qualified, reward_cents, reward_applied_cents')
                .eq('code', referralCode)
                .eq('referred_stripe_customer_id', stripeCustomerId)
                .single();

              if (refFetchErr && refFetchErr.code !== 'PGRST116') {
                logStep('Referral fetch error (non-fatal)', { error: refFetchErr.message });
              }

              if (!refRow) {
                const priceId = relevantSubscription.items.data[0]?.price?.id || null;
                const { error: refCreateErr } = await supabaseAdmin
                  .from('referral')
                  .insert({
                    code: referralCode,
                    referred_stripe_customer_id: stripeCustomerId,
                    referred_subscription_id: relevantSubscription.id,
                    referred_price_id: priceId,
                    qualified: true,
                    reward_cents: 50000,
                    reward_applied_cents: 0,
                  });
                if (refCreateErr) {
                  logStep('Referral create error (non-fatal)', { error: refCreateErr.message });
                }
              } else if (!refRow.qualified) {
                const { error: refUpdateErr } = await supabaseAdmin
                  .from('referral')
                  .update({ qualified: true, reward_cents: 50000 })
                  .eq('code', referralCode)
                  .eq('referred_stripe_customer_id', stripeCustomerId);
                if (refUpdateErr) {
                  logStep('Referral qualify update error (non-fatal)', { error: refUpdateErr.message });
                }
              }

              // Credit referrer if not already applied
              const { data: referrerCodeRow, error: refCodeErr } = await supabaseAdmin
                .from('referral_code')
                .select('tenant_id')
                .eq('code', referralCode)
                .single();

              if (!refCodeErr && referrerCodeRow?.tenant_id) {
                const { data: tenantRow, error: tenantFetchErr } = await supabaseAdmin
                  .from('tenant')
                  .select('stripe_customer_id')
                  .eq('id', referrerCodeRow.tenant_id)
                  .single();

                const referrerStripeCustomerId = tenantRow?.stripe_customer_id || null;
                if (tenantFetchErr) {
                  logStep('Referrer tenant fetch error (non-fatal)', { error: tenantFetchErr.message });
                }

                if (referrerStripeCustomerId) {
                  // Check if already applied
                  const { data: refAppliedRow, error: refAppliedErr } = await supabaseAdmin
                    .from('referral')
                    .select('reward_applied_cents')
                    .eq('code', referralCode)
                    .eq('referred_stripe_customer_id', stripeCustomerId)
                    .single();

                  const alreadyApplied = !!refAppliedRow && (refAppliedRow.reward_applied_cents || 0) > 0;

                  if (!alreadyApplied) {
                    try {
                      await stripe.customers.createBalanceTransaction(referrerStripeCustomerId, {
                        amount: -50000, // credit $500
                        currency: 'usd',
                        description: `Referral reward for ${stripeCustomerId}`,
                      });
                      const { error: markAppliedErr } = await supabaseAdmin
                        .from('referral')
                        .update({ reward_applied_cents: 50000 })
                        .eq('code', referralCode)
                        .eq('referred_stripe_customer_id', stripeCustomerId);
                      if (markAppliedErr) {
                        logStep('Failed to mark referral reward as applied (non-fatal)', { error: markAppliedErr.message });
                      } else {
                        logStep('Applied $500 referral credit to referrer customer balance', { referrerStripeCustomerId });
                      }
                    } catch (creditErr: any) {
                      logStep('Stripe balance credit error (non-fatal)', { error: creditErr.message });
                    }
                  }
                }
              }
            }
          } catch (referralProcessErr: any) {
            logStep('Referral processing failed (non-fatal)', { error: referralProcessErr.message });
          }
        } else {
            logStep("Skipping invoice.payment_succeeded: Not a subscription cycle or missing info.");
        }
        break;

      case "invoice.payment_failed":
        const failedInvoice = event.data.object as Stripe.Invoice;
        logStep("Processing invoice.payment_failed", { invoiceId: failedInvoice.id, customer: failedInvoice.customer, subscription: failedInvoice.subscription });
        
        if (failedInvoice.subscription && failedInvoice.customer) {
          const subscriptionIdFailed = typeof failedInvoice.subscription === 'string' ? failedInvoice.subscription : failedInvoice.subscription.id;
          // Update your subscription status to 'past_due' or 'unpaid'
          const { error: paymentFailedError } = await supabaseAdmin
            .from("subscriptions")
            .update({ status: "past_due" }) // Or map to your specific enum value
            .eq("stripe_subscription_id", subscriptionIdFailed);

          if (paymentFailedError) {
            throw new Error(`Error updating subscription to past_due: ${paymentFailedError.message}`);
          }
          logStep("Subscription status updated to past_due", { subscriptionId: subscriptionIdFailed });
        }
        break;

      // Add other event types to handle as needed
      // e.g., customer.subscription.trial_will_end

      default:
        logStep(`Unhandled event type: ${event.type}`);
    }
  } catch (error: any) {
     logStep("Error processing event", { eventType: event.type, error: error.message, stack: error.stack });
     // Return 500 so Stripe retries, but be cautious with errors that will always fail
     return new Response(`Webhook handler error: ${error.message}`, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}); 
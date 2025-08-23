import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (msg: string, details?: any) => {
  console.log(`[CREATE-REFERRAL-CODE] ${msg}${details ? " - " + JSON.stringify(details) : ""}`);
};

const randomCode = (length = 6) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoid confusing chars
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `FG-${out}`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Server configuration missing" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const jwt = authHeader.split(" ")[1];
    // Extract sub (user id) from JWT without verification for id only; webhook verifies upstream
    let supabaseAuthUserId: string | null = null;
    try {
      const payload = JSON.parse(atob(jwt.split(".")[1]));
      supabaseAuthUserId = payload.sub || null;
    } catch (_) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Find tenant_id for this user
    const { data: userRow, error: userErr } = await supabaseAdmin
      .from("user")
      .select("tenant_id")
      .eq("supabase_auth_user_id", supabaseAuthUserId)
      .single();

    if (userErr || !userRow?.tenant_id) {
      log("Failed to resolve tenant for user", { userErr: userErr?.message });
      return new Response(JSON.stringify({ error: "Tenant not found" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const tenantId = userRow.tenant_id as number;
    const body = await req.json().catch(() => ({}));
    const desired: string | undefined = body?.desired_code;

    let code = desired
      ? String(desired).toUpperCase().replace(/[^A-Z0-9\-]/g, "").slice(0, 32)
      : randomCode();

    // Ensure uniqueness; try a few times if auto-generated collides
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: existing, error: existingErr } = await supabaseAdmin
        .from("referral_code")
        .select("code")
        .eq("code", code)
        .single();
      if (existingErr && existingErr.code !== "PGRST116") {
        log("Lookup error", { error: existingErr.message });
        return new Response(JSON.stringify({ error: "Lookup failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (!existing) break;
      code = randomCode();
    }

    const { error: insertErr } = await supabaseAdmin
      .from("referral_code")
      .insert({ tenant_id: tenantId, code });

    if (insertErr) {
      if (insertErr.code === "23505") {
        return new Response(JSON.stringify({ error: "Code already exists" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      log("Insert error", { error: insertErr.message });
      return new Response(JSON.stringify({ error: "Failed to create code" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ code }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    log("Unhandled", { error: err?.message });
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});



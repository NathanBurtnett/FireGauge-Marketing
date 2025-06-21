import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Enable CORS for browser clients
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS pre-flight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, message = "", priority = "medium" } = await req.json();

    if (!subject || !message) {
      return new Response(
        JSON.stringify({ error: "Subject and message are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Fetch the Resend API key from environment variables
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY env var");
      return new Response(
        JSON.stringify({ error: "Server not configured for email sending" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Prepare email payload
    const emailPayload = {
      from: "FireGauge Support <support@firegauge.app>",
      to: ["firegaugellc@gmail.com"],
      subject: `[Support – ${priority}] ${subject}`,
      html: `<p>${message.replace(/\n/g, "<br/>")}</p>`,
    };

    // Send email via Resend REST API
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    if (!emailRes.ok) {
      const errorText = await emailRes.text();
      console.error("Resend API error", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Support email function error", err);
    return new Response(
      JSON.stringify({ error: "Unexpected server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}); 
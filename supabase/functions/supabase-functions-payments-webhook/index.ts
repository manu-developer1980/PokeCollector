import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateEvent } from "npm:@polar-sh/sdk/webhooks";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function verifyPolarSignature(
  request: Request,
  body: string
): Promise<boolean> {
  try {
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    validateEvent(body, headers, Deno.env.get("POLAR_WEBHOOK_SECRET") ?? "");
    return true;
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const clonedReq = req.clone();
    const rawBody = await clonedReq.text();

    // Log para debugging
    console.log("Webhook received:", {
      headers: Object.fromEntries(req.headers.entries()),
      body: rawBody,
    });

    const isValidSignature = await verifyPolarSignature(req, rawBody);
    if (!isValidSignature) {
      console.error("Invalid webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(rawBody);
    console.log("Webhook payload:", payload);

    // Crear cliente de Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Almacenar el evento en la base de datos
    const { error: logError } = await supabaseClient
      .from("webhook_events")
      .insert({
        event_type: payload.type,
        payload: payload.data,
        processed_at: new Date().toISOString(),
      });

    if (logError) {
      console.error("Error logging webhook event:", logError);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

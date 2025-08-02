import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const publishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY");
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  // Solo mostrar los primeros y últimos 4 caracteres por seguridad
  const maskKey = (key: string | undefined) => {
    if (!key) return "No configurado";
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  };

  console.log("Stripe Config Test:");
  console.log("Publishable Key:", maskKey(publishableKey));
  console.log("Secret Key:", maskKey(secretKey));
  console.log("Webhook Secret:", maskKey(webhookSecret));

  return new Response(
    JSON.stringify({
      publishableKey: maskKey(publishableKey),
      secretKey: maskKey(secretKey),
      webhookSecret: maskKey(webhookSecret),
      keysConfigured: !!(publishableKey && secretKey && webhookSecret),
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});

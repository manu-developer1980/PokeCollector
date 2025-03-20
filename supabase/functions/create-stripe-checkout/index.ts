import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.4.0?target=deno";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://poke-collector.netlify.app",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "*, authorization, x-client-info, apikey, content-type, prefer",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const { priceId, customerEmail, metadata, successUrl, cancelUrl } =
      await req.json();

    // Verificar campos requeridos
    if (!priceId || !customerEmail) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields (priceId, customerEmail)",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || `${Deno.env.get("SITE_URL")}/checkout-success`, // Cambiado de /checkout/success a /checkout-success
      cancel_url: cancelUrl || `${Deno.env.get("SITE_URL")}/pricing`,
      customer_email: customerEmail,
      metadata: metadata || {},
      allow_promotion_codes: true,
      billing_address_collection: "required",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

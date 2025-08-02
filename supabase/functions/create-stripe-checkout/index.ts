import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.4.0?target=deno";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

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

    // Añadir manejo de errores más detallado
    try {
      // Verificar que todos los campos requeridos estén presentes
      if (!priceId) {
        return new Response(
          JSON.stringify({ error: "Missing required field: priceId" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Verificar que la clave de Stripe esté configurada
      if (!Deno.env.get("STRIPE_SECRET_KEY")) {
        console.error("STRIPE_SECRET_KEY no está configurada");
        return new Response(
          JSON.stringify({ error: "Stripe configuration error" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Inicializar Stripe con manejo de errores
      let stripe;
      try {
        stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
          apiVersion: "2022-11-15",
        });
      } catch (stripeInitError) {
        console.error("Error al inicializar Stripe:", stripeInitError);
        return new Response(
          JSON.stringify({ error: "Stripe initialization error" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Crear la sesión de checkout con manejo de errores
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url:
            successUrl || `${Deno.env.get("SITE_URL")}/checkout-success`,
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
      } catch (stripeError) {
        console.error("Error al crear la sesión de Stripe:", stripeError);
        return new Response(
          JSON.stringify({
            error: "Stripe session creation error",
            details: stripeError.message,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } catch (generalError) {
      console.error("Error general:", generalError);
      return new Response(
        JSON.stringify({
          error: "General server error",
          details: generalError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

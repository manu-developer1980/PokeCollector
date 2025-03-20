import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.4.0?target=deno";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://poke-collector.netlify.app",
];

serve(async (req) => {
  // Obtener el origen de la solicitud
  const origin = req.headers.get("Origin") || "";

  // Determinar si el origen está permitido
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);

  // Configurar los encabezados CORS
  const corsHeaders = {
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };

  // Manejar la solicitud preflight OPTIONS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Si no es una solicitud OPTIONS y el origen no está permitido
  if (!isAllowedOrigin) {
    return new Response("Origin not allowed", {
      status: 403,
      headers: corsHeaders,
    });
  }

  try {
    // Obtener los datos de la solicitud
    const requestData = await req.json();
    const { priceId, customerEmail, metadata, successUrl, cancelUrl } =
      requestData;

    console.log("Datos recibidos:", requestData);

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

    // Obtener la clave secreta de Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    // Verificar si la clave está presente
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: "STRIPE_SECRET_KEY no está configurada" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Inicializando Stripe");

    // Crear una instancia de Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16", // Usar la versión más reciente de la API
    });

    console.log("Creando sesión de checkout para:", customerEmail);
    console.log("Price ID:", priceId);

    // Buscar si ya existe un cliente con ese email
    const existingCustomers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    });

    let customer;

    if (existingCustomers.data.length > 0) {
      // Si existe, usar el cliente existente
      customer = existingCustomers.data[0];

      // Actualizar los metadatos del cliente si es necesario
      if (metadata) {
        customer = await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, ...metadata },
        });
      }
    }

    // Crear la sesión de checkout de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer: customer?.id, // Usar el ID del cliente existente si existe
      customer_email: customer ? undefined : customerEmail, // Solo usar email si no hay cliente existente
      metadata: metadata || {},
      success_url:
        successUrl ||
        `${
          Deno.env.get("SITE_URL") || "http://localhost:5173"
        }/checkout/success`,
      cancel_url:
        cancelUrl ||
        `${Deno.env.get("SITE_URL") || "http://localhost:5173"}/pricing`,
      allow_promotion_codes: true,
      billing_address_collection: "required",
    });

    console.log("Sesión de checkout creada con éxito:", session.id);

    // Devolver la URL de checkout
    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error completo:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Error desconocido",
        stack: error.stack,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.4.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0?target=deno";

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
    const {
      priceId,
      customerEmail,
      metadata,
      successUrl,
      cancelUrl,
      planType,
      userId,
    } = requestData;

    console.log("Datos recibidos:", requestData);

    // Verificar campos requeridos
    if (!priceId || !customerEmail || !planType || !userId) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required fields (priceId, customerEmail, planType, userId)",
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

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase URL or key not found");
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Primero, intentar encontrar o crear el cliente
    let customer;
    const { data: existingCustomers, error: customerError } = await supabase
      .from("customers")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (customerError) {
      throw new Error(`Error buscando cliente: ${customerError.message}`);
    }

    if (existingCustomers?.stripe_customer_id) {
      customer = await stripe.customers.retrieve(
        existingCustomers.stripe_customer_id
      );
    } else {
      // Crear nuevo cliente en Stripe
      customer = await stripe.customers.create({
        email: customerEmail,
        metadata: {
          user_id: userId,
        },
      });

      // Guardar el nuevo cliente en nuestra base de datos
      const { error: insertError } = await supabase.from("customers").insert({
        user_id: userId,
        stripe_customer_id: customer.id,
      });

      if (insertError) {
        console.error("Error guardando cliente:", insertError);
        // Continuar aunque haya error, ya que el cliente existe en Stripe
      }
    }

    // Crear la sesión de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      metadata: {
        user_id: userId,
        plan_type: planType.toLowerCase(),
        customer_id: customer.id,
      },
      success_url: `${
        successUrl || SITE_URL
      }/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cancelUrl || SITE_URL}/pricing`,
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

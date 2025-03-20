import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Polar } from "npm:@polar-sh/sdk";

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
      productId, // UUID del producto
      priceId, // UUID del precio (opcional)
      customerEmail,
      metadata,
      successUrl,
      cancelUrl,
    } = requestData;

    console.log("Datos recibidos:", requestData);

    // Verificar campos requeridos
    if (!productId || !customerEmail) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields (productId, customerEmail)",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Obtener el token de acceso de Polar
    const polarAccessToken = Deno.env.get("POLAR_ACCESS_TOKEN");

    // Verificar si el token está presente
    if (!polarAccessToken) {
      return new Response(
        JSON.stringify({ error: "POLAR_ACCESS_TOKEN no está configurado" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Inicializando SDK de Polar");

    // Crear una instancia del cliente Polar usando el SDK
    const polar = new Polar({
      accessToken: polarAccessToken,
      server:
        Deno.env.get("ENVIRONMENT") === "production" ? "production" : "sandbox",
    });

    console.log("Creando sesión de checkout para:", customerEmail);
    console.log("Product ID:", productId);
    console.log(
      "Price ID (si está disponible):",
      priceId || "No proporcionado"
    );

    // Crear la estructura correcta para la solicitud
    const checkoutData = {
      products: [
        {
          product_id: productId,
        },
      ],
      customer_email: customerEmail,
      metadata: metadata || {},
      success_url:
        successUrl ||
        `${
          Deno.env.get("SITE_URL") || "http://localhost:5173"
        }/checkout/success`,
      cancel_url:
        cancelUrl ||
        `${Deno.env.get("SITE_URL") || "http://localhost:5173"}/pricing`,
      currency: "eur",
    };

    console.log("Datos de checkout:", JSON.stringify(checkoutData));

    // Crear la sesión de checkout usando el SDK
    // Nota: Estamos usando la API directamente para tener más control sobre la estructura de datos
    const response = await fetch("https://api.polar.sh/v1/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${polarAccessToken}`,
      },
      body: JSON.stringify(checkoutData),
    });

    // Obtener la respuesta como texto para depuración
    const responseText = await response.text();
    console.log("Respuesta de API:", responseText);

    // Si la respuesta no es exitosa, devolver el error
    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: "Error de API de Polar",
          details: responseText,
          status: response.status,
          statusText: response.statusText,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parsear la respuesta como JSON
    let checkoutSession;
    try {
      checkoutSession = JSON.parse(responseText);
    } catch (e) {
      return new Response(
        JSON.stringify({
          error: "Error al parsear la respuesta",
          details: responseText,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar que la URL de checkout esté presente
    if (!checkoutSession.url) {
      return new Response(
        JSON.stringify({
          error: "No se recibió URL de checkout",
          details: checkoutSession,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Sesión de checkout creada con éxito");

    // Devolver la URL de checkout
    return new Response(JSON.stringify({ url: checkoutSession.url }), {
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

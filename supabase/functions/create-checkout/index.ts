import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Polar } from "npm:@polar-sh/sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Verificar variables de entorno críticas
    const polarAccessToken = Deno.env.get("POLAR_ACCESS_TOKEN");
    const siteUrl = Deno.env.get("SITE_URL");
    const environment = Deno.env.get("ENVIRONMENT") || "sandbox";

    if (!polarAccessToken) {
      throw new Error("POLAR_ACCESS_TOKEN no está configurado");
    }

    if (!siteUrl) {
      throw new Error("SITE_URL no está configurado");
    }

    // Log de configuración
    console.log("Configuración:", {
      environment,
      siteUrl,
      hasAccessToken: !!polarAccessToken,
    });

    const requestData = await req.json();
    console.log("Datos de la solicitud:", {
      productPriceId: requestData.productPriceId,
      hasEmail: !!requestData.customerEmail,
      metadata: requestData.metadata,
    });

    // Validación de datos
    if (!requestData.productPriceId || !requestData.customerEmail) {
      return new Response(
        JSON.stringify({
          error: "Datos incompletos",
          details: "Se requiere productPriceId y customerEmail",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Inicializar cliente Polar
    const polar = new Polar({
      accessToken: polarAccessToken,
      server: environment === "production" ? "production" : "sandbox",
    });

    console.log("Cliente Polar inicializado, creando sesión de checkout...");

    // Crear sesión de checkout
    const checkoutSession = await polar.checkouts
      .create({
        productPriceId: requestData.productPriceId,
        successUrl: `${siteUrl}/checkout/success`,
        cancelUrl: `${siteUrl}/pricing`,
        customerEmail: requestData.customerEmail,
        metadata: requestData.metadata || {},
        currency: "eur",
      })
      .catch((error) => {
        console.error("Error de Polar:", {
          message: error.message,
          response: error.response,
          status: error.status,
        });
        throw error;
      });

    console.log("Sesión de checkout creada:", {
      hasUrl: !!checkoutSession?.url,
    });

    return new Response(JSON.stringify({ url: checkoutSession.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error detallado:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause,
      response: error.response,
      status: error.status,
    });

    return new Response(
      JSON.stringify({
        error: "Error al crear sesión de checkout",
        details: {
          message: error.message,
          type: error.name,
          status: error.status,
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

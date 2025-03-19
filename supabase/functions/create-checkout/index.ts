import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Polar } from "npm:@polar-sh/sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

    const requestData = await req.json();

    // Validación más detallada de los datos de entrada
    if (!requestData) {
      throw new Error("No se recibieron datos en el request");
    }

    console.log("Datos recibidos:", {
      productPriceId: requestData.productPriceId,
      customerEmail: requestData.customerEmail,
      metadata: requestData.metadata,
      successUrl: requestData.successUrl,
      cancelUrl: requestData.cancelUrl,
    });

    // Validación de datos requeridos
    if (!requestData.productPriceId || !requestData.customerEmail) {
      return new Response(
        JSON.stringify({
          error: "Datos incompletos",
          details: "Se requiere productPriceId y customerEmail",
          received: {
            productPriceId: requestData.productPriceId,
            customerEmail: requestData.customerEmail,
          },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Inicializar cliente Polar con más logging
    console.log("Inicializando cliente Polar con configuración:", {
      environment,
      hasAccessToken: !!polarAccessToken,
    });

    const polar = new Polar({
      accessToken: polarAccessToken,
      server: environment === "production" ? "production" : "sandbox",
    });

    try {
      const checkoutSession = await polar.checkouts.create({
        productPriceId: requestData.productPriceId,
        successUrl: requestData.successUrl || `${siteUrl}/checkout/success`,
        cancelUrl: requestData.cancelUrl || `${siteUrl}/pricing`,
        customerEmail: requestData.customerEmail,
        metadata: requestData.metadata || {},
        currency: "eur",
      });

      console.log("Sesión de checkout creada exitosamente:", {
        hasUrl: !!checkoutSession?.url,
        sessionId: checkoutSession?.id,
      });

      return new Response(JSON.stringify({ url: checkoutSession.url }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (polarError) {
      console.error("Error de Polar al crear checkout:", {
        error: polarError,
        message: polarError.message,
        stack: polarError.stack,
      });

      return new Response(
        JSON.stringify({
          error: "Error al crear sesión de checkout",
          details: polarError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error general en el endpoint:", {
      error,
      message: error.message,
      stack: error.stack,
    });

    return new Response(
      JSON.stringify({
        error: "Error interno del servidor",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Asegurarnos de usar una versión de Stripe compatible con Deno
import Stripe from "https://esm.sh/stripe@13.7.0?target=deno&deno-std=0.168.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Función principal del webhook
serve(async (req) => {
  // Manejar solicitudes OPTIONS para CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Verificar que la solicitud provenga de Stripe (basado en IP)
  const clientIP = req.headers.get("x-forwarded-for") || "unknown";
  const stripeIPs = [
    "3.18.12.63",
    "3.130.192.231",
    // Añadir más IPs de Stripe según sea necesario
  ];

  if (!stripeIPs.includes(clientIP)) {
    console.warn(`Request from non-Stripe IP: ${clientIP}`);
    // No rechazar, pero registrar para monitoreo
    await supabase.from("webhook_events").insert({
      event_type: "security_warning",
      payload: { 
        warning: "Request from non-Stripe IP",
        ip: clientIP
      },
      processed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      error: "Non-Stripe IP",
    });
  }

  // Verificar el tiempo de la solicitud para evitar ataques de replay
  const timestampHeader = req.headers.get("stripe-signature").split(",")[0].split("=")[1];
  const timestamp = parseInt(timestampHeader);
  const now = Math.floor(Date.now() / 1000);

  if (now - timestamp > 300) { // 5 minutos
    throw new Error("Webhook too old, possible replay attack");
  }

  // Inicializar cliente de Supabase para registrar eventos
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
  );

  try {
    // Obtener el cuerpo de la solicitud como texto
    const rawBody = await req.text();

    // Registrar la recepción del webhook para diagnóstico
    await supabase.from("webhook_events").insert({
      event_type: "webhook_received",
      payload: {
        bodyLength: rawBody.length,
        headers: Object.fromEntries(
          [...req.headers.entries()].filter(
            ([key]) =>
              !key.toLowerCase().includes("authorization") &&
              !key.toLowerCase().includes("apikey")
          )
        ),
      },
      processed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      error: null,
    });

    // Obtener la firma de Stripe del encabezado
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No Stripe signature found in request headers");
    }

    // Obtener el secreto del webhook
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("Webhook secret not configured in environment variables");
    }

    // Inicializar cliente de Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Construir el evento usando constructEventAsync (versión asíncrona)
    let event;
    try {
      // IMPORTANTE: Usar constructEventAsync en lugar de constructEvent
      event = await stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        webhookSecret
      );

      // Registrar evento construido exitosamente
      await supabase.from("webhook_events").insert({
        event_type: "event_constructed",
        payload: { eventType: event.type, eventId: event.id },
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        error: null,
      });
    } catch (err) {
      // Registrar error de verificación de firma
      await supabase.from("webhook_events").insert({
        event_type: "signature_verification_failed",
        payload: {
          error: err.message,
          rawBodyLength: rawBody.length,
          signaturePresent: !!signature,
        },
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        error: err.message,
      });

      return new Response(
        JSON.stringify({
          error: "Webhook signature verification failed",
          details: err.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar si el evento ya ha sido procesado
    const { data: existingEvent } = await supabase
      .from("webhook_events")
      .select("id")
      .eq("payload->id", event.id)
      .maybeSingle();

    if (existingEvent) {
      console.log(`Event ${event.id} already processed, skipping`);
      return new Response(JSON.stringify({ received: true, status: "already_processed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Registrar el evento con su ID original de Stripe
    const { error: insertError } = await supabase
      .from("webhook_events")
      .insert({
        event_type: event.type,
        payload: {
          ...event.data.object,
          id: event.id // Guardar el ID del evento para idempotencia
        },
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        error: null,
      });

    if (insertError) {
      throw insertError;
    }

    // Procesar el evento según su tipo
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;

        // Validar que los datos necesarios estén presentes
        if (!session.subscription || !session.customer) {
          await supabase.from("webhook_events").insert({
            event_type: "validation_error",
            payload: { 
              error: "Missing required fields in checkout session",
              session_id: session.id
            },
            processed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            error: "Missing required fields in checkout session",
          });
          break;
        }
        
        // Validar que el user_id esté presente en los metadatos
        if (!session.metadata?.user_id) {
          await supabase.from("webhook_events").insert({
            event_type: "validation_error",
            payload: { 
              error: "Missing user_id in session metadata",
              session_id: session.id
            },
            processed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            error: "Missing user_id in session metadata",
          });
          break;
        }
        
        // Obtener detalles de la suscripción
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription
        );

        // Preparar datos de la suscripción
        const subscriptionData = {
          user_id: session.metadata?.user_id,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          plan_type: session.metadata?.plan_name?.toLowerCase() || "default",
          status: subscription.status,
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
          is_active: subscription.status === "active",
        };

        // Registrar los datos de suscripción que vamos a insertar
        await supabase.from("webhook_events").insert({
          event_type: "subscription_data_prepared",
          payload: subscriptionData,
          processed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          error: null,
        });

        // Función de utilidad para reintentar operaciones
        async function retryOperation(operation, maxRetries = 3) {
          let lastError;
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              return await operation();
            } catch (error) {
              lastError = error;
              // Esperar un tiempo exponencial antes de reintentar
              if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
              }
            }
          }
          throw lastError;
        }

        // Uso en operaciones críticas
        try {
          await retryOperation(async () => {
            const { error } = await supabase
              .from("subscriptions")
              .upsert(subscriptionData, {
                onConflict: "user_id",
                returning: "minimal",
              });
            
            if (error) throw error;
          });
        } catch (error) {
          // Manejar el error después de agotar los reintentos
        }
        break;

      case "customer.subscription.updated":
        const updatedSubscription = event.data.object;
        const subscriptionUpdateData = {
          user_id: updatedSubscription.metadata?.user_id,
          stripe_subscription_id: updatedSubscription.id,
          status: updatedSubscription.status,
          current_period_end: new Date(
            updatedSubscription.current_period_end * 1000
          ).toISOString(),
          is_active: updatedSubscription.status === "active",
        };
        
        await supabase
          .from("subscriptions")
          .update(subscriptionUpdateData)
          .eq("stripe_subscription_id", updatedSubscription.id);
        break;
        
      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object;
        await supabase
          .from("subscriptions")
          .update({ 
            status: "canceled", 
            is_active: false,
            canceled_at: new Date().toISOString()
          })
          .eq("stripe_subscription_id", deletedSubscription.id);
        break;
        
      case "invoice.payment_failed":
        const failedInvoice = event.data.object;
        // Notificar al usuario sobre el pago fallido
        await supabase.from("webhook_events").insert({
          event_type: "payment_failure_notification",
          payload: { 
            customer: failedInvoice.customer,
            invoice: failedInvoice.id,
            attempt_count: failedInvoice.attempt_count
          },
          processed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          error: null,
        });
        break;
    }

    // Responder con éxito
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    // Función para enviar alertas (implementación depende de tu sistema)
    async function sendAlert(message, severity = "warning") {
      // Ejemplo: registrar en una tabla específica para alertas
      await supabase.from("system_alerts").insert({
        source: "stripe_webhook",
        message,
        severity,
        created_at: new Date().toISOString(),
      });
      
      // Aquí podrías integrar con servicios como Slack, Email, etc.
    }

    // Uso en caso de errores críticos
    catch (error) {
      console.error("Webhook error:", error);
      
      // Enviar alerta para errores críticos
      await sendAlert(`Error crítico en webhook de Stripe: ${error.message}`, "critical");
      
      // Registrar el error en la base de datos
      await supabase.from("webhook_events").insert({
        event_type: "fatal_error",
        payload: {
          error: error.message,
          stack: error.stack,
        },
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        error: error.message,
      });

      // Responder con error
      return new Response(
        JSON.stringify({
          error: "Webhook processing failed",
          details: error.message,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
  }
});

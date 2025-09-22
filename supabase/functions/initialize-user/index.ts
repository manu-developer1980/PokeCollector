import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0";
import { getCorsHeaders } from "../_shared/cors.ts";

const APRENDIZ_PRICE_ID = "price_1R4KH1EoOyqILXNqxnOSjJHZ";

serve(async (req) => {
  // Obtener headers de CORS al inicio
  const corsHeaders = getCorsHeaders(req);
  
  console.log("🚀 Initialize-user - Método:", req.method);
  console.log("🚀 Initialize-user - Origin:", req.headers.get("Origin"));
  console.log("🚀 Initialize-user - Headers CORS:", corsHeaders);

  // Manejar peticiones preflight OPTIONS
  if (req.method === "OPTIONS") {
    console.log("✅ Respondiendo a petición OPTIONS con headers CORS");
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }
  
  // Solo permitir método POST para esta función
  if (req.method !== "POST") {
    console.log("❌ Método no permitido:", req.method);
    return new Response(
      JSON.stringify({ error: "Método no permitido" }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const { user_id } = await req.json();
    console.log("📥 Iniciando inicialización para usuario:", user_id);

    if (!user_id) {
      throw new Error("user_id is required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2023-10-16",
    });

    // 1. Obtener datos del usuario
    const { data: authUser, error: authError } =
      await supabase.auth.admin.getUserById(user_id);

    if (authError || !authUser.user) {
      console.error("❌ Error al obtener datos de auth:", authError);
      throw new Error("Usuario no encontrado en auth");
    }

    console.log("✅ Datos de usuario obtenidos:", authUser.user.email);

    try {
      // 1. Verificar si el usuario ya tiene una suscripción en Stripe
      const { data: existingSubscriptions, error: subscriptionError } =
        await supabase.from("subscriptions").select("*").eq("user_id", user_id);

      if (subscriptionError) {
        console.error(
          "Error al verificar suscripciones existentes:",
          subscriptionError
        );
        throw subscriptionError;
      }

      const existingSubscription =
        existingSubscriptions && existingSubscriptions.length > 0
          ? existingSubscriptions[0]
          : null;

      if (existingSubscription?.stripe_customer_id) {
        console.log("Usuario ya tiene suscripción en Stripe");
        return new Response(
            JSON.stringify({ message: "User already initialized" }),
          { 
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // 2. Verificar si ya existe un cliente en Stripe con este email
      console.log("🔍 Verificando clientes existentes en Stripe para:", authUser.user.email);
      const existingCustomers = await stripe.customers.list({
        email: authUser.user.email,
        limit: 1,
      });

      let customer;
      if (existingCustomers.data.length > 0) {
        // Cliente ya existe en Stripe, usar el existente
        customer = existingCustomers.data[0];
        console.log("✅ Cliente existente encontrado en Stripe:", customer.id);
        
        // Actualizar metadata si es necesario
        if (!customer.metadata?.user_id || customer.metadata.user_id !== user_id) {
          customer = await stripe.customers.update(customer.id, {
            metadata: {
              ...customer.metadata,
              user_id: user_id,
            },
          });
          console.log("✅ Metadata del cliente actualizada");
        }
      } else {
        // 3. Crear nuevo cliente en Stripe solo si no existe
        console.log("🔄 Creando nuevo cliente en Stripe...");
        customer = await stripe.customers.create({
          email: authUser.user.email,
          metadata: {
            user_id: user_id,
          },
        });
        console.log("✅ Nuevo cliente Stripe creado:", customer.id);
      }

      // 4. Verificar si el cliente ya tiene suscripciones activas
      const customerSubscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1,
      });

      let subscription;
      if (customerSubscriptions.data.length > 0) {
        // Cliente ya tiene una suscripción activa, usar la existente
        subscription = customerSubscriptions.data[0];
        console.log("✅ Suscripción activa existente encontrada:", subscription.id);
      } else {
        // 5. Crear nueva suscripción solo si no existe una activa
        console.log("🔄 Creando nueva suscripción en Stripe...");
        subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: APRENDIZ_PRICE_ID }],
          metadata: {
            user_id: user_id,
          },
        });
        console.log("✅ Nueva suscripción Stripe creada:", subscription.id);
      }

      // 4. Actualizar en Supabase
      const { error: updateError } = await supabase
        .from("subscriptions")
        .upsert({
          user_id: user_id,
          stripe_customer_id: customer.id,
          stripe_subscription_id: subscription.id,
          stripe_price_id: APRENDIZ_PRICE_ID,
          status: subscription.status,
          plan_type: "aprendiz",
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          is_active: subscription.status === "active",
        });

      if (updateError) {
        console.error("❌ Error al actualizar suscripción:", updateError);
        throw updateError;
      }
    } catch (error) {
      console.error("Error en initialize-user:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({
        message: "Usuario inicializado correctamente",
        status: "success",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error en el proceso de inicialización:", error);

    // Asegurar que los headers de CORS estén presentes en caso de error
    const errorHeaders = {
      ...corsHeaders,
      "Content-Type": "application/json",
    };

    console.log("🔧 Headers de respuesta de error:", errorHeaders);
    console.log("🔧 Detalles del error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return new Response(
      JSON.stringify({
        error: error.message || "Error al inicializar usuario",
        details: error.toString(),
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500, // Usar código de error apropiado
        headers: errorHeaders,
      }
    );
  }
});

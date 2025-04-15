import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0";
import { getCorsHeaders } from "../_shared/cors.ts";

const APRENDIZ_PRICE_ID = "price_1R4KH1EoOyqILXNqxnOSjJHZ";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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
          { status: 200 }
        );
      }

      // 2. Crear cliente en Stripe
      console.log("🔄 Creando cliente en Stripe...");
      const customer = await stripe.customers.create({
        email: authUser.user.email,
        metadata: {
          user_id: user_id,
        },
      });
      console.log("✅ Cliente Stripe creado:", customer.id);

      // 3. Crear suscripción en Stripe
      console.log("🔄 Creando suscripción en Stripe...");
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: APRENDIZ_PRICE_ID }],
        metadata: {
          user_id: user_id,
        },
      });
      console.log("✅ Suscripción Stripe creada:", subscription.id);

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

    // Asegurarnos de que los encabezados CORS estén presentes incluso en caso de error
    const errorHeaders = {
      ...corsHeaders,
      "Content-Type": "application/json",
    };

    // Imprimir los encabezados para depuración
    console.log("Encabezados de respuesta de error:", errorHeaders);

    return new Response(
      JSON.stringify({
        error: error.message || "Error al inicializar usuario",
        details: error.toString(),
      }),
      {
        headers: errorHeaders,
        status: 200, // Cambiamos a 200 para evitar problemas con CORS en errores
      }
    );
  }
});

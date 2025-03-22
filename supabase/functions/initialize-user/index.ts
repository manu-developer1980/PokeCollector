import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.4.0?target=deno";
import { corsHeaders } from "../_shared/cors.ts";

const APRENDIZ_PRICE_ID = "price_1R4KH1EoOyqILXNqxnOSjJHZ";

serve(async (req) => {
  // Always add CORS headers
  const headers = corsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers,
    });
  }

  try {
    const { user_id } = await req.json();

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

    // 1. Obtener información del usuario
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("email")
      .eq("id", user_id)
      .single();

    if (userDataError) {
      throw userDataError;
    }

    // 2. Verificar si ya existe una suscripción
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (!existingSub) {
      // 3. Crear cliente en Stripe
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          user_id: user_id,
        },
      });

      // 4. Crear suscripción en Stripe
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: APRENDIZ_PRICE_ID }],
        metadata: {
          user_id: user_id,
        },
      });

      // 5. Crear suscripción en la base de datos
      const { error: subError } = await supabase.from("subscriptions").insert({
        user_id: user_id,
        plan_type: "aprendiz",
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customer.id,
        stripe_price_id: APRENDIZ_PRICE_ID,
        status: subscription.status,
        current_period_end: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        is_active: subscription.status === "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (subError) {
        console.error("Error creating subscription:", subError);
        throw subError;
      }

      console.log("✅ Successfully created subscription:", {
        userId: user_id,
        subscriptionId: subscription.id,
        customerId: customer.id,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "User initialized successfully",
      }),
      {
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Initialize user error:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Error initializing user",
        details: error,
      }),
      {
        status: 400,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

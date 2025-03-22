import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://poke-collector.netlify.app",
];

function getCorsHeaders(origin: string | null) {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Verify the request origin
  if (!ALLOWED_ORIGINS.includes(origin ?? "")) {
    return new Response(JSON.stringify({ error: "Invalid origin" }), {
      status: 403,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }

  try {
    const { user_id } = await req.json();

    // 1. Verificar si el usuario ya tiene una suscripción
    const { data: existingSubscription } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (existingSubscription) {
      return new Response(
        JSON.stringify({ message: "Subscription already exists" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 200,
        }
      );
    }

    // 2. Obtener información del usuario
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("email, full_name")
      .eq("id", user_id)
      .single();

    if (userError || !userData) {
      throw new Error("User not found");
    }

    // 3. Crear cliente en Stripe
    const customer = await stripe.customers.create({
      email: userData.email,
      name: userData.full_name,
      metadata: {
        supabase_user_id: user_id,
      },
    });

    // 4. Crear suscripción gratuita
    const { error: subscriptionError } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        user_id,
        plan_type: "aprendiz",
        status: "active",
        stripe_customer_id: customer.id,
        stripe_price_id: "price_1R4KH1EoOyqILXNqxnOSjJHZ", // ID del plan gratuito
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        is_active: true,
      });

    if (subscriptionError) {
      throw subscriptionError;
    }

    return new Response(
      JSON.stringify({
        message: "User initialized successfully",
        customer_id: customer.id,
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
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 400,
    });
  }
});

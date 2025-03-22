import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.4.0?target=deno";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://poke-collector.netlify.app",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS.join(", "),
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const { user_id } = await req.json();
    console.log("Initializing user:", user_id);

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

    // 1. Crear o actualizar usuario
    const { error: userError } = await supabase.from("users").upsert(
      {
        id: user_id,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      }
    );

    if (userError) {
      throw userError;
    }

    // 2. Verificar si ya existe una suscripción
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (!existingSub) {
      // 3. Crear suscripción gratuita por defecto
      const { error: subError } = await supabase.from("subscriptions").insert({
        user_id: user_id,
        status: "active",
        plan_type: "free",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (subError) {
        throw subError;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "User initialized successfully",
      }),
      {
        headers: {
          ...corsHeaders,
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
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

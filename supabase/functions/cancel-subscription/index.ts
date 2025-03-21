import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.4.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { subscriptionId, userId } = await req.json();

    if (!subscriptionId || !userId) {
      return new Response(
        JSON.stringify({ error: "subscription_id and user_id are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Primero verificar el estado actual de la suscripción
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Si la suscripción ya está cancelada o en proceso de cancelación, considerarlo un éxito
    if (
      subscription.status === "canceled" ||
      subscription.cancel_at_period_end
    ) {
      return new Response(
        JSON.stringify({ message: "Subscription already cancelled" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Si no está cancelada, proceder con la cancelación
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    // Actualizar la base de datos
    const { error: dbError } = await supabase
      .from("subscriptions")
      .update({
        cancel_at_period_end: true,
        status: updatedSubscription.status,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscriptionId)
      .eq("user_id", userId);

    if (dbError) {
      throw dbError;
    }

    return new Response(
      JSON.stringify({ message: "Subscription cancelled successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Error al cancelar la suscripción",
        details: error,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

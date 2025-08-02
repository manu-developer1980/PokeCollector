import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0";
import { getCorsHeaders } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { subscriptionId, newPriceId } = await req.json();
    console.log("Received request:", { subscriptionId, newPriceId });

    // Obtener la suscripción actual y el nuevo precio
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentPrice = subscription.items.data[0].price;
    const newPrice = await stripe.prices.retrieve(newPriceId);

    console.log("Price details:", {
      currentPriceId: currentPrice.id,
      newPriceId: newPrice.id,
      currentPlanType: currentPrice.metadata.plan_type,
      newPlanType: newPrice.metadata.plan_type,
    });

    // Determinar si es un downgrade comparando los precios y el tipo de plan
    const isDowngrade =
      newPrice.unit_amount < currentPrice.unit_amount ||
      newPrice.metadata.plan_type.toUpperCase() === "APRENDIZ";

    console.log("Is downgrade:", isDowngrade, {
      newPlanType: newPrice.metadata.plan_type,
      currentPrice: currentPrice.unit_amount,
      newPrice: newPrice.unit_amount,
    });

    const updateParams = {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: isDowngrade ? "none" : "always_invoice",
      // Solo establecer cancel_at_period_end si es un downgrade a APRENDIZ
      cancel_at_period_end:
        isDowngrade && newPrice.metadata.plan_type.toUpperCase() === "APRENDIZ",
      metadata: {
        plan_type: newPrice.metadata.plan_type.toLowerCase(),
      },
    };

    console.log("Updating subscription with params:", updateParams);
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      updateParams
    );

    // Actualizar inmediatamente en Supabase
    const dbUpdate = {
      plan_type: newPrice.metadata.plan_type.toLowerCase(),
      stripe_price_id: newPriceId,
      cancel_at_period_end: isDowngrade,
      updated_at: new Date().toISOString(),
      status: updatedSubscription.status,
      current_period_end: new Date(
        updatedSubscription.current_period_end * 1000
      ).toISOString(),
    };

    console.log("Updating database with:", dbUpdate);

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update(dbUpdate)
      .eq("stripe_subscription_id", subscriptionId);

    if (updateError) {
      console.error("Error updating subscription in database:", updateError);
      throw updateError;
    }

    return new Response(JSON.stringify(updatedSubscription), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in change-subscription:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error changing subscription" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

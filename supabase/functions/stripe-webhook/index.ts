import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  console.log("Webhook request received"); // Log inicial

  const signature = req.headers.get("stripe-signature");
  console.log("Stripe signature present:", !!signature); // Verificar firma

  const body = await req.text();
  console.log("Request body length:", body.length); // Verificar cuerpo

  try {
    let event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        Deno.env.get("STRIPE_WEBHOOK_SECRET")
      );
      console.log("Event constructed successfully:", event.type); // Confirmar construcción
    } catch (err) {
      console.error("⚠️ Error validating webhook:", err.message);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 400,
      });
    }

    console.log("🔔 Processing webhook event:", {
      type: event.type,
      id: event.id,
      timestamp: new Date().toISOString(),
    });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("Checkout session completed:", session);

        // Actualizar la suscripción en la base de datos
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            status: "active",
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", session.metadata.user_id);

        if (updateError) {
          console.error("Error updating subscription:", updateError);
          throw updateError;
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const currentPriceId = subscription.items.data[0].price.id;

        console.log("📦 Subscription update details:", {
          subscriptionId: subscription.id,
          priceId: currentPriceId,
          status: subscription.status,
          customerId: subscription.customer,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
        });

        const { data: existingSub, error: fetchError } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (fetchError) {
          console.error("Error fetching subscription:", fetchError);
          throw fetchError;
        }

        const PRICE_TO_PLAN = {
          price_1R4KGgEoOyqILXNqf6Z2vjqQ: "entrenador",
          price_1R4KHlEoOyqILXNqqX7gkWWJ: "maestro",
          price_1R4KH1EoOyqILXNqxnOSjJHZ: "aprendiz",
        } as const;

        const plan_type =
          PRICE_TO_PLAN[currentPriceId as keyof typeof PRICE_TO_PLAN];
        if (!plan_type) {
          throw new Error(`Invalid price ID: ${currentPriceId}`);
        }

        const updateData = {
          plan_type,
          status: subscription.status,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer,
          stripe_price_id: currentPriceId,
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          is_active: subscription.status === "active",
          updated_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
          .from("subscriptions")
          .update(updateData)
          .eq("stripe_subscription_id", subscription.id)
          .eq("user_id", existingSub.user_id);

        if (updateError) {
          console.error("Failed to update subscription:", updateError);
          throw updateError;
        }

        console.log("✅ Successfully processed subscription update:", {
          subscriptionId: subscription.id,
          userId: existingSub.user_id,
          newPlanType: plan_type,
          effectiveDate: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
        });
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
    });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
    });
  }
});

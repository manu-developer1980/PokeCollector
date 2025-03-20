import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.18.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mapeo de precios de Stripe a tipos de plan
const PRICE_TO_PLAN_TYPE: Record<
  string,
  "aprendiz" | "entrenador" | "maestro"
> = {
  price_1R4KGgEoOyqILXNqf6Z2vjqQ: "entrenador",
  price_1R4KH1EoOyqILXNqxnOSjJHZ: "aprendiz",
  price_1R4KHlEoOyqILXNqqX7gkWWJ: "maestro",
};

serve(async (req) => {
  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response("No signature provided", { status: 400 });
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log(`Processing Stripe event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.user_id;

        if (!userId) {
          throw new Error("Missing user_id in session metadata");
        }

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription
        );
        const priceId = subscription.items.data[0].price.id;
        const planType = PRICE_TO_PLAN_TYPE[priceId];

        if (!planType) {
          throw new Error(`Unknown price_id: ${priceId}`);
        }

        const { error: updateError } = await supabase
          .from("subscriptions")
          .upsert({
            user_id: userId,
            stripe_subscription_id: session.subscription,
            stripe_customer_id: session.customer,
            stripe_price_id: priceId,
            status: subscription.status,
            plan_type: planType,
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            is_active: subscription.status === "active",
            updated_at: new Date().toISOString(),
          });

        if (updateError) {
          console.error("Error updating subscription:", updateError);
          throw updateError;
        }

        console.log(`Successfully updated subscription for user ${userId}`);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Error processing webhook:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0";
import { handlePlanDowngrade } from "../handle-subscription-update/index.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")
    );

    switch (event.type) {
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const previousAttributes = event.data.previous_attributes;

        // Si cambió el precio/plan
        if (previousAttributes.items) {
          const newPriceId = subscription.items.data[0].price.id;
          const { data: priceData } = await stripe.prices.retrieve(newPriceId);
          const newPlanType = priceData.metadata.plan_type;

          // Actualizar en base de datos
          await supabase
            .from("subscriptions")
            .update({
              plan_type: newPlanType,
              current_period_end: new Date(
                subscription.current_period_end * 1000
              ),
              status: subscription.status,
            })
            .eq("stripe_subscription_id", subscription.id);

          // Si es downgrade, ejecutar limpieza
          if (
            subscription.status === "active" &&
            previousAttributes.items.data[0].price.unit_amount >
              subscription.items.data[0].price.unit_amount
          ) {
            await handlePlanDowngrade(subscription.customer, newPlanType);
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        if (invoice.billing_reason === "subscription_update") {
          // Actualizar estado de pago en la base de datos
          await supabase
            .from("subscription_changes")
            .update({
              status: "completed",
              paid_amount: invoice.amount_paid,
            })
            .eq("invoice_id", invoice.id);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
    });
  }
});

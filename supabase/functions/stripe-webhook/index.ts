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
  // Solo registramos información básica en producción
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  try {
    let event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        Deno.env.get("STRIPE_WEBHOOK_SECRET")
      );
    } catch (err) {
      console.error("⚠️ Error validating webhook:", err.message);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 400,
      });
    }

    // Procesando el evento de webhook

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        // Checkout session completada

        // Verificar que tenemos los datos necesarios
        if (!session.metadata?.user_id) {
          console.error("\u26a0️ Missing user_id in session metadata");
          return new Response(
            JSON.stringify({ error: "Missing user_id in session metadata" }),
            {
              status: 400,
            }
          );
        }

        if (!session.subscription) {
          console.error("\u26a0️ Missing subscription ID in session");
          return new Response(
            JSON.stringify({ error: "Missing subscription ID in session" }),
            {
              status: 400,
            }
          );
        }

        // Obtener la suscripción de Stripe para obtener más detalles
        const stripeSubscription = await stripe.subscriptions.retrieve(
          session.subscription
        );

        // Obtener el ID del precio actual
        const currentPriceId = stripeSubscription.items.data[0].price.id;

        // Mapeo de IDs de precio a tipos de plan (usando minúsculas para coincidir con el ENUM de la base de datos)
        const PRICE_TO_PLAN = {
          price_1R4KGgEoOyqILXNqf6Z2vjqQ: "entrenador",
          price_1R4KHlEoOyqILXNqqX7gkWWJ: "maestro",
          price_1R4KH1EoOyqILXNqxnOSjJHZ: "aprendiz",
        } as const;

        // Determinar el tipo de plan
        const plan_type =
          PRICE_TO_PLAN[currentPriceId as keyof typeof PRICE_TO_PLAN];
        if (!plan_type) {
          console.error(`\u26a0️ Invalid price ID: ${currentPriceId}`);
          return new Response(
            JSON.stringify({ error: `Invalid price ID: ${currentPriceId}` }),
            {
              status: 400,
            }
          );
        }

        // Primero verificamos si ya existe una suscripción para este usuario

        const { data: existingSubs, error: fetchError } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", session.metadata.user_id);

        if (fetchError) {
          console.error(
            "\u26a0️ Error fetching existing subscriptions:",
            fetchError
          );
          console.error("Error completo:", JSON.stringify(fetchError, null, 2));
          throw fetchError;
        }

        // Verificar si encontramos suscripciones existentes

        // Datos para actualizar o insertar
        const subscriptionData = {
          user_id: session.metadata.user_id,
          plan_type,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          stripe_price_id: currentPriceId,
          status: stripeSubscription.status,
          current_period_end: new Date(
            stripeSubscription.current_period_end * 1000
          ).toISOString(),
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          is_active: stripeSubscription.status === "active",
          updated_at: new Date().toISOString(),
        };

        let updateResult;

        // Si existe una suscripción, la actualizamos
        if (existingSubs && existingSubs.length > 0) {
          // Primero intentamos con el ID de la suscripción
          updateResult = await supabase
            .from("subscriptions")
            .update(subscriptionData)
            .eq("id", existingSubs[0].id)
            .select();

          if (updateResult.error) {
            // Si falla, intentamos con el user_id
            updateResult = await supabase
              .from("subscriptions")
              .update(subscriptionData)
              .eq("user_id", session.metadata.user_id)
              .select();
          }
        } else {
          // Si no existe, creamos una nueva

          updateResult = await supabase
            .from("subscriptions")
            .insert({
              ...subscriptionData,
              created_at: new Date().toISOString(),
            })
            .select();
        }

        if (updateResult.error) {
          console.error(
            "\u26a0️ Error updating/inserting subscription:",
            updateResult.error
          );
          console.error(
            "Error completo:",
            JSON.stringify(updateResult.error, null, 2)
          );
          throw updateResult.error;
        }

        // Suscripción actualizada exitosamente

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const currentPriceId = subscription.items.data[0].price.id;

        // Procesando actualización de suscripción

        const { data: existingSub, error: fetchError } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (fetchError) {
          console.error("Error fetching subscription:", fetchError);
          console.error("Error completo:", JSON.stringify(fetchError, null, 2));

          // Si no encontramos la suscripción por stripe_subscription_id, intentamos buscarla por customer_id
          // Intentar buscar por customer_id como alternativa
          const { data: customerSub, error: customerFetchError } =
            await supabase
              .from("subscriptions")
              .select("*")
              .eq("stripe_customer_id", subscription.customer)
              .order("created_at", { ascending: false })
              .limit(1);

          if (customerFetchError) {
            throw customerFetchError;
          }

          if (customerSub && customerSub.length > 0) {
            return customerSub[0];
          }

          throw fetchError;
        }

        // Suscripción encontrada, proceder con la actualización

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

        const subscriptionUpdateData = {
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

        // Actualizando suscripción

        // Primero intentamos actualizar por ID
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update(subscriptionUpdateData)
          .eq("id", existingSub.id);

        if (updateError) {
          console.error("Failed to update subscription by ID:", updateError);
          console.error(
            "Error completo:",
            JSON.stringify(updateError, null, 2)
          );

          // Si falla, intentamos por stripe_subscription_id y user_id
          const { error: secondUpdateError } = await supabase
            .from("subscriptions")
            .update(subscriptionUpdateData)
            .eq("stripe_subscription_id", subscription.id)
            .eq("user_id", existingSub.user_id);

          if (secondUpdateError) {
            console.error(
              "Failed to update subscription by stripe_subscription_id and user_id:",
              secondUpdateError
            );
            throw secondUpdateError;
          }
        }
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

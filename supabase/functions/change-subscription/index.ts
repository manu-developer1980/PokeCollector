// Cambia el plan de una suscripción existente IN SITU (upgrade/downgrade).
//
// - Autorización: el dueño de la suscripción o un admin.
// - Downgrade a aprendiz (gratis) = cancelar al final del período; el plan
//   no cambia en la BD hasta que el webhook reciba subscription.deleted.
// - Upgrades se facturan prorrateados al momento; downgrades de pago se
//   aplican sin prorrateo (el usuario ya pagó el período en curso).
// - La BD se actualiza con lo que Stripe DEVUELVE, nunca con suposiciones.
//   El webhook (customer.subscription.updated) vuelve a sincronizar después,
//   así que cualquier divergencia se autocorrige.

import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { getCorsHeaders } from "../_shared/cors.ts";
import {
  createServiceClient,
  getAuthenticatedUser,
  jsonResponse,
} from "../_shared/auth.ts";
import { isActiveStatus, resolvePlanType } from "../_shared/plans.ts";

// deno-lint-ignore no-explicit-any
declare const Deno: any;

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const caller = await getAuthenticatedUser(req);
    if (!caller) {
      return jsonResponse({ error: "No autenticado" }, 401, corsHeaders);
    }

    const { subscriptionId, newPriceId } = await req.json();
    if (!subscriptionId || !newPriceId) {
      return jsonResponse(
        { error: "Faltan subscriptionId y/o newPriceId" },
        400,
        corsHeaders
      );
    }

    // La suscripción debe pertenecer al que llama, salvo que sea admin.
    const supabase = createServiceClient();
    const { data: row, error: rowError } = await supabase
      .from("subscriptions")
      .select("id, user_id, plan_type")
      .eq("stripe_subscription_id", subscriptionId)
      .single();

    if (rowError || !row) {
      return jsonResponse(
        { error: "Suscripción no encontrada" },
        404,
        corsHeaders
      );
    }
    if (row.user_id !== caller.id && !caller.isAdmin) {
      return jsonResponse({ error: "No autorizado" }, 403, corsHeaders);
    }

    const newPlan = resolvePlanType(newPriceId);
    if (!newPlan) {
      return jsonResponse(
        { error: `Price desconocido: ${newPriceId}` },
        400,
        corsHeaders
      );
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentPrice = subscription.items.data[0].price;
    const currentPlan =
      resolvePlanType(currentPrice.id, currentPrice.metadata?.plan_type) ??
      row.plan_type;

    if (newPlan === currentPlan) {
      return jsonResponse(
        { error: "La suscripción ya está en ese plan" },
        400,
        corsHeaders
      );
    }

    let updated: Stripe.Subscription;

    if (newPlan === "aprendiz") {
      // Downgrade a gratis: cancelar al final del período. El usuario
      // conserva su plan actual hasta entonces; el webhook lo pasará a
      // aprendiz cuando llegue subscription.deleted.
      updated = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } else {
      const PLAN_RANK: Record<string, number> = {
        aprendiz: 1,
        entrenador: 2,
        maestro: 3,
      };
      const isUpgrade = PLAN_RANK[newPlan] > PLAN_RANK[currentPlan];

      updated = await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: isUpgrade ? "always_invoice" : "none",
        // Un cambio a plan de pago siempre anula una cancelación pendiente.
        cancel_at_period_end: false,
        metadata: { ...subscription.metadata, user_id: row.user_id },
      });
    }

    // Reflejar en la BD el estado REAL que devolvió Stripe.
    const updatedPrice = updated.items.data[0].price;
    const dbUpdate = {
      plan_type:
        resolvePlanType(updatedPrice.id, updatedPrice.metadata?.plan_type) ??
        row.plan_type,
      stripe_price_id: updatedPrice.id,
      status: updated.status,
      cancel_at_period_end: updated.cancel_at_period_end,
      is_active: isActiveStatus(updated.status),
      current_period_end: new Date(
        updated.current_period_end * 1000
      ).toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update(dbUpdate)
      .eq("id", row.id);

    if (updateError) {
      // Stripe ya cambió; el webhook resincronizará la BD. Avisamos igualmente.
      console.error("⚠️ Stripe actualizado pero la BD falló:", updateError);
    }

    return jsonResponse(
      {
        subscription: { id: updated.id, status: updated.status },
        plan_type: dbUpdate.plan_type,
        cancel_at_period_end: dbUpdate.cancel_at_period_end,
      },
      200,
      corsHeaders
    );
  } catch (error) {
    console.error("❌ Error en change-subscription:", error);
    return jsonResponse(
      { error: (error as Error).message ?? "Error cambiando el plan" },
      500,
      corsHeaders
    );
  }
});

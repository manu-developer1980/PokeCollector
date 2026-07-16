// Cancela la suscripción del usuario al final del período en curso.
//
// El usuario se deriva del JWT; solo puede cancelar su propia suscripción
// (o cualquiera si es admin). La BD se marca cancel_at_period_end y el
// webhook la pasará al plan gratuito cuando Stripe emita subscription.deleted.

import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { getCorsHeaders } from "../_shared/cors.ts";
import {
  createServiceClient,
  getAuthenticatedUser,
  jsonResponse,
} from "../_shared/auth.ts";

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

    const { subscriptionId } = await req.json();
    if (!subscriptionId) {
      return jsonResponse({ error: "Falta subscriptionId" }, 400, corsHeaders);
    }

    const supabase = createServiceClient();
    const { data: row, error: rowError } = await supabase
      .from("subscriptions")
      .select("id, user_id")
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

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (subscription.status === "canceled" || subscription.cancel_at_period_end) {
      return jsonResponse(
        { message: "La suscripción ya estaba cancelada" },
        200,
        corsHeaders
      );
    }

    const updated = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    const { error: dbError } = await supabase
      .from("subscriptions")
      .update({
        cancel_at_period_end: true,
        status: updated.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (dbError) {
      // Stripe ya quedó cancelada; el webhook resincronizará la BD.
      console.error("⚠️ Stripe cancelada pero la BD falló:", dbError);
    }

    return jsonResponse(
      { message: "Suscripción cancelada al final del período" },
      200,
      corsHeaders
    );
  } catch (error) {
    console.error("❌ Error en cancel-subscription:", error);
    return jsonResponse(
      { error: (error as Error).message ?? "Error cancelando la suscripción" },
      500,
      corsHeaders
    );
  }
});

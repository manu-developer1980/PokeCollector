// Crea una sesión de Stripe Checkout para la PRIMERA suscripción del usuario.
//
// - El usuario se deriva del JWT; el body solo aporta priceId y URLs.
// - Si el usuario ya tiene una suscripción activa devuelve 409: los cambios
//   de plan se hacen in situ con `change-subscription` (nunca un segundo
//   checkout, que crearía una segunda suscripción y un doble cobro).
// - Reutiliza el customer de Stripe (por metadata userId o por email) para
//   no crear duplicados.

import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { getCorsHeaders } from "../_shared/cors.ts";
import {
  createServiceClient,
  getAuthenticatedUser,
  jsonResponse,
} from "../_shared/auth.ts";
import { isPaidPlan, resolvePlanType } from "../_shared/plans.ts";

// deno-lint-ignore no-explicit-any
declare const Deno: any;

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return jsonResponse({ error: "No autenticado" }, 401, corsHeaders);
    }

    const { priceId, successUrl, cancelUrl } = await req.json();
    if (!priceId) {
      return jsonResponse({ error: "Falta priceId" }, 400, corsHeaders);
    }

    const planType = resolvePlanType(priceId);
    if (!planType || !isPaidPlan(planType)) {
      return jsonResponse(
        { error: `El priceId no corresponde a un plan de pago: ${priceId}` },
        400,
        corsHeaders
      );
    }

    // Si ya tiene una suscripción activa, el cambio de plan va por
    // change-subscription: nunca crear una segunda suscripción.
    const supabase = createServiceClient();
    const { data: rows } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id, is_active")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .not("stripe_subscription_id", "is", null)
      .limit(1);

    if (rows && rows.length > 0) {
      return jsonResponse(
        {
          error: "El usuario ya tiene una suscripción activa",
          code: "SUBSCRIPTION_EXISTS",
          subscriptionId: rows[0].stripe_subscription_id,
        },
        409,
        corsHeaders
      );
    }

    const customerId = await findOrCreateCustomer(user.id, user.email ?? "");

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer: customerId,
      success_url:
        successUrl || `${Deno.env.get("SITE_URL")}/checkout-success`,
      cancel_url: cancelUrl || `${Deno.env.get("SITE_URL")}/pricing`,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      metadata: { user_id: user.id },
      subscription_data: {
        metadata: { user_id: user.id },
      },
    });

    return jsonResponse({ url: session.url }, 200, corsHeaders);
  } catch (error) {
    console.error("❌ Error creando checkout:", error);
    return jsonResponse(
      { error: (error as Error).message ?? "Error creando checkout" },
      500,
      corsHeaders
    );
  }
});

/** Busca el customer por metadata userId, luego por email; si no, lo crea. */
async function findOrCreateCustomer(
  userId: string,
  email: string
): Promise<string> {
  const byMetadata = await stripe.customers.search({
    query: `metadata['userId']:'${userId}'`,
    limit: 1,
  });
  if (byMetadata.data.length > 0) {
    return byMetadata.data[0].id;
  }

  if (email) {
    const byEmail = await stripe.customers.list({ email, limit: 100 });
    if (byEmail.data.length > 0) {
      // El más antiguo es el canónico; se etiqueta con el userId.
      const oldest = byEmail.data.reduce(
        (a: Stripe.Customer, b: Stripe.Customer) =>
          a.created <= b.created ? a : b
      );
      await stripe.customers.update(oldest.id, {
        metadata: { ...oldest.metadata, userId },
      });
      return oldest.id;
    }
  }

  const created = await stripe.customers.create({
    email,
    metadata: { userId },
  });
  return created.id;
}

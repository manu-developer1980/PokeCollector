// Webhook de Stripe: ÚNICA fuente de verdad de la tabla `subscriptions`.
//
// Reglas de diseño:
// - Idempotente: reprocesar un evento deja la BD en el mismo estado.
// - Tolerante a eventos desordenados: un evento de una suscripción que ya
//   no es la actual del usuario se ignora en vez de pisar el estado.
// - Un usuario = una fila en `subscriptions` (la más reciente si hubiera
//   duplicados históricos).
// - Fallos de firma → 400. Fallos de proceso → 500 (Stripe reintenta).

import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createServiceClient } from "../_shared/auth.ts";
import { isActiveStatus, resolvePlanType } from "../_shared/plans.ts";

// deno-lint-ignore no-explicit-any
declare const Deno: any;

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();
const supabase = createServiceClient();

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature ?? "",
      Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "",
      undefined,
      cryptoProvider
    );
  } catch (err) {
    console.error("⚠️ Firma de webhook inválida:", (err as Error).message);
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(`📨 Evento: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id
          );
          await syncSubscription(subscription, session.metadata?.user_id);
        }
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(subscription);
        await cancelOtherActiveSubscriptions(subscription);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(
          `❌ Pago fallido: factura ${invoice.id}, customer ${invoice.customer}`
        );
        // El cambio de estado (past_due/canceled) llega por
        // customer.subscription.updated, que ya sincroniza la BD.
        break;
      }

      default:
        console.log(`ℹ️ Evento sin handler: ${event.type}`);
    }
  } catch (err) {
    console.error(`❌ Error procesando ${event.type}:`, err);
    // 500 para que Stripe reintente el evento.
    return new Response(JSON.stringify({ error: "Processing error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

function customerIdOf(subscription: Stripe.Subscription): string {
  return typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;
}

/** Fila más reciente del usuario (una por usuario; tolera duplicados históricos). */
async function findRowByUserId(userId: string) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0] ?? null;
}

/**
 * Averigua a qué usuario pertenece una suscripción de Stripe:
 * 1) metadata.user_id de la suscripción (los checkouts nuevos lo llevan),
 * 2) fila existente con ese stripe_subscription_id,
 * 3) fila existente con ese stripe_customer_id,
 * 4) metadata.userId del customer en Stripe.
 */
async function resolveUserId(
  subscription: Stripe.Subscription,
  hintUserId?: string
): Promise<string | null> {
  if (hintUserId) return hintUserId;
  if (subscription.metadata?.user_id) return subscription.metadata.user_id;

  const { data: bySubId } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscription.id)
    .limit(1);
  if (bySubId?.[0]?.user_id) return bySubId[0].user_id;

  const customerId = customerIdOf(subscription);
  const { data: byCustomer } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(1);
  if (byCustomer?.[0]?.user_id) return byCustomer[0].user_id;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer.deleted && customer.metadata?.userId) {
      return customer.metadata.userId;
    }
  } catch (err) {
    console.warn(`No se pudo recuperar el customer ${customerId}:`, err);
  }

  return null;
}

/** Sincroniza el estado de una suscripción de Stripe con la fila del usuario. */
async function syncSubscription(
  subscription: Stripe.Subscription,
  hintUserId?: string
): Promise<void> {
  const userId = await resolveUserId(subscription, hintUserId);
  if (!userId) {
    console.warn(
      `⚠️ Suscripción ${subscription.id} sin usuario resoluble; se ignora`
    );
    return;
  }

  const price = subscription.items.data[0]?.price;
  const planType = resolvePlanType(price?.id, price?.metadata?.plan_type);
  if (!planType) {
    console.warn(
      `⚠️ Price ${price?.id} de la suscripción ${subscription.id} no mapea a ningún plan; se ignora`
    );
    return;
  }

  const row = await findRowByUserId(userId);

  // Guardia contra eventos desordenados: si la fila apunta a OTRA suscripción,
  // solo dejamos que una suscripción activa/trialing "tome" la fila. Un evento
  // tardío (p. ej. la cancelación de la suscripción antigua tras un upgrade)
  // no debe pisar la suscripción vigente.
  if (
    row?.stripe_subscription_id &&
    row.stripe_subscription_id !== subscription.id &&
    !isActiveStatus(subscription.status)
  ) {
    console.log(
      `ℹ️ Evento de ${subscription.id} ignorado: la suscripción actual del usuario es ${row.stripe_subscription_id}`
    );
    return;
  }

  const values = {
    user_id: userId,
    plan_type: planType,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: customerIdOf(subscription),
    stripe_price_id: price!.id,
    status: subscription.status,
    current_period_end: new Date(
      subscription.current_period_end * 1000
    ).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    is_active: isActiveStatus(subscription.status),
    updated_at: new Date().toISOString(),
  };

  if (row) {
    const { error } = await supabase
      .from("subscriptions")
      .update(values)
      .eq("id", row.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("subscriptions").insert(values);
    if (error) throw error;
  }

  console.log(
    `✅ Usuario ${userId} → plan ${planType} (${subscription.status}, sub ${subscription.id})`
  );
}

/**
 * Al terminar (deleted) la suscripción vigente del usuario, se le devuelve
 * al plan gratuito. Si la suscripción borrada ya no es la vigente (upgrade
 * previo), no se toca nada.
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = await resolveUserId(subscription);
  if (!userId) {
    console.warn(`⚠️ Suscripción borrada ${subscription.id} sin usuario; se ignora`);
    return;
  }

  const row = await findRowByUserId(userId);
  if (!row || row.stripe_subscription_id !== subscription.id) {
    console.log(
      `ℹ️ Borrado de ${subscription.id} ignorado: no es la suscripción vigente del usuario ${userId}`
    );
    return;
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({
      plan_type: "aprendiz",
      status: "canceled",
      cancel_at_period_end: false,
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);
  if (error) throw error;

  console.log(`✅ Usuario ${userId} devuelto al plan aprendiz (fin de ${subscription.id})`);
}

/**
 * Red de seguridad contra dobles cobros: si al crearse una suscripción el
 * customer tiene otras activas, se cancelan inmediatamente. Con el flujo
 * nuevo (cambios de plan in situ) no debería ocurrir, pero protege contra
 * checkouts duplicados.
 */
async function cancelOtherActiveSubscriptions(
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId = customerIdOf(subscription);
  const active = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 100,
  });

  const toCancel = active.data.filter(
    (sub: Stripe.Subscription) => sub.id !== subscription.id
  );
  for (const sub of toCancel) {
    try {
      await stripe.subscriptions.cancel(sub.id);
      console.log(`🗑️ Suscripción duplicada ${sub.id} cancelada (customer ${customerId})`);
    } catch (err) {
      console.error(`❌ No se pudo cancelar la duplicada ${sub.id}:`, err);
    }
  }
}

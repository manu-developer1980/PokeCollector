// Acciones de suscripción compartidas por todos los componentes de UI.
// Regla central: un usuario SIN suscripción activa pasa por Stripe Checkout;
// un usuario CON suscripción activa cambia de plan in situ (nunca un segundo
// checkout, que crearía una segunda suscripción).

import { supabase } from "../../supabase/supabase";
import { SUBSCRIPTION_PLANS } from "./stripe";
import type { Subscription } from "@/hooks/useSubscription";

export type SelectPlanResult =
  | { kind: "redirect" } // se ha redirigido a Stripe Checkout
  | { kind: "changed"; planType: string } // plan cambiado in situ
  | { kind: "scheduled-cancel" } // downgrade a gratis: se cancela a fin de período
  | { kind: "noop" }; // nada que hacer (ya en ese plan / ya gratuito)

/** Lee el mensaje de error del body de una FunctionsHttpError de supabase-js. */
async function readFunctionError(error: unknown): Promise<{
  message: string;
  code?: string;
  subscriptionId?: string;
}> {
  const context = (error as { context?: Response })?.context;
  if (context && typeof context.json === "function") {
    try {
      const body = await context.json();
      return {
        message: body.error ?? "Error desconocido",
        code: body.code,
        subscriptionId: body.subscriptionId,
      };
    } catch {
      // body no era JSON; caemos al mensaje genérico
    }
  }
  return { message: (error as Error)?.message ?? "Error desconocido" };
}

function hasActiveSubscription(subscription: Subscription | null): boolean {
  return Boolean(
    subscription?.is_active && subscription?.stripe_subscription_id
  );
}

/**
 * Selecciona un plan para el usuario actual.
 * - Sin suscripción activa → redirige a Stripe Checkout (no retorna si va bien).
 * - Con suscripción activa → cambia el plan in situ vía change-subscription.
 * - Plan gratuito con suscripción activa → cancela a fin de período.
 */
export async function selectPlan(
  priceId: string,
  subscription: Subscription | null
): Promise<SelectPlanResult> {
  const isFreePlan = priceId === SUBSCRIPTION_PLANS.APRENDIZ;

  if (!hasActiveSubscription(subscription)) {
    if (isFreePlan) {
      return { kind: "noop" };
    }
    await startCheckout(priceId);
    return { kind: "redirect" };
  }

  if (subscription!.stripe_price_id === priceId) {
    return { kind: "noop" };
  }

  const result = await changePlan(subscription!.stripe_subscription_id!, priceId);
  return isFreePlan
    ? { kind: "scheduled-cancel" }
    : { kind: "changed", planType: result.plan_type };
}

/** Redirige a Stripe Checkout para una primera suscripción. */
export async function startCheckout(priceId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke(
    "create-stripe-checkout",
    {
      body: {
        priceId,
        successUrl: `${window.location.origin}/checkout-success`,
        cancelUrl: `${window.location.origin}/pricing`,
      },
    }
  );

  if (error) {
    const details = await readFunctionError(error);
    // Carrera poco probable: la BD dice que no hay suscripción pero sí la hay.
    // En ese caso cambiamos el plan in situ en lugar de fallar.
    if (details.code === "SUBSCRIPTION_EXISTS" && details.subscriptionId) {
      await changePlan(details.subscriptionId, priceId);
      return;
    }
    throw new Error(details.message);
  }

  if (!data?.url) {
    throw new Error("Stripe no devolvió la URL de checkout");
  }
  window.location.href = data.url;
}

/** Cambia el plan de una suscripción existente in situ. */
export async function changePlan(
  subscriptionId: string,
  newPriceId: string
): Promise<{ plan_type: string; cancel_at_period_end: boolean }> {
  const { data, error } = await supabase.functions.invoke(
    "change-subscription",
    {
      body: { subscriptionId, newPriceId },
    }
  );

  if (error) {
    const details = await readFunctionError(error);
    throw new Error(details.message);
  }
  return data;
}

/** Cancela la suscripción del usuario al final del período en curso. */
export async function cancelSubscription(
  subscriptionId: string
): Promise<void> {
  const { data: _data, error } = await supabase.functions.invoke(
    "cancel-subscription",
    {
      body: { subscriptionId },
    }
  );

  if (error) {
    const details = await readFunctionError(error);
    throw new Error(details.message);
  }
}

/** Abre el Billing Portal de Stripe (facturas, método de pago, cancelación). */
export async function openBillingPortal(returnUrl?: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke(
    "create-portal-session",
    {
      body: { returnUrl: returnUrl ?? window.location.href },
    }
  );

  if (error) {
    const details = await readFunctionError(error);
    throw new Error(details.message);
  }
  if (!data?.url) {
    throw new Error("Stripe no devolvió la URL del portal");
  }
  window.location.href = data.url;
}

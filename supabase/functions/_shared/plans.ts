// Fuente única de verdad del mapeo precio de Stripe ↔ plan interno.
// Todas las edge functions deben usar este módulo; no duplicar estos IDs.
// Los IDs pueden sobreescribirse por variables de entorno para apuntar a
// otros precios (p. ej. en modo test) sin tocar el código.

export type PlanType = "aprendiz" | "entrenador" | "maestro";

// deno-lint-ignore no-explicit-any
declare const Deno: any;

export const PLAN_PRICE_IDS: Record<PlanType, string> = {
  aprendiz:
    Deno.env.get("STRIPE_PRICE_APRENDIZ") ?? "price_1R4KH1EoOyqILXNqxnOSjJHZ",
  entrenador:
    Deno.env.get("STRIPE_PRICE_ENTRENADOR") ?? "price_1R4KGgEoOyqILXNqf6Z2vjqQ",
  maestro:
    Deno.env.get("STRIPE_PRICE_MAESTRO") ?? "price_1R4KHlEoOyqILXNqqX7gkWWJ",
};

const PRICE_TO_PLAN: Record<string, PlanType> = Object.fromEntries(
  Object.entries(PLAN_PRICE_IDS).map(([plan, priceId]) => [priceId, plan])
) as Record<string, PlanType>;

/**
 * Resuelve el plan interno a partir de un price ID de Stripe.
 * Como respaldo acepta la metadata `plan_type` del price de Stripe.
 */
export function resolvePlanType(
  priceId: string | undefined,
  priceMetadataPlanType?: string
): PlanType | null {
  if (priceId && PRICE_TO_PLAN[priceId]) {
    return PRICE_TO_PLAN[priceId];
  }
  const fromMetadata = priceMetadataPlanType?.toLowerCase();
  if (
    fromMetadata === "aprendiz" ||
    fromMetadata === "entrenador" ||
    fromMetadata === "maestro"
  ) {
    return fromMetadata;
  }
  return null;
}

export function isPaidPlan(plan: PlanType): boolean {
  return plan !== "aprendiz";
}

/** Estados de Stripe con los que el usuario conserva acceso al plan. */
export function isActiveStatus(status: string): boolean {
  return status === "active" || status === "trialing";
}

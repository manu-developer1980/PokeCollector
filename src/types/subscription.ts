export type DatabasePlanType = "aprendiz" | "entrenador" | "maestro";
export type SubscriptionPlan = "APRENDIZ" | "ENTRENADOR" | "MAESTRO";

export const toPlanType = (
  databasePlan: DatabasePlanType
): SubscriptionPlan => {
  const planMap: Record<DatabasePlanType, SubscriptionPlan> = {
    aprendiz: "APRENDIZ",
    entrenador: "ENTRENADOR",
    maestro: "MAESTRO",
  };
  return planMap[databasePlan];
};

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: DatabasePlanType; // Asegurarse de que esto está tipado correctamente
  status: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  stripe_price_id?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionStats {
  total_cards: number;
  total_collections: number;
  total_wishlist: number;
}

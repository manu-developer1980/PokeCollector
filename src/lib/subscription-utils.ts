import { PLAN_FEATURES } from "./stripe";
import { SubscriptionPlan } from "../types/subscription";

export const validateSubscriptionLimits = (
  planType: SubscriptionPlan | string,
  currentCards: number = 0,
  currentCollections: number = 0,
  currentWishlist: number = 0
) => {
  // Normalizar el tipo de plan para asegurarnos de que coincide con las claves de PLAN_FEATURES
  const normalizedPlanType = String(planType || "APRENDIZ").toUpperCase();

  // Verificar si el tipo de plan normalizado existe en PLAN_FEATURES
  const actualPlanType = Object.keys(PLAN_FEATURES).includes(normalizedPlanType)
    ? (normalizedPlanType as SubscriptionPlan)
    : "APRENDIZ";

  const plan = PLAN_FEATURES[actualPlanType];

  if (currentCards >= plan.maxCards) {
    return {
      valid: false,
      error: `Has alcanzado el límite de ${plan.maxCards} cartas en tu plan ${plan.name}`,
      limitType: "cards" as const,
    };
  }

  if (currentCollections >= plan.maxCollections) {
    return {
      valid: false,
      error: `Has alcanzado el límite de ${plan.maxCollections} colecciones en tu plan ${plan.name}`,
      limitType: "collections" as const,
    };
  }

  if (currentWishlist >= plan.maxWishlist) {
    return {
      valid: false,
      error: `Has alcanzado el límite de ${plan.maxWishlist} cartas en tu lista de deseos en tu plan ${plan.name}`,
      limitType: "wishlist" as const,
    };
  }

  return { valid: true, error: null, limitType: null };
};

export const canUseAdvancedSearch = (planType: SubscriptionPlan): boolean => {
  return PLAN_FEATURES[planType].hasAdvancedSearch;
};

export const getPlanLimits = (planType: SubscriptionPlan) => {
  const features = PLAN_FEATURES[planType];
  return {
    maxCards: features.maxCards,
    maxCollections: features.maxCollections,
    maxWishlist: features.maxWishlist,
    hasAdvancedSearch: features.hasAdvancedSearch,
  };
};

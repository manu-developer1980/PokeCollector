import { PLAN_FEATURES, SubscriptionPlan } from "./polar";

export const validateSubscriptionLimits = (
  planType: SubscriptionPlan | string,
  currentCards: number = 0,
  currentCollections: number = 0,
  currentWishlist: number = 0
) => {
  const normalizedPlanType = String(planType || "APRENDIZ").toUpperCase();
  const actualPlanType = Object.keys(PLAN_FEATURES).includes(normalizedPlanType)
    ? (normalizedPlanType as SubscriptionPlan)
    : "APRENDIZ";

  const plan = PLAN_FEATURES[actualPlanType];

  if (currentCards > 0 && currentCards > plan.maxCards) {
    return {
      valid: false,
      error: `Has alcanzado el límite de ${plan.maxCards} cartas en tu plan ${plan.name}`,
      limitType: "cards" as const,
    };
  }

  if (currentCollections > 0 && currentCollections > plan.maxCollections) {
    return {
      valid: false,
      error: `Has alcanzado el límite de ${plan.maxCollections} colecciones en tu plan ${plan.name}`,
      limitType: "collections" as const,
    };
  }

  if (currentWishlist > 0 && currentWishlist > plan.maxWishlist) {
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

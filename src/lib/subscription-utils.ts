import { PLAN_FEATURES } from "./stripe";
import { SubscriptionPlan } from "../types/subscription";
import i18next from "i18next";

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

  // Obtener la función de traducción
  const t = i18next.t;

  // Obtener el nombre del plan traducido
  const planKey = actualPlanType.toLowerCase();
  const planName = t(`plans.${planKey}`);

  if (currentCards >= plan.maxCards) {
    return {
      valid: false,
      error: t("subscription.limitReachedMessage", {
        limit: plan.maxCards,
        type: t("limits.cards"),
        plan: planName,
      }),
      limitType: "cards" as const,
    };
  }

  if (currentCollections >= plan.maxCollections) {
    return {
      valid: false,
      error: t("subscription.limitReachedMessage", {
        limit: plan.maxCollections,
        type: t("limits.collections"),
        plan: planName,
      }),
      limitType: "collections" as const,
    };
  }

  if (currentWishlist >= plan.maxWishlist) {
    return {
      valid: false,
      error: t("subscription.limitReachedMessage", {
        limit: plan.maxWishlist,
        type: t("limits.wishlist"),
        plan: planName,
      }),
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

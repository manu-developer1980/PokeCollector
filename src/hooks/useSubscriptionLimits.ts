import { useSubscription } from "./useSubscription";
import { PLAN_FEATURES } from "@/lib/stripe";
import { DatabasePlanType, toPlanType } from "@/types/subscription";

export function useSubscriptionLimits() {
  const { subscription } = useSubscription();

  const getCurrentLimits = () => {
    const databasePlanType = (subscription?.plan_type ||
      "aprendiz") as DatabasePlanType;
    const planType = toPlanType(databasePlanType);
    console.log("Database Plan Type:", databasePlanType);
    console.log("Converted Plan Type:", planType);
    return PLAN_FEATURES[planType];
  };

  const checkLimit = (
    feature: 'maxCards' | 'maxCollections' | 'maxWishlist',
    currentCount: number
  ) => {
    const limits = getCurrentLimits();
    const limit = limits[feature];
    if (limit === -1) return true; // Unlimited
    return currentCount < limit;
  };

  const isFeatureAvailable = (feature: string) => {
    const limits = getCurrentLimits();
    return (limits.features as readonly string[]).includes(feature);
  };

  return {
    checkLimit,
    isFeatureAvailable,
    currentLimits: getCurrentLimits(),
    planType: subscription?.plan_type || "aprendiz",
    isActive: subscription?.status === 'active' || false,
  };
}

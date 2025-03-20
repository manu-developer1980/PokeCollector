import { useSubscription } from './useSubscription';
import { PLAN_FEATURES } from '@/lib/stripe';

export function useSubscriptionLimits() {
  const { subscription } = useSubscription();

  const getCurrentLimits = () => {
    const planType = subscription?.plan_type || 'aprendiz';
    return PLAN_FEATURES[planType];
  };

  const checkLimit = (feature: keyof typeof PLAN_FEATURES.aprendiz, currentCount: number) => {
    const limits = getCurrentLimits();
    return currentCount < limits[feature];
  };

  const isFeatureAvailable = (feature: string) => {
    const limits = getCurrentLimits();
    return limits.features.includes(feature);
  };

  return {
    checkLimit,
    isFeatureAvailable,
    currentLimits: getCurrentLimits(),
    planType: subscription?.plan_type || 'aprendiz',
    isActive: subscription?.is_active || false
  };
}
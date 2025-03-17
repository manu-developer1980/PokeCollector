import { Polar } from "@polar-sh/sdk";

export const polar = new Polar({
  accessToken: import.meta.env.VITE_POLAR_ACCESS_TOKEN,
  server: import.meta.env.DEV ? "sandbox" : "production",
});

export const SUBSCRIPTION_PLANS = {
  PREMIUM_MONTHLY: "plan_xxx", // Reemplazar con tu ID de plan real
  PREMIUM_YEARLY: "plan_yyy",  // Reemplazar con tu ID de plan real
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

export async function createCheckoutSession(priceId: string, customerId: string) {
  try {
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId, customerId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}
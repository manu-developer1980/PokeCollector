export type SubscriptionPlan = "APRENDIZ" | "ENTRENADOR" | "MAESTRO";

// También podrías necesitar una versión en minúsculas para la base de datos
export type DatabasePlanType = "aprendiz" | "entrenador" | "maestro";

// Función helper para convertir entre formatos
export const normalizeSubscriptionPlan = (plan: string): SubscriptionPlan => {
  return plan.toUpperCase() as SubscriptionPlan;
};

// Planes de suscripción con IDs de Stripe
export const SUBSCRIPTION_PLANS = {
  APRENDIZ: "price_1R4KH1EoOyqILXNqxnOSjJHZ",
  ENTRENADOR: "price_1R4KGgEoOyqILXNqf6Z2vjqQ",
  MAESTRO: "price_1R4KHlEoOyqILXNqqX7gkWWJ",
};

// Interfaz para las características del plan
export interface PlanFeature {
  name: string;
  description: string;
  price: number;
  id: string;
  features: string[];
  maxCards: number;
  maxCollections: number;
  maxWishlist: number;
}

// Características de cada plan
export const PLAN_FEATURES = {
  APRENDIZ: {
    name: "Aprendiz",
    description: "Plan gratuito para comenzar",
    price: 0,
    id: SUBSCRIPTION_PLANS.APRENDIZ,
    features: [
      "Hasta 50 cartas",
      "1 colección",
      "10 cartas en lista de deseos",
      "Búsqueda de cartas por nombre y tipo",
    ],
    maxCards: 50,
    maxCollections: 2,
    maxWishlist: 10,
  },
  ENTRENADOR: {
    name: "Entrenador",
    description: "Para coleccionistas serios",
    price: 5,
    id: SUBSCRIPTION_PLANS.ENTRENADOR,
    features: [
      "Hasta 500 cartas",
      "5 colecciones",
      "50 cartas en lista de deseos",
      "Búsqueda avanzada de cartas por nombre, tipo, subtipo, rareza y más",
    ],
    maxCards: 200,
    maxCollections: 5,
    maxWishlist: 50,
  },
  MAESTRO: {
    name: "Maestro",
    description: "Para coleccionistas profesionales",
    price: 10,
    id: SUBSCRIPTION_PLANS.MAESTRO,
    features: [
      "Todo lo de Entrenador",
      "Cartas ilimitadas",
      "Colecciones ilimitadas",
      "Lista de deseos ilimitada",
      "Soporte Prioritario",
    ],
    maxCards: 1000,
    maxCollections: 20,
    maxWishlist: 200,
  },
} as const;

export const getFeaturesByPriceId = (
  priceId: string
): PlanFeature | undefined => {
  const planKey = Object.entries(SUBSCRIPTION_PLANS).find(
    ([_, id]) => id === priceId
  )?.[0] as SubscriptionPlan;
  return planKey ? PLAN_FEATURES[planKey] : undefined;
};

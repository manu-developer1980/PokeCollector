import * as PolarSDK from "@polar-sh/sdk";

console.log("PolarSDK structure:", PolarSDK);

// Luego inicializa según lo que veas en la consola
// Initialize Polar client
const config = {
  accessToken: import.meta.env.VITE_POLAR_ACCESS_TOKEN ?? "",
  server: import.meta.env.DEV ? "sandbox" : "production",
} as const;

// export const polar = new Polar(config);
// Uncomment and adjust the line above based on the console output

export const SUBSCRIPTION_PLANS = {
  APRENDIZ: {
    product_id: "a184d629-5253-4171-8bb3-40ee69f5f3fb",
    price_id: "d50de742-a015-444b-9cc4-f83af8757e66",
  },
  ENTRENADOR: {
    product_id: "1e0f535c-429d-4c4a-9c9c-bdb39ed74d7b",
    price_id: "414a1d47-f38a-4249-b6e5-93cf1541e255",
  },
  MAESTRO: {
    product_id: "de48e85c-5447-451c-b70b-b7f3ccfc9cda",
    price_id: "eb9a0088-87a1-4248-bd93-ae1ee3deddd7",
  },
};

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

// El resto del código se mantiene igual...
interface PlanFeature {
  name: string;
  description: string;
  price: number;
  id: string;
  features: string[];
  maxCards: number;
  maxCollections: number;
  maxWishlist: number;
}

export const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeature> = {
  APRENDIZ: {
    name: "Aprendiz",
    description: "Plan gratuito para comenzar",
    price: 0,
    id: SUBSCRIPTION_PLANS.APRENDIZ,
    features: [
      "Hasta 50 cartas",
      "1 colección",
      "10 cartas en lista de deseos",
    ],
    maxCards: 50,
    maxCollections: 1,
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
      "Estadísticas avanzadas",
    ],
    maxCards: 500,
    maxCollections: 5,
    maxWishlist: 50,
  },
  MAESTRO: {
    name: "Maestro",
    description: "Para coleccionistas profesionales",
    price: 10,
    id: SUBSCRIPTION_PLANS.MAESTRO,
    features: [
      "Cartas ilimitadas",
      "Colecciones ilimitadas",
      "Lista de deseos ilimitada",
      "Estadísticas avanzadas",
      "Soporte prioritario",
    ],
    maxCards: Infinity,
    maxCollections: Infinity,
    maxWishlist: Infinity,
  },
};

export async function createCheckoutSession(
  priceId: string,
  customerId: string
) {
  try {
    const response = await fetch("/api/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priceId, customerId }),
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout session");
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

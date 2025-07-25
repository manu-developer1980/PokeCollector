import { useTranslation } from "react-i18next";

// Definimos los tipos de suscripción
export const SUBSCRIPTION_PLANS = {
  APRENDIZ: "price_1R4KH1EoOyqILXNqxnOSjJHZ",
  ENTRENADOR: "price_1R4KGgEoOyqILXNqf6Z2vjqQ",
  MAESTRO: "price_1R4KHlEoOyqILXNqqX7gkWWJ",
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

// Interfaz para las características del plan
export interface PlanFeature {
  name: string;
  description: string;
  price: number;
  id: string;
  features: string[];
  maxCards: number | -1;
  maxCollections: number | -1;
  maxWishlist: number | -1;
  hasAdvancedSearch?: boolean;
}

// Hook para obtener las características del plan con traducciones
export const usePlanFeatures = () => {
  const { t } = useTranslation();

  return {
    APRENDIZ: {
      name: t("plans.aprendiz"),
      description: t("plans.descriptions.aprendiz"),
      price: 0,
      id: SUBSCRIPTION_PLANS.APRENDIZ,
      features: t("plans.featuresList.aprendiz", {
        returnObjects: true,
      }) as string[],
      maxCards: 50,
      maxCollections: 2,
      maxWishlist: 10,
      hasAdvancedSearch: false,
    },
    ENTRENADOR: {
      name: t("plans.entrenador"),
      description: t("plans.descriptions.entrenador"),
      price: 5,
      id: SUBSCRIPTION_PLANS.ENTRENADOR,
      features: t("plans.featuresList.entrenador", {
        returnObjects: true,
      }) as string[],
      maxCards: 200,
      maxCollections: 5,
      maxWishlist: 50,
      hasAdvancedSearch: true,
    },
    MAESTRO: {
      name: t("plans.maestro"),
      description: t("plans.descriptions.maestro"),
      price: 10,
      id: SUBSCRIPTION_PLANS.MAESTRO,
      features: t("plans.featuresList.maestro", {
        returnObjects: true,
      }) as string[],
      maxCards: -1,
      maxCollections: -1,
      maxWishlist: -1,
      hasAdvancedSearch: true,
    },
  };
};

// Para uso fuera de componentes (donde no se puede usar hooks)
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
    hasAdvancedSearch: false,
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
    hasAdvancedSearch: true,
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
    maxCards: -1,
    maxCollections: -1,
    maxWishlist: -1,
    hasAdvancedSearch: true,
  },
} as const;

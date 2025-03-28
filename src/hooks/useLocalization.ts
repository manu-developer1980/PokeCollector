import { useTranslation } from "react-i18next";
import { usePlanFeatures } from "../lib/stripe";
import type { SubscriptionPlan } from "../lib/stripe";

export const useLocalization = () => {
  const { t, i18n } = useTranslation();
  const planFeatures = usePlanFeatures();

  // Función para cambiar el idioma
  const changeLanguage = (lng: "es" | "en") => {
    i18n.changeLanguage(lng);
  };

  // Función para obtener las características de un plan específico
  const getPlanFeatures = (plan: SubscriptionPlan) => {
    return planFeatures[plan];
  };

  // Función para obtener el nombre traducido de un plan
  const getPlanName = (plan: SubscriptionPlan) => {
    return t(`plans.${plan.toLowerCase()}`);
  };

  // Función para obtener la descripción traducida de un plan
  const getPlanDescription = (plan: SubscriptionPlan) => {
    return t(`plans.descriptions.${plan.toLowerCase()}`);
  };

  return {
    t,
    i18n,
    changeLanguage,
    getPlanFeatures,
    getPlanName,
    getPlanDescription,
    currentLanguage: i18n.language,
  };
};

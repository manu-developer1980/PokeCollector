import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import LoadingSpinner from "@/components/ui/LoaderSpinner";
import { useTranslation } from "react-i18next";

const PLAN_NAMES = {
  aprendiz: "Aprendiz",
  entrenador: "Entrenador",
  maestro: "Maestro",
} as const;

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const { subscription, refetchSubscription, isLoading } = useSubscription();
  const [planName, setPlanName] = useState("");
  const { t } = useTranslation();

  // Estado para controlar si ya se ha cargado la suscripción
  const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        // Solo mostrar el log si aún no se ha cargado la suscripción
        if (!subscriptionLoaded) {
          console.log("Verificando suscripción en checkout-success...");
        }

        const updatedSubscription = await refetchSubscription();

        if (!subscriptionLoaded) {
          console.log("Suscripción actualizada:", updatedSubscription);
        }

        if (updatedSubscription?.plan_type) {
          // Convertir a minúsculas para asegurar la coincidencia
          const planType = updatedSubscription.plan_type.toLowerCase();

          if (!subscriptionLoaded) {
            console.log("Tipo de plan detectado:", planType);
          }

          // Usar la clave correcta para la traducción
          const translationKey = `plans.${planType}.name`;

          if (!subscriptionLoaded) {
            console.log("Clave de traducción:", translationKey);
          }

          const translatedName = t(translationKey, {
            defaultValue:
              PLAN_NAMES[planType as keyof typeof PLAN_NAMES] || planType,
          });

          if (!subscriptionLoaded) {
            console.log("Nombre traducido:", translatedName);
          }

          setPlanName(translatedName);

          // Marcar que la suscripción ya se ha cargado
          setSubscriptionLoaded(true);
        }

        // Limpiar el localStorage después de procesar la suscripción
        localStorage.removeItem("selectedPlanType");
      } catch (error) {
        console.error("Error verificando suscripción:", error);
      }
    };

    // Verificar la suscripción inmediatamente
    verifySubscription();

    // Configurar un intervalo para verificar la suscripción cada 5 segundos
    // pero solo si aún no se ha cargado correctamente
    const intervalId = setInterval(() => {
      if (!subscriptionLoaded) {
        verifySubscription();
      }
    }, 5000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, [refetchSubscription, t, subscriptionLoaded]);

  return (
    <div className="container max-w-2xl mx-auto py-16">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mb-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {t("subscription.successTitle", {
              planName: planName,
            })}
          </h1>
          <p className="text-gray-600 mb-4">
            {t("subscription.successDescription")}
          </p>

          {isLoading ? (
            <div className="space-y-4">
              <LoadingSpinner message={t("subscription.verifying")} />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">
                {t("subscription.currentPlan")}:{" "}
                {planName || t("subscription.loading")}
              </p>
              {subscription?.current_period_end && (
                <p className="text-sm text-gray-500 mt-2">
                  {t("subscription.nextBilling")}:{" "}
                  {new Date(
                    subscription.current_period_end
                  ).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        <Button
          onClick={() => navigate("/dashboard")}
          disabled={isLoading}
        >
          {isLoading ? t("common.verifying") : t("subscription.goToDashboard")}
        </Button>
      </div>
    </div>
  );
}

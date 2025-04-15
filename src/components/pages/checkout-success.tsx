import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import LoadingSpinner from "@/components/ui/LoaderSpinner";
import { useTranslation } from "react-i18next";

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const { subscription, refetchSubscription, isLoading, error } =
    useSubscription();
  const [planName, setPlanName] = useState("");
  const { t } = useTranslation();

  // Estado para controlar si ya se ha cargado la suscripción
  const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);

  // Estado para controlar el número de intentos de verificación
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  // Estado para mostrar mensaje de verificación en progreso
  const [verifyingMessage, setVerifyingMessage] = useState(
    t("subscription.verifying")
  );

  // Efecto para actualizar el mensaje de verificación basado en el número de intentos
  useEffect(() => {
    if (verificationAttempts > 2 && verificationAttempts <= 5) {
      setVerifyingMessage(
        t("subscription.verifyingLonger", {
          defaultValue:
            "Verificando suscripción, esto puede tardar unos momentos...",
        })
      );
    } else if (verificationAttempts > 5) {
      setVerifyingMessage(
        t("subscription.verifyingWebhook", {
          defaultValue: "Esperando confirmación del servidor de pagos...",
        })
      );
    }
  }, [verificationAttempts, t]);

  // Efecto principal para verificar la suscripción
  useEffect(() => {
    // Si ya se cargó la suscripción, no hacemos nada
    if (subscriptionLoaded) {
      return;
    }

    // Función para calcular el tiempo de espera entre intentos
    const getRetryDelay = (attempt: number) => {
      // Comenzamos con 1 segundo y aumentamos gradualmente, pero con un máximo menor
      const baseDelay = 1000;
      // Aumentamos el tiempo de espera con cada intento, hasta un máximo de 3 segundos
      return Math.min(baseDelay * Math.pow(1.2, Math.min(attempt, 3)), 3000);
    };

    const verifySubscription = async () => {
      try {
        // Reducimos el número máximo de intentos a 10
        if (verificationAttempts >= 10) {
          console.log("Límite de intentos alcanzado, marcando como cargada");
          setSubscriptionLoaded(true);

          // Obtener el plan seleccionado del localStorage
          const selectedPlanType = localStorage.getItem("selectedPlanType");
          if (selectedPlanType) {
            // Si tenemos un plan seleccionado en localStorage, lo usamos como fallback
            console.log(
              "Usando plan del localStorage como fallback:",
              selectedPlanType
            );
            // Asegurarnos de que el plan está en minúsculas para coincidir con la base de datos
            const planType = selectedPlanType.toLowerCase();
            const translationKey = `plans.${planType}.name`;
            const translatedName = t(translationKey, {
              defaultValue:
                planType === "aprendiz"
                  ? "Aprendiz"
                  : planType === "entrenador"
                  ? "Entrenador"
                  : planType === "maestro"
                  ? "Maestro"
                  : planType,
            });
            setPlanName(translatedName);
          }

          return;
        }

        console.log(
          `Intento de verificación #${
            verificationAttempts + 1
          } en checkout-success...`
        );

        // Incrementar el contador de intentos
        setVerificationAttempts((prev) => prev + 1);

        const updatedSubscription = await refetchSubscription();
        console.log("Suscripción actualizada:", updatedSubscription);

        // Verificar si la suscripción tiene un plan_type (independientemente del stripe_subscription_id)
        if (updatedSubscription?.plan_type) {
          console.log("Plan type encontrado:", updatedSubscription.plan_type);

          // El plan_type ya viene en minúsculas de la base de datos
          const planType = updatedSubscription.plan_type;
          console.log("Tipo de plan:", planType);

          // Usar la clave correcta para la traducción
          const translationKey = `plans.${planType}.name`;
          console.log("Clave de traducción:", translationKey);

          // Obtener el nombre traducido del plan
          const translatedName = t(translationKey, {
            defaultValue:
              planType === "aprendiz"
                ? "Aprendiz"
                : planType === "entrenador"
                ? "Entrenador"
                : planType === "maestro"
                ? "Maestro"
                : planType,
          });
          console.log("Nombre traducido:", translatedName);

          setPlanName(translatedName);

          // Marcar que la suscripción ya se ha cargado
          setSubscriptionLoaded(true);

          // Registrar evento de éxito
          console.log("\u2705 Suscripción verificada exitosamente", {
            planType,
            subscriptionId:
              updatedSubscription.stripe_subscription_id || "pendiente",
            attempts: verificationAttempts + 1,
          });
        } else if (error) {
          // Si hay un error en la solicitud, lo mostramos
          console.error("Error al obtener la suscripción:", error);

          // Si llevamos varios intentos con errores, detenemos los intentos antes
          if (verificationAttempts >= 4) {
            console.log("Demasiados errores, deteniendo verificación");
            setSubscriptionLoaded(true);

            // Obtener el plan seleccionado del localStorage como fallback
            const selectedPlanType = localStorage.getItem("selectedPlanType");
            if (selectedPlanType) {
              console.log(
                "Usando plan del localStorage como fallback:",
                selectedPlanType
              );
              // Asegurarnos de que el plan está en minúsculas para coincidir con la base de datos
              const planType = selectedPlanType.toLowerCase();
              const translationKey = `plans.${planType}.name`;
              const translatedName = t(translationKey, {
                defaultValue:
                  planType === "aprendiz"
                    ? "Aprendiz"
                    : planType === "entrenador"
                    ? "Entrenador"
                    : planType === "maestro"
                    ? "Maestro"
                    : planType,
              });
              setPlanName(translatedName);
            }
          }
        }
      } catch (err) {
        console.error("Error verificando suscripción:", err);
      }
    };

    // Verificar la suscripción inmediatamente
    verifySubscription();

    // Configurar un intervalo para verificar la suscripción con tiempos de espera progresivos
    let timeoutId: number | null = null;

    const scheduleNextCheck = () => {
      if (subscriptionLoaded) return;

      const delay = getRetryDelay(verificationAttempts);
      console.log(
        `Programando próxima verificación en ${delay / 1000} segundos`
      );

      timeoutId = window.setTimeout(() => {
        verifySubscription().then(() => {
          if (!subscriptionLoaded) {
            scheduleNextCheck();
          }
        });
      }, delay);
    };

    // Programar la primera verificación inmediatamente
    scheduleNextCheck();

    // Limpiar todos los timeouts cuando el componente se desmonte
    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      // Limpiar el localStorage al desmontar el componente
      localStorage.removeItem("selectedPlanType");
    };
  }, [refetchSubscription, t, subscriptionLoaded, error, verificationAttempts]);

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
              <LoadingSpinner message={verifyingMessage} />
              {verificationAttempts > 8 && (
                <p className="text-sm text-gray-500 mt-2">
                  {t("subscription.processingDelay", {
                    defaultValue:
                      "El procesamiento está tardando más de lo habitual. Por favor, espere un momento...",
                  })}
                </p>
              )}
              {error && verificationAttempts > 3 && (
                <p className="text-sm text-amber-500 mt-2">
                  {t("subscription.connectionIssue", {
                    defaultValue:
                      "Estamos experimentando problemas de conexión. Seguiremos intentando...",
                  })}
                </p>
              )}
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
              {!subscription?.stripe_subscription_id && planName && (
                <p className="text-sm text-amber-500 mt-2">
                  {t("subscription.pendingConfirmation", {
                    defaultValue:
                      "Confirmación de pago pendiente. La suscripción se activará en breve.",
                  })}
                </p>
              )}
              {error && (
                <p className="text-sm text-red-500 mt-2">
                  {t("subscription.errorFetching", {
                    defaultValue:
                      "Hubo un problema al verificar su suscripción. Por favor, actualice la página o contacte a soporte si el problema persiste.",
                  })}
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

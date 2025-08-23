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

  // Initialize with fallback plan name immediately
  useEffect(() => {
    if (!planName) {
      // Try to get plan from localStorage first
      const selectedPlanType = localStorage.getItem("selectedPlanType");
      if (selectedPlanType) {
        const fallbackName =
          selectedPlanType.toLowerCase() === "aprendiz"
            ? t("plans.aprendiz", { defaultValue: "Aprendiz" })
            : selectedPlanType.toLowerCase() === "entrenador"
            ? t("plans.entrenador", { defaultValue: "Entrenador" })
            : selectedPlanType.toLowerCase() === "maestro"
            ? t("plans.maestro", { defaultValue: "Maestro" })
            : t("plans.aprendiz", { defaultValue: "Aprendiz" });
        setPlanName(fallbackName);
      } else {
        // Default fallback
        const defaultName = t("plans.aprendiz", { defaultValue: "Aprendiz" });
        setPlanName(defaultName);
      }
    }
  }, [t, planName]);

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
      // Comenzamos con 1 segundo y aumentamos gradualmente
      const baseDelay = 1000;
      // Aumentamos el tiempo de espera con cada intento, hasta un máximo de 5 segundos
      return Math.min(baseDelay * Math.pow(1.5, Math.min(attempt, 4)), 5000);
    };

    // Función para obtener el nombre traducido del plan
    const getTranslatedPlanName = (planType: string) => {
      if (!planType) {
        console.warn("Plan type is empty or undefined, using fallback");
        return t("plans.aprendiz", { defaultValue: "Aprendiz" });
      }

      const normalizedPlanType = planType.toLowerCase().trim();

      // Use the correct translation keys based on the actual structure
      switch (normalizedPlanType) {
        case "aprendiz":
        case "apprentice":
          return t("plans.aprendiz", { defaultValue: "Aprendiz" });
        case "entrenador":
        case "trainer":
          return t("plans.entrenador", { defaultValue: "Entrenador" });
        case "maestro":
        case "master":
          return t("plans.maestro", { defaultValue: "Maestro" });
        default:
          console.warn(`Unknown plan type: ${planType}, using fallback`);
          return t("plans.aprendiz", { defaultValue: "Aprendiz" });
      }
    };

    const verifySubscription = async () => {
      try {
        // Aumentamos el número máximo de intentos a 15
        if (verificationAttempts >= 15) {
          setSubscriptionLoaded(true);

          // Obtener el plan seleccionado del localStorage
          const selectedPlanType = localStorage.getItem("selectedPlanType");
          if (selectedPlanType) {

            setPlanName(getTranslatedPlanName(selectedPlanType));
          }

          return;
        }



        // Incrementar el contador de intentos
        setVerificationAttempts((prev) => prev + 1);

        // Intentar obtener la suscripción actualizada
        const updatedSubscription = await refetchSubscription();

        // Verificar si la suscripción tiene un status
        if (updatedSubscription?.status) {
          const translatedPlanName = getTranslatedPlanName(
            updatedSubscription.status
          );
          setPlanName(translatedPlanName);
          setSubscriptionLoaded(true);

          // Registrar evento de éxito

        } else {
          // Si no hay status, verificamos si hay un error o si debemos usar el fallback
          if (error) {
            console.error("Error al obtener la suscripción:", error);
          }

          // Si llevamos varios intentos sin éxito, usamos el fallback
          if (verificationAttempts >= 5) {
            const selectedPlanType = localStorage.getItem("selectedPlanType");
            if (selectedPlanType) {
              
              const fallbackPlanName = getTranslatedPlanName(selectedPlanType);
              setPlanName(fallbackPlanName);

              // Si llevamos muchos intentos, marcamos como cargada para no seguir intentando
              if (verificationAttempts >= 10) {
                setSubscriptionLoaded(true);
              }
            } else {
              // Si no hay plan en localStorage, usar el plan por defecto
              const defaultPlanName = getTranslatedPlanName("aprendiz");
              setPlanName(defaultPlanName);

              if (verificationAttempts >= 10) {
                setSubscriptionLoaded(true);
              }
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
              planName:
                planName || t("plans.aprendiz", { defaultValue: "Aprendiz" }),
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
              {subscription?.ended_at && (
                <p className="text-sm text-gray-500 mt-2">
                  {t("subscription.nextBilling")}: {" "}
                  {new Date(
                    subscription.ended_at
                  ).toLocaleDateString()}
                </p>
              )}
              {!subscription?.id && planName && (
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

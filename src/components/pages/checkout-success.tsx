import { useEffect, useCallback, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import LoadingSpinner from "@/components/ui/LoaderSpinner";
import { useAuth } from "../../../supabase/auth";

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 2000; // 2 segundos entre intentos
const TIMEOUT_DURATION = 15000; // 15 segundos en total

const getPlanName = (planType: string) => {
  return planType.charAt(0).toUpperCase() + planType.slice(1).toLowerCase();
};

export default function CheckoutSuccessPage() {
  const { user } = useAuth();
  const {
    subscription,
    refetchSubscription,
    loading: subscriptionLoading,
  } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const selectedPlan = sessionStorage.getItem("selectedPlan");

  // Obtener el nombre del plan formateado
  const newPlanName = selectedPlan ? getPlanName(selectedPlan) : "";

  const verifySubscription = useCallback(async () => {
    if (!refetchSubscription) return;

    console.log(
      `Verificación de suscripción - Intento ${retryCount + 1}/${MAX_RETRIES}`
    );

    // Si alcanzamos el máximo de intentos, terminar el proceso
    if (retryCount >= MAX_RETRIES) {
      console.log("Máximo de intentos alcanzado");
      setIsVerifying(false);
      setVerificationFailed(true);
      toast({
        title: "Suscripción en proceso",
        description:
          "Tu suscripción está siendo procesada. Por favor, revisa tu dashboard en unos minutos.",
        duration: 5000,
      });
      setTimeout(() => navigate("/dashboard"), 2000);
      return;
    }

    try {
      const updatedSubscription = await refetchSubscription();

      console.log("Resultado de verificación:", {
        intento: retryCount + 1,
        subscription: updatedSubscription,
        timestamp: new Date().toISOString(),
      });

      // Si no hay suscripción, incrementar contador y continuar
      if (!updatedSubscription) {
        console.log("Suscripción no encontrada, reintentando...");
        setRetryCount((prev) => prev + 1);
        return;
      }

      // Si la suscripción está activa
      if (["active", "trialing"].includes(updatedSubscription.status)) {
        console.log("Suscripción activa confirmada");
        setIsVerifying(false);
        sessionStorage.removeItem("selectedPlan");

        toast({
          title: "¡Suscripción activada!",
          description: `Tu suscripción al plan ${updatedSubscription.plan_type} está activa`,
          duration: 5000,
        });

        setTimeout(() => navigate("/dashboard"), 2000);
        return;
      }

      // Si existe pero no está activa
      console.log(
        `Suscripción encontrada pero no activa (estado: ${updatedSubscription.status})`
      );
      setRetryCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error en verificación:", error);
      setRetryCount((prev) => prev + 1);
    }
  }, [refetchSubscription, retryCount, toast, navigate]);

  useEffect(() => {
    // Timeout general para toda la operación
    const timeoutId = setTimeout(() => {
      if (isVerifying) {
        console.log("Timeout general alcanzado");
        setIsVerifying(false);
        setVerificationFailed(true);
        navigate("/dashboard");
      }
    }, TIMEOUT_DURATION);

    // Solo configurar el siguiente intento si estamos verificando y no hemos alcanzado el máximo
    if (isVerifying && retryCount < MAX_RETRIES) {
      const retryId = setTimeout(verifySubscription, RETRY_INTERVAL);
      return () => {
        clearTimeout(retryId);
        clearTimeout(timeoutId);
      };
    }

    return () => clearTimeout(timeoutId);
  }, [isVerifying, retryCount, verifySubscription, navigate]);

  // Renderizado condicional basado en el estado
  if (!isVerifying && verificationFailed) {
    return (
      <div className="container mx-auto p-4">
        <h1>Procesando tu suscripción</h1>
        <p>
          Tu suscripción está siendo procesada. Por favor, revisa tu dashboard
          en unos minutos.
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-16">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mb-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            ¡Enhorabuena, ahora eres todo un{" "}
            {subscription?.plan_type
              ? getPlanName(subscription.plan_type)
              : newPlanName}{" "}
            Pokémon!
          </h1>
          <p className="text-gray-600 mb-4">
            Tu suscripción ha sido procesada correctamente.
          </p>

          {isVerifying ? (
            <div className="space-y-4">
              <LoadingSpinner message="Verificando suscripción..." />
              <p className="text-sm text-gray-500">
                Intento {retryCount + 1} de {MAX_RETRIES}
              </p>
            </div>
          ) : verificationFailed ? (
            <div className="space-y-2 text-amber-600">
              <p>Los cambios pueden tardar unos minutos en reflejarse</p>
              {selectedPlan && (
                <p className="text-sm">Plan seleccionado: {newPlanName}</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">
                Plan actual:{" "}
                {subscription?.plan_type
                  ? getPlanName(subscription.plan_type)
                  : "Cargando..."}
              </p>
              {subscription?.cancel_at_period_end && selectedPlan && (
                <p className="text-amber-600">
                  Cambio a plan {newPlanName} programado para el próximo período
                </p>
              )}
              {!subscription?.cancel_at_period_end && selectedPlan && (
                <p className="text-green-600">
                  Plan actualizado a: {newPlanName}
                </p>
              )}
            </div>
          )}

          {subscription?.current_period_end && (
            <p className="text-sm text-gray-500 mt-2">
              Próxima facturación:{" "}
              {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          )}
        </div>

        <Button
          onClick={() => navigate("/dashboard")}
          disabled={isVerifying}
        >
          {isVerifying ? "Verificando..." : "Ir al Dashboard"}
        </Button>
      </div>
    </div>
  );
}

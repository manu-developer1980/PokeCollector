import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/ui/LoaderSpinner";

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 2000;

const getPlanName = (planType: string) => {
  return planType.charAt(0).toUpperCase() + planType.slice(1).toLowerCase();
};

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const { subscription, refetchSubscription } = useSubscription();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [verificationFailed, setVerificationFailed] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const selectedPlan =
    searchParams.get("plan") || sessionStorage.getItem("selectedPlan");
  const newPlanName = selectedPlan ? getPlanName(selectedPlan) : null;

  const verifySubscription = useCallback(async () => {
    console.log(`Intento de verificación ${retryCount + 1}/${MAX_RETRIES}`);

    if (retryCount >= MAX_RETRIES) {
      console.log("Máximo de intentos alcanzado");
      setIsVerifying(false);
      setVerificationFailed(true);
      toast({
        title: "Verificación no completada",
        description:
          "Los cambios pueden tardar unos minutos en reflejarse. Puedes continuar usando la aplicación normalmente.",
        duration: 10000,
      });
      return;
    }

    try {
      const updatedSubscription = await refetchSubscription();
      console.log("Estado actual de la suscripción:", {
        subscription: updatedSubscription,
        selectedPlan,
        retryCount,
      });

      // Si la suscripción es null pero aún tenemos intentos, continuamos
      if (!updatedSubscription) {
        console.log("Suscripción no encontrada, reintentando...");
        setRetryCount((prev) => prev + 1);
        setTimeout(verifySubscription, RETRY_INTERVAL);
        return;
      }

      // Verificamos el estado y el tipo de plan
      if (updatedSubscription.status === "active") {
        console.log("Suscripción activa encontrada:", updatedSubscription);
        setIsVerifying(false);
        setVerificationFailed(false);
        const planName = getPlanName(updatedSubscription.plan_type);
        const isDowngrade = updatedSubscription.cancel_at_period_end;

        toast({
          title: isDowngrade
            ? "Cambio de plan programado"
            : "¡Suscripción activada!",
          description: isDowngrade
            ? `Tu plan cambiará a ${planName} al final del período de facturación actual`
            : `Tu suscripción al plan ${planName} está activa`,
          duration: 5000,
        });

        // Limpiar el plan seleccionado del sessionStorage
        sessionStorage.removeItem("selectedPlan");
        return;
      }

      console.log("Suscripción encontrada pero no activa, reintentando...");
      setRetryCount((prev) => prev + 1);
      setTimeout(verifySubscription, RETRY_INTERVAL);
    } catch (error) {
      console.error("Error en la verificación:", error);
      setIsVerifying(false);
      setVerificationFailed(true);
      toast({
        title: "Error en la verificación",
        description: "No se pudo verificar el estado de la suscripción.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [refetchSubscription, retryCount, toast, selectedPlan]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const initializeVerification = () => {
      console.log("Iniciando verificación de suscripción");
      verifySubscription();
    };

    initializeVerification();

    return () => {
      console.log("Limpiando verificación");
      clearTimeout(timeoutId);
      setIsVerifying(false);
      setVerificationFailed(false);
      setRetryCount(0);
      sessionStorage.removeItem("selectedPlan");
    };
  }, [verifySubscription]);

  return (
    <div className="container max-w-2xl mx-auto py-16">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mb-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            ¡Gracias por tu preferencia!
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
              <p className="text-sm">Plan seleccionado: {newPlanName}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">
                Plan actual:{" "}
                {subscription?.plan_type
                  ? getPlanName(subscription.plan_type)
                  : "Cargando..."}
              </p>
              {subscription?.cancel_at_period_end && (
                <p className="text-amber-600">
                  Cambio a plan {newPlanName} programado para el próximo período
                </p>
              )}
              {!subscription?.cancel_at_period_end && newPlanName && (
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

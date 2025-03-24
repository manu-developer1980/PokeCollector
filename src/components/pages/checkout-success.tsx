import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import LoadingSpinner from "@/components/ui/LoaderSpinner";

const PLAN_NAMES = {
  aprendiz: "Aprendiz",
  entrenador: "Entrenador",
  maestro: "Maestro",
} as const;

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const { subscription, refetchSubscription, isLoading } = useSubscription();
  const [planName, setPlanName] = useState("");

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        const updatedSubscription = await refetchSubscription();

        if (updatedSubscription?.plan_type) {
          // Convertir a minúsculas para asegurar la coincidencia
          const planType = updatedSubscription.plan_type.toLowerCase();
          setPlanName(PLAN_NAMES[planType] || planType);
        }

        // Limpiar el localStorage después de procesar la suscripción
        localStorage.removeItem("selectedPlanType");
      } catch (error) {
        console.error("Error verificando suscripción:", error);
      }
    };

    verifySubscription();
  }, [refetchSubscription]);

  return (
    <div className="container max-w-2xl mx-auto py-16">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mb-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            ¡Enhorabuena, ahora eres todo un {planName} Pokémon!
          </h1>
          <p className="text-gray-600 mb-4">
            Tu suscripción ha sido procesada correctamente.
          </p>

          {isLoading ? (
            <div className="space-y-4">
              <LoadingSpinner message="Verificando suscripción..." />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">
                Plan actual: {planName}
              </p>
              {subscription?.current_period_end && (
                <p className="text-sm text-gray-500 mt-2">
                  Próxima facturación:{" "}
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
          {isLoading ? "Verificando..." : "Ir al Dashboard"}
        </Button>
      </div>
    </div>
  );
}

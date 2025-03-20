import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2 } from "lucide-react";
import { PLAN_FEATURES, SubscriptionPlan } from "@/lib/stripe";

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { subscription, loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Obtener las características del plan actual
  const currentPlanType = (subscription?.plan_type?.toUpperCase() ||
    "APRENDIZ") as SubscriptionPlan;
  const currentPlan = PLAN_FEATURES[currentPlanType] || PLAN_FEATURES.APRENDIZ;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Gestión de Suscripción
        </h1>
        <p className="text-gray-600">Administra tu plan y suscripción</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Plan Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium">Plan: {currentPlan.name}</p>
              <p>
                Estado:{" "}
                {subscription?.status === "active" ? "Activo" : "No activo"}
              </p>
              {subscription?.current_period_end && (
                <p className="text-sm text-muted-foreground">
                  Próxima renovación:{" "}
                  {new Date(
                    subscription.current_period_end
                  ).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Límites del plan:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Máximo de cartas:{" "}
                  {currentPlan.maxCards === Infinity
                    ? "Ilimitado"
                    : currentPlan.maxCards}
                </li>
                <li>
                  Máximo de colecciones:{" "}
                  {currentPlan.maxCollections === Infinity
                    ? "Ilimitado"
                    : currentPlan.maxCollections}
                </li>
                <li>
                  Máximo en lista de deseos:{" "}
                  {currentPlan.maxWishlist === Infinity
                    ? "Ilimitado"
                    : currentPlan.maxWishlist}
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Características incluidas:</h3>
              <ul className="list-disc list-inside space-y-1">
                {currentPlan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {subscription?.status === "active" && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Precio:{" "}
                  {currentPlan.price === 0
                    ? "Gratis"
                    : `${currentPlan.price}€/mes`}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          variant="default"
          onClick={() => navigate("/dashboard/pricing")}
        >
          {subscription?.status === "active" ? "Cambiar Plan" : "Ver Planes"}
        </Button>
      </div>
    </div>
  );
}

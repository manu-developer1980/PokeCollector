import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PLAN_FEATURES } from "@/lib/stripe";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, Check, Crown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlanUpgradeDialog } from "./PlanUpgradeDialog";
import { useNavigate } from "react-router-dom";

export default function SubscriptionManagement() {
  const { subscription, loading } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Obtener las características del plan actual
  const currentPlanType = (subscription?.plan_type?.toUpperCase() ||
    "APRENDIZ") as keyof typeof PLAN_FEATURES;
  const currentPlan = PLAN_FEATURES[currentPlanType];

  const handleCancelSubscription = async () => {
    if (!subscription?.stripe_subscription_id) return;

    if (!confirm("¿Estás seguro de que deseas cancelar tu suscripción?"))
      return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: subscription.stripe_subscription_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al cancelar la suscripción");
      }

      toast({
        title: "Suscripción cancelada",
        description:
          "Tu suscripción se cancelará al final del período de facturación actual",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la suscripción",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!subscription) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No tienes una suscripción activa</AlertTitle>
        <AlertDescription>
          Para acceder a todas las funciones, considera suscribirte a uno de
          nuestros planes.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tu suscripción</CardTitle>
          <CardDescription>Detalles de tu plan actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">
                Plan actual: {currentPlan.name}
              </h3>
              <p className="text-muted-foreground">{currentPlan.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium">Estado</h3>
              <p
                className={`capitalize ${
                  subscription.status === "active"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {subscription.status === "active" ? "Activa" : "Cancelada"}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium">Período actual</h3>
              <p className="text-muted-foreground">
                Hasta el{" "}
                {format(
                  new Date(subscription.current_period_end),
                  "d 'de' MMMM, yyyy",
                  { locale: es }
                )}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium">
                Características incluidas:
              </h3>
              <ul className="mt-2 space-y-2">
                {currentPlan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
              {subscription.status === "active" && (
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  disabled={isLoading}
                >
                  {isLoading ? "Cancelando..." : "Cancelar suscripción"}
                </Button>
              )}

              <Button
                variant="default"
                onClick={() => navigate("/dashboard/pricing")}
                className="flex items-center gap-2"
              >
                <Crown className="h-4 w-4" />
                {subscription.status === "active"
                  ? "Cambiar Plan"
                  : "Ver Planes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

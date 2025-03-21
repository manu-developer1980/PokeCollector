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
import { PlanChangeDialog } from "./PlanChangeDialog";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Loader2 } from "lucide-react";
import LoadingSpinner from "../ui/LoaderSpinner";

interface SubscriptionManagementProps {
  onSectionChange: (section: string) => void;
}

export default function SubscriptionManagement({
  onSectionChange,
}: SubscriptionManagementProps) {
  const { subscription, loading } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Obtener las características del plan actual
  const currentPlanType = (subscription?.plan_type?.toUpperCase() ||
    "APRENDIZ") as keyof typeof PLAN_FEATURES;
  const currentPlan = PLAN_FEATURES[currentPlanType];

  const handleCancelSubscription = async () => {
    console.log("Subscription data:", subscription); // Debug log

    if (!subscription) {
      toast({
        title: "Error",
        description: "No se encontró información de la suscripción",
        variant: "destructive",
      });
      return;
    }

    // IMPORTANTE: Asegurarnos de usar stripe_subscription_id
    const subscriptionId = subscription.stripe_subscription_id;

    if (!subscriptionId) {
      toast({
        title: "Error",
        description: "No se encontró el ID de suscripción de Stripe",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            subscriptionId: subscriptionId, // Este debe ser el stripe_subscription_id
            userId: subscription.user_id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cancelar la suscripción");
      }

      toast({
        title: "Suscripción cancelada",
        description:
          "Tu suscripción se cancelará al final del período de facturación actual",
      });

      // Refrescar los datos de la suscripción
      window.location.reload();
      setShowCancelDialog(false);
    } catch (error) {
      console.error("Error completo:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo cancelar la suscripción",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando suscripción..." />;
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
    <div className="container mx-auto py-8">
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
                  onClick={() => setShowCancelDialog(true)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner message="Cancelando..." />
                  ) : (
                    "Cancelar suscripción"
                  )}
                </Button>
              )}

              <Button
                variant="default"
                onClick={() => onSectionChange("Pricing")}
              >
                <Crown className="h-4 w-4" />
                {subscription?.status === "active"
                  ? "Cambiar Plan"
                  : "Ver Planes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={() => handleCancelSubscription()}
        title="Cancelar suscripción"
        description="¿Estás seguro de que deseas cancelar tu suscripción? Podrás seguir usando el servicio hasta el final del período actual."
        confirmText="Cancelar suscripción"
        isLoading={isLoading}
      />
    </div>
  );
}

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { PLAN_FEATURES, SubscriptionPlan } from "@/lib/stripe";
import LoadingSpinner from "@/components/ui/LoaderSpinner";
import { Progress } from "@/components/ui/progress";
import { useStats } from "@/hooks/useStats";

interface SubscriptionPageProps {
  onSectionChange: (section: string) => void;
}

export default function SubscriptionPage({
  onSectionChange,
}: SubscriptionPageProps) {
  const { subscription, loading } = useSubscription();
  const { stats, isLoading: statsLoading } = useStats();

  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner message="Cargando suscripción..." />
      </div>
    );
  }

  const currentPlanType = (subscription?.plan_type?.toUpperCase() ||
    "APRENDIZ") as SubscriptionPlan;
  const currentPlan = PLAN_FEATURES[currentPlanType] || PLAN_FEATURES.APRENDIZ;

  // Calcular porcentajes
  const cardsPercentage = (stats.cardsCount / currentPlan.maxCards) * 100;
  const collectionsPercentage =
    (stats.collectionsCount / currentPlan.maxCollections) * 100;
  const wishlistPercentage =
    (stats.wishlistCount / currentPlan.maxWishlist) * 100;

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

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Uso Actual del Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cartas</span>
                <span className="text-muted-foreground">
                  {stats.cardsCount}/
                  {currentPlan.maxCards === Infinity
                    ? "∞"
                    : currentPlan.maxCards}
                </span>
              </div>
              <Progress
                value={cardsPercentage}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Colecciones</span>
                <span className="text-muted-foreground">
                  {stats.collectionsCount}/
                  {currentPlan.maxCollections === Infinity
                    ? "∞"
                    : currentPlan.maxCollections}
                </span>
              </div>
              <Progress
                value={collectionsPercentage}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Lista de Deseos</span>
                <span className="text-muted-foreground">
                  {stats.wishlistCount}/
                  {currentPlan.maxWishlist === Infinity
                    ? "∞"
                    : currentPlan.maxWishlist}
                </span>
              </div>
              <Progress
                value={wishlistPercentage}
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          variant="default"
          onClick={() => onSectionChange("Pricing")}
        >
          {subscription?.status === "active" ? "Cambiar Plan" : "Ver Planes"}
        </Button>
      </div>
    </div>
  );
}

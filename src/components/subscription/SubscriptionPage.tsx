import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { PLAN_FEATURES, SubscriptionPlan } from "@/lib/stripe";
import LoadingSpinner from "@/components/ui/LoaderSpinner";
import { Progress } from "@/components/ui/progress";
import { useStats } from "@/hooks/useStats";
import { useTranslation } from "react-i18next";

interface SubscriptionPageProps {
  onSectionChange: (section: string) => void;
}

export default function SubscriptionPage({
  onSectionChange,
}: SubscriptionPageProps) {
  const { subscription, loading } = useSubscription();
  const { stats, isLoading: statsLoading } = useStats();
  const { t } = useTranslation();

  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner message={t("subscription.loading")} />
      </div>
    );
  }

  // Convertir el plan_type a la clave correcta para PLAN_FEATURES
  const planTypeMap = {
    aprendiz: "APRENDIZ",
    entrenador: "ENTRENADOR",
    maestro: "MAESTRO",
  } as const;

  const currentPlanType = planTypeMap[
    subscription?.plan_type || "aprendiz"
  ] as SubscriptionPlan;
  const currentPlan = PLAN_FEATURES[currentPlanType];

  console.log("Current plan type:", subscription?.plan_type);
  console.log("Mapped plan type:", currentPlanType);
  console.log("Current plan features:", currentPlan);

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
          {t("subscription.title")}
        </h1>
        <p className="text-gray-600">{t("subscription.description")}</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("subscription.currentPlan")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium">
                {t("subscription.plan")}: {currentPlan.name}
              </p>
              <p>
                {t("subscription.status")}:{" "}
                {subscription?.status === "active"
                  ? t("subscription.statusActive")
                  : t("subscription.statusInactive")}
              </p>
              {subscription?.current_period_end && (
                <p className="text-sm text-muted-foreground">
                  {t("subscription.nextBilling")}:{" "}
                  {new Date(
                    subscription.current_period_end
                  ).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">{t("subscription.planDetails")}:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  {t("collection.maxCards")}:{" "}
                  {currentPlan.maxCards === Infinity
                    ? t("common.unlimited")
                    : currentPlan.maxCards}
                </li>
                <li>
                  {t("collection.maxCollections")}:{" "}
                  {currentPlan.maxCollections === Infinity
                    ? t("common.unlimited")
                    : currentPlan.maxCollections}
                </li>
                <li>
                  {t("wishlist.maxItems")}:{" "}
                  {currentPlan.maxWishlist === Infinity
                    ? t("common.unlimited")
                    : currentPlan.maxWishlist}
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">
                {t("subscription.includedFeatures")}:
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {currentPlan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {subscription?.status === "active" && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  {t("pricing.price")}:{" "}
                  {currentPlan.price === 0
                    ? t("pricing.free")
                    : `${currentPlan.price}€/${t("subscription.month")}`}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("subscription.planUsage")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("collection.cards")}</span>
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
                <span>{t("collection.collections")}</span>
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
                <span>{t("wishlist.title")}</span>
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
          {subscription?.status === "active"
            ? t("subscription.changePlan")
            : t("subscription.viewPlans")}
        </Button>
      </div>
    </div>
  );
}

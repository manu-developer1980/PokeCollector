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
import LoadingSpinner from "@/components/ui/LoaderSpinner";
import { useTranslation } from "react-i18next";

interface SubscriptionManagementProps {
  onSectionChange: (section: string) => void;
}

export default function SubscriptionManagement({
  onSectionChange,
}: SubscriptionManagementProps) {
  const { subscription, isLoading: loading } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { t } = useTranslation();

  // Obtener las características del plan actual
  const currentPlanType = (subscription?.status?.toUpperCase() ||
    "APRENDIZ") as keyof typeof PLAN_FEATURES;
  const currentPlan = PLAN_FEATURES[currentPlanType];

  const handleCancelSubscription = async () => {
  

    if (!subscription) {
      toast({
        title: t("common.error"),
        description: t("subscription.errors.noSubscriptionInfo"),
        variant: "destructive",
      });
      return;
    }

    // IMPORTANTE: Asegurarnos de usar stripe_subscription_id
    const subscriptionId = (subscription as any).stripe_subscription_id;

    if (!subscriptionId) {
      toast({
        title: t("common.error"),
        description: t("subscription.errors.noStripeId"),
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
            userId: (subscription as any).user_id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cancelar la suscripción");
      }

      toast({
        title: t("subscription.canceled"),
        description: t("subscription.canceledDescription"),
      });

      // Refrescar los datos de la suscripción
      window.location.reload();
      setShowCancelDialog(false);
    } catch (error) {
      console.error("Error completo:", error);
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("subscription.errors.cancelFailed"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message={t("subscription.loading")} />;
  }

  if (!subscription) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t("subscription.noActiveSubscription")}</AlertTitle>
        <AlertDescription>
          {t("subscription.considerSubscribing")}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t("subscription.yourSubscription")}</CardTitle>
          <CardDescription>
            {t("subscription.currentPlanDetails")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">
                {t("subscription.currentPlan")}: {currentPlan.name}
              </h3>
              <p className="text-muted-foreground">{currentPlan.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium">
                {t("subscription.status")}
              </h3>
              <p
                className={`capitalize ${
                  subscription.status === "active"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {subscription.status === "active"
                  ? t("subscription.statusActive")
                  : t("subscription.statusCanceled")}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium">
                {t("subscription.currentPeriod")}
              </h3>
              <p className="text-muted-foreground">
                {t("subscription.validUntil", {
                  date: format(
                    new Date((subscription as any).current_period_end),
                    "d 'de' MMMM, yyyy",
                    { locale: es }
                  ),
                })}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium">
                {t("subscription.includedFeatures")}:
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
                    <LoadingSpinner message={t("subscription.canceling")} />
                  ) : (
                    t("subscription.cancelSubscription")
                  )}
                </Button>
              )}

              <Button
                variant="default"
                onClick={() => onSectionChange("Pricing")}
              >
                <Crown className="h-4 w-4" />
                {subscription?.status === "active"
                  ? t("subscription.changePlan")
                  : t("subscription.viewPlans")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={() => handleCancelSubscription()}
        title={t("subscription.cancelSubscription")}
        description={t("subscription.cancelConfirmation")}
        confirmText={t("subscription.cancelSubscription")}
        isLoading={isLoading}
      />
    </div>
  );
}

import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PLAN_FEATURES } from "@/lib/stripe";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, Check, Crown, Receipt } from "lucide-react";
import {
  cancelSubscription,
  openBillingPortal,
} from "@/lib/subscriptionActions";
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
  const { subscription, isLoading: loading, refetchSubscription } =
    useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { t } = useTranslation();

  // Obtener las características del plan actual
  const currentPlanType = (subscription?.plan_type?.toUpperCase() ||
    "APRENDIZ") as keyof typeof PLAN_FEATURES;
  const currentPlan = PLAN_FEATURES[currentPlanType] ?? PLAN_FEATURES.APRENDIZ;

  const handleCancelSubscription = async () => {
    const subscriptionId = subscription?.stripe_subscription_id;

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
      await cancelSubscription(subscriptionId);

      toast({
        title: t("subscription.canceled"),
        description: t("subscription.canceledDescription"),
      });

      await refetchSubscription();
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

  // Portal de facturación de Stripe: facturas, método de pago, etc.
  const handleOpenPortal = async () => {
    setIsOpeningPortal(true);
    try {
      await openBillingPortal();
    } catch (error) {
      console.error("Error abriendo el portal:", error);
      toast({
        title: t("common.error"),
        description:
          error instanceof Error ? error.message : t("common.error"),
        variant: "destructive",
      });
      setIsOpeningPortal(false);
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

              {subscription?.stripe_customer_id && (
                <Button
                  variant="outline"
                  onClick={handleOpenPortal}
                  disabled={isOpeningPortal}
                >
                  <Receipt className="h-4 w-4" />
                  {isOpeningPortal
                    ? t("subscription.processing")
                    : t("subscription.manageBilling", {
                        defaultValue: "Gestionar facturación",
                      })}
                </Button>
              )}
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

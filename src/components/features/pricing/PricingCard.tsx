import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Check, Crown } from "lucide-react";
import { useAuth } from "../../../../supabase/auth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { PLAN_FEATURES } from "@/lib/stripe";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { DowngradeWarningModal } from "@/components/features/subscription/DowngradeWarningModal";
import type { SubscriptionPlan } from "@/lib/stripe";
import { useTranslation } from "react-i18next";
import { selectPlan } from "@/lib/subscriptionActions";

interface PricingCardProps {
  plan: SubscriptionPlan;
  isPopular?: boolean;
  onSelectPlan?: (plan: SubscriptionPlan) => void;
  isCurrentPlan?: boolean;
}

export function PricingCard({
  plan,
  isPopular,
  onSelectPlan,
  isCurrentPlan,
}: PricingCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { subscription, refetchSubscription } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDowngradeWarning, setShowDowngradeWarning] = useState(false);
  const [targetPlan, setTargetPlan] = useState<SubscriptionPlan | null>(null);

  // Get the actual plan features
  const planFeatures = PLAN_FEATURES[plan];

  const currentPlanKey = (
    subscription?.plan_type?.toUpperCase() ?? "APRENDIZ"
  ) as SubscriptionPlan;

  const isPlanDowngrade = (current: string, target: string): boolean => {
    const planHierarchy: Record<string, number> = {
      APRENDIZ: 1,
      ENTRENADOR: 2,
      MAESTRO: 3,
    };

    const normalizedCurrent = current.toUpperCase();
    const normalizedTarget = target.toUpperCase();

    return planHierarchy[normalizedTarget] < planHierarchy[normalizedCurrent];
  };

  // Ejecuta el cambio: checkout si no hay suscripción activa,
  // cambio de plan in situ si la hay (ver src/lib/subscriptionActions.ts).
  const executePlanSelection = async (target: SubscriptionPlan) => {
    try {
      const result = await selectPlan(
        PLAN_FEATURES[target].id,
        subscription
      );

      if (result.kind === "redirect") return; // el navegador ya va a Stripe

      if (result.kind === "changed") {
        await refetchSubscription();
        toast({
          title: t("subscription.planUpdated"),
          description: t("subscription.planUpdatedSuccess"),
        });
        navigate("/checkout-success");
      } else if (result.kind === "scheduled-cancel") {
        await refetchSubscription();
        toast({
          title: t("subscription.canceled"),
          description: t("subscription.canceledDescription"),
        });
      } else {
        toast({
          title: t("pricing.currentPlan"),
          description: t("pricing.alreadyActive"),
        });
      }
    } catch (error) {
      console.error("Error updating plan:", error);
      toast({
        title: t("common.error"),
        description:
          error instanceof Error ? error.message : t("pricing.updateError"),
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleSelectPlan = async () => {
    if (!user) {
      sessionStorage.setItem("selectedPlan", planFeatures.id);
      navigate(`/signup?plan=${plan.toLowerCase()}`);
      return;
    }

    // Si es el plan actual, no hacemos nada
    if (isCurrentPlan) {
      toast({
        title: t("pricing.currentPlan"),
        description: t("pricing.alreadyActive"),
        variant: "default",
      });
      return;
    }

    if (isPlanDowngrade(currentPlanKey, plan)) {
      setShowDowngradeWarning(true);
      setTargetPlan(plan);
      return;
    }

    await executePlanSelection(plan);
  };

  // Determinar el nombre y descripción del plan según el idioma
  const planName = t(`plans.${plan.toLowerCase()}`);
  const planDescription = t(`plans.descriptions.${plan.toLowerCase()}`);

  return (
    <>
      <Card
        className={`relative max-w-[330px] bg-white ${
          isPopular ? "border-primary" : ""
        } ${
          user && isCurrentPlan
            ? "bg-white bg-opacity-100"
            : "hover:scale-105 duration-150 transition-transform cursor-pointer"
        }`}
      >
        {isPopular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
              <Crown className="w-4 h-4" />
              {t("pricing.popular")}
            </span>
          </div>
        )}

        <CardHeader className="text-center">
          <h3 className="text-2xl font-bold">{planName}</h3>
          <p className="text-muted-foreground">{planDescription}</p>
          <div className="mt-4">
            <span className="text-4xl font-bold">
              {planFeatures.price === 0 ? t("pricing.free") : `${planFeatures.price}€`}
            </span>
            {planFeatures.price > 0 && (
              <span className="text-muted-foreground">
                {t("plans.perMonth")}
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <ul className="space-y-3">
            {planFeatures.features.map((feature, index) => (
              <li
                key={index}
                className="flex items-center gap-2"
              >
                <Check className="w-5 h-5 text-primary" />
                <span>
                  {t(`plans.featuresList.${plan.toLowerCase()}.${index}`, {
                    defaultValue: feature,
                  })}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>

        {user && (
          <CardFooter>
            {isCurrentPlan ? (
              <div className="w-full px-4 py-2 bg-white text-green-800 rounded-md text-center font-medium shadow-sm border border-green-200">
                {t("plans.currentPlan")}
              </div>
            ) : (
              <Button
                className="w-full"
                variant={isPopular ? "default" : "outline"}
                onClick={handleSelectPlan}
              >
                {t("plans.selectPlan")}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      <DowngradeWarningModal
        isOpen={showDowngradeWarning}
        onClose={() => {
          setShowDowngradeWarning(false);
          setTargetPlan(null);
        }}
        onConfirm={async () => {
          setShowDowngradeWarning(false);
          if (targetPlan) {
            await executePlanSelection(targetPlan);
            setTargetPlan(null);
          }
        }}
        currentPlan={currentPlanKey}
        targetPlan={plan}
        currentStats={undefined}
      />
    </>
  );
}

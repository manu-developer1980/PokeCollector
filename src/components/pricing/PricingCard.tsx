import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Check, Crown } from "lucide-react";
import { useAuth } from "../../../supabase/auth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { PlanFeature } from "@/lib/stripe";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DowngradeWarningModal } from "@/components/subscription/DowngradeWarningModal";
import type { SubscriptionPlan } from "@/lib/stripe";
// Añadir esta importación
import { useTranslation } from "react-i18next";

interface PricingCardProps {
  plan: PlanFeature;
  isPopular?: boolean;
  onSelectPlan: (planId: string) => void;
  isCurrentPlan: boolean;
}

export function PricingCard({
  plan,
  isPopular,
  onSelectPlan,
  isCurrentPlan,
}: PricingCardProps) {
  // Añadir esta línea
  const { t } = useTranslation();

  const { user } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const [showDowngradeWarning, setShowDowngradeWarning] = useState(false);
  const [targetPlan, setTargetPlan] = useState<string | null>(null);

  const isPlanDowngrade = (current: string, target: string): boolean => {
    const planHierarchy: Record<string, number> = {
      APRENDIZ: 1,
      ENTRENADOR: 2,
      MAESTRO: 3,
    };

    const normalizedCurrent = current.toUpperCase();
    const normalizedTarget = target.toUpperCase();

    console.log("Checking downgrade:", {
      normalizedCurrent,
      normalizedTarget,
      currentValue: planHierarchy[normalizedCurrent],
      targetValue: planHierarchy[normalizedTarget],
      isDowngrade:
        planHierarchy[normalizedTarget] < planHierarchy[normalizedCurrent],
    });

    return planHierarchy[normalizedTarget] < planHierarchy[normalizedCurrent];
  };

  const handleSelectPlan = async () => {
    if (!user) {
      sessionStorage.setItem("selectedPlan", plan.id);
      navigate(`/signup?plan=${plan.name.toLowerCase()}`);
      return;
    }

    // Si es el plan actual, no hacemos nada
    if (isCurrentPlan) {
      toast({
        title: t("pricing.currentPlanToast.title"),
        description: t("pricing.currentPlanToast.description"),
        variant: "default",
      });
      return;
    }

    // Verificar si es un downgrade
    const currentPlanType = (
      subscription?.plan_type || "APRENDIZ"
    ).toUpperCase();
    console.log("Current plan type:", currentPlanType);

    if (isPlanDowngrade(currentPlanType, plan.name)) {
      console.log("Showing downgrade warning");
      setShowDowngradeWarning(true);
      setTargetPlan(plan.id);
      return;
    }

    // Permitir el cambio de plan
    try {
      await onSelectPlan(plan.id);
      // Eliminamos el toast de aquí ya que se mostrará en PlanChangeDialog
    } catch (error) {
      console.error("Error updating plan:", error);
      toast({
        title: t("errors.generic"),
        description: t("pricing.errorUpdatingPlan"),
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card
        className={`relative max-w-[330px] ${
          isPopular ? "border-primary" : ""
        } ${
          user && isCurrentPlan
            ? "bg-opacity-90"
            : "hover:scale-105 duration-150 transition-transform cursor-pointer"
        }`}
      >
        {isPopular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
              <Crown className="w-4 h-4" />
              {t("pricing.popularBadge")}
            </span>
          </div>
        )}

        <CardHeader className="text-center">
          <h3 className="text-2xl font-bold">
            {t(`plans.${plan.name.toLowerCase()}.name`)}
          </h3>
          <p className="text-muted-foreground">
            {t(`plans.${plan.name.toLowerCase()}.description`)}
          </p>
          <div className="mt-4">
            <span className="text-4xl font-bold">{plan.price}€</span>
            <span className="text-muted-foreground">
              /{t("plans.perMonth")}
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li
                key={index}
                className="flex items-center gap-2"
              >
                <Check className="w-5 h-5 text-primary" />
                <span>
                  {t(`plans.${plan.name.toLowerCase()}.features.${index}`)}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>

        {user && (
          <CardFooter>
            {isCurrentPlan ? (
              <div className="w-full px-4 py-2 bg-green-100 text-green-800 rounded-md text-center font-medium shadow-sm">
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
        onConfirm={() => {
          if (targetPlan) {
            onSelectPlan(targetPlan);
          }
          setShowDowngradeWarning(false);
        }}
        currentPlan={
          (subscription?.plan_type?.toUpperCase() as SubscriptionPlan) ||
          "APRENDIZ"
        }
        targetPlan={plan.name.toUpperCase() as SubscriptionPlan}
        currentStats={subscription?.stats}
      />
    </>
  );
}

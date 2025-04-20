import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PLAN_FEATURES, SubscriptionPlan } from "@/lib/stripe";
import { DowngradeWarningModal } from "./DowngradeWarningModal";
import { useSubscriptionStats } from "@/hooks/useSubscriptionStats";
import { useTranslation } from "react-i18next";
import { useSubscription } from "@/hooks/useSubscription";

interface PricingCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  onSelectPlan?: (plan: SubscriptionPlan) => void;
  // other props...
}

interface PlanChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  showWelcomeMessage?: boolean;
}

export function PlanChangeDialog({
  isOpen,
  onClose,
  currentPlan,
  showWelcomeMessage = false,
}: PlanChangeDialogProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [prorationAmount, setProrationAmount] = useState<number | null>(null);
  const [showDowngradeWarning, setShowDowngradeWarning] = useState(false);
  const [targetPlan, setTargetPlan] = useState<SubscriptionPlan | null>(null);
  const { stats } = useSubscriptionStats();
  const { refetchSubscription } = useSubscription();

  const handlePlanChange = async (newPlan: SubscriptionPlan) => {
    console.log("handlePlanChange called with:", { newPlan, currentPlan }); // Nuevo log

    // Si el usuario intenta cambiar al mismo plan, no hacemos nada
    if (newPlan === currentPlan) {
      console.log("Same plan, ignoring"); // Nuevo log
      return;
    }

    // Verificar si es un downgrade
    const isDowngrade = isPlanDowngrade(currentPlan, newPlan);
    console.log("isPlanDowngrade result:", {
      isDowngrade,
      currentPlan,
      newPlan,
    }); // Nuevo log

    if (isDowngrade) {
      console.log("Showing downgrade warning"); // Nuevo log
      setTargetPlan(newPlan);
      setShowDowngradeWarning(true);
      return;
    }

    await processPlanChange(newPlan);
  };

  const isPlanDowngrade = (current: string, target: SubscriptionPlan) => {
    // Convertir los planes a mayúsculas para asegurar la comparación correcta
    const normalizedCurrent = current.toUpperCase();
    const normalizedTarget = target.toUpperCase() as SubscriptionPlan;

    // Mapear los nombres de planes normalizados a las claves de SubscriptionPlan
    let currentPlanKey: SubscriptionPlan;
    if (
      normalizedCurrent.includes("APRENDIZ") ||
      normalizedCurrent.includes("APPRENTICE")
    ) {
      currentPlanKey = "APRENDIZ";
    } else if (
      normalizedCurrent.includes("ENTRENADOR") ||
      normalizedCurrent.includes("TRAINER")
    ) {
      currentPlanKey = "ENTRENADOR";
    } else if (
      normalizedCurrent.includes("MAESTRO") ||
      normalizedCurrent.includes("MASTER")
    ) {
      currentPlanKey = "MAESTRO";
    } else {
      // Si no podemos determinar el plan, asumimos APRENDIZ
      currentPlanKey = "APRENDIZ";
    }

    const planHierarchy: Record<SubscriptionPlan, number> = {
      APRENDIZ: 1,
      ENTRENADOR: 2,
      MAESTRO: 3,
    };

    console.log("isPlanDowngrade checking:", {
      normalizedCurrent,
      currentPlanKey,
      normalizedTarget,
      currentValue: planHierarchy[currentPlanKey],
      targetValue: planHierarchy[normalizedTarget],
    }); // Nuevo log

    // Si el plan actual es APRENDIZ, nunca será un downgrade
    if (currentPlanKey === "APRENDIZ") return false;

    return planHierarchy[normalizedTarget] < planHierarchy[currentPlanKey];
  };

  const processPlanChange = async (newPlan: SubscriptionPlan) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/change-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPlan }),
      });

      if (!response.ok) {
        throw new Error(t("subscription.errors.changePlan"));
      }

      const data = await response.json();

      if (data.prorationAmount > 0) {
        setProrationAmount(data.prorationAmount / 100);
        if (data.subscription.latest_invoice?.payment_intent) {
          window.location.href =
            data.subscription.latest_invoice.payment_intent.client_secret;
        }
      } else {
        // Actualizar la suscripción en la UI
        await refetchSubscription();

        toast({
          title: t("subscription.planUpdated"),
          description: t("subscription.planUpdatedSuccess"),
        });

        // Redirigir a la página de éxito para mostrar el nuevo plan
        navigate("/checkout-success");
        onClose();
      }
    } catch (error) {
      console.error(t("subscription.errors.changePlanLog"), error);
      toast({
        title: t("subscription.errors.changePlan"),
        description: t("subscription.errors.tryAgain"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={onClose}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {showWelcomeMessage
                ? t("subscription.welcomeMessage")
                : t("subscription.changePlan")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* No mostramos el plan Aprendiz ya que es gratuito */}
            <div className="space-y-2">
              <h3 className="font-medium">{PLAN_FEATURES.ENTRENADOR.name}</h3>
              <p className="text-sm text-muted-foreground">
                {PLAN_FEATURES.ENTRENADOR.description}
              </p>
              <p className="text-sm text-muted-foreground">
                {PLAN_FEATURES.ENTRENADOR.price}€/{t("subscription.month")}
              </p>
              <ul className="text-sm text-muted-foreground mb-4">
                {PLAN_FEATURES.ENTRENADOR.features.map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
              <Button
                onClick={() => handlePlanChange("ENTRENADOR")}
                disabled={
                  isLoading || currentPlan.toLowerCase() === "entrenador"
                }
                className="w-full"
              >
                {isLoading
                  ? t("subscription.processing")
                  : currentPlan.toLowerCase() === "entrenador"
                  ? t("subscription.currentPlan")
                  : t("subscription.upgradeTo", {
                      plan: PLAN_FEATURES.ENTRENADOR.name,
                    })}
              </Button>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">{PLAN_FEATURES.MAESTRO.name}</h3>
              <p className="text-sm text-muted-foreground">
                {PLAN_FEATURES.MAESTRO.description}
              </p>
              <p className="text-sm text-muted-foreground">
                {PLAN_FEATURES.MAESTRO.price}€/{t("subscription.month")}
              </p>
              <ul className="text-sm text-muted-foreground mb-4">
                {PLAN_FEATURES.MAESTRO.features.map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
              <Button
                onClick={() => handlePlanChange("MAESTRO")}
                disabled={isLoading || currentPlan.toLowerCase() === "maestro"}
                className="w-full"
              >
                {isLoading
                  ? t("subscription.processing")
                  : currentPlan.toLowerCase() === "maestro"
                  ? t("subscription.currentPlan")
                  : t("subscription.upgradeTo", {
                      plan: PLAN_FEATURES.MAESTRO.name,
                    })}
              </Button>
            </div>
          </div>
          {prorationAmount !== null && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p>
                {t("subscription.prorationAmount", {
                  amount: prorationAmount.toFixed(2),
                })}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DowngradeWarningModal
        isOpen={showDowngradeWarning}
        onClose={() => {
          setShowDowngradeWarning(false);
          setTargetPlan(null);
        }}
        onConfirm={() => {
          if (targetPlan) {
            processPlanChange(targetPlan);
          }
          setShowDowngradeWarning(false);
        }}
        currentPlan={currentPlan}
        targetPlan={targetPlan as SubscriptionPlan}
        currentStats={stats}
      />
    </>
  );
}

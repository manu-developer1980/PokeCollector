import { useState } from "react";
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
import { selectPlan } from "@/lib/subscriptionActions";

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
  const [showDowngradeWarning, setShowDowngradeWarning] = useState(false);
  const [targetPlan, setTargetPlan] = useState<SubscriptionPlan | null>(null);
  const { stats } = useSubscriptionStats();
  const { subscription, refetchSubscription } = useSubscription();

  const handlePlanChange = async (newPlan: SubscriptionPlan) => {
    // Si el usuario intenta cambiar al mismo plan, no hacemos nada
    if (newPlan === currentPlan) {
      return;
    }

    // Verificar si es un downgrade
    const isDowngrade = isPlanDowngrade(currentPlan, newPlan);

    if (isDowngrade) {
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



    // Si el plan actual es APRENDIZ, nunca será un downgrade
    if (currentPlanKey === "APRENDIZ") return false;

    return planHierarchy[normalizedTarget] < planHierarchy[currentPlanKey];
  };

  // Sin suscripción activa (p. ej. usuario recién registrado) redirige a
  // Stripe Checkout; con suscripción activa cambia el plan in situ.
  const processPlanChange = async (newPlan: SubscriptionPlan) => {
    setIsLoading(true);
    try {
      const result = await selectPlan(
        PLAN_FEATURES[newPlan].id,
        subscription
      );

      if (result.kind === "redirect") return; // el navegador ya va a Stripe

      await refetchSubscription();
      toast({
        title: t("subscription.planUpdated"),
        description: t("subscription.planUpdatedSuccess"),
      });
      navigate("/checkout-success");
      onClose();
    } catch (error) {
      console.error(t("subscription.errors.changePlanLog"), error);
      toast({
        title: t("subscription.errors.changePlan"),
        description:
          error instanceof Error
            ? error.message
            : t("subscription.errors.tryAgain"),
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
        currentStats={{
          totalCards: stats.cardsCount,
          totalCollections: stats.collectionsCount,
          totalWishlist: stats.wishlistCount,
        }}
      />
    </>
  );
}

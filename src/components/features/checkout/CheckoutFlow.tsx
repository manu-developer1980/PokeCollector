import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PLAN_FEATURES } from "@/lib/stripe";
import { selectPlan } from "@/lib/subscriptionActions";
import type { Subscription } from "@/hooks/useSubscription";
import LoadingSpinner from "@/components/ui/LoaderSpinner";
import { useTranslation } from "react-i18next";

interface CheckoutFlowProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  currentSubscription: Subscription | null;
}

export function CheckoutFlow({
  isOpen,
  onClose,
  planId,
  currentSubscription,
}: CheckoutFlowProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const selectedPlan = Object.values(PLAN_FEATURES).find(
    (plan) => plan.id === planId
  );

  // Obtener el nombre traducido del plan
  const getPlanTranslatedName = () => {
    if (!selectedPlan) return "";

    // Convertir el nombre del plan a minúsculas para usarlo como clave
    const planKey = selectedPlan.name.toLowerCase();
    return t(`plans.${planKey}.name`);
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      // Sin suscripción activa redirige a Stripe Checkout; con ella cambia
      // el plan in situ (ver src/lib/subscriptionActions.ts).
      const result = await selectPlan(planId, currentSubscription);

      if (result.kind === "redirect") return; // el navegador ya va a Stripe

      navigate("/checkout-success");
      onClose();
    } catch (error) {
      console.error("Error completo:", error);
      toast({
        title: t("checkout.error"),
        description:
          error instanceof Error
            ? error.message
            : t("checkout.errorDescription"),
        variant: "destructive",
        duration: 5000,
      });
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("checkout.confirmSubscription")}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">{t("checkout.selectedPlan")}</h4>
              <p className="text-2xl font-bold">{getPlanTranslatedName()}</p>
            </div>
            <div>
              <h4 className="font-medium">{t("checkout.price")}</h4>
              <p className="text-2xl">
                {selectedPlan?.price || 0}€
                <span className="text-base text-muted-foreground">
                  {t("checkout.perMonth")}
                </span>
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner message={t("checkout.processingPayment")} />
              </>
            ) : (
              t("checkout.continueToPayment")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

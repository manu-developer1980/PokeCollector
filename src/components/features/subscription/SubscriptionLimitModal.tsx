import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface SubscriptionLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: "cards" | "collections" | "wishlist" | null;
  currentPlan: string;
  errorMessage: string;
  onViewPlans?: () => void;
}

export function SubscriptionLimitModal({
  isOpen,
  onClose,
  limitType,
  currentPlan,
  errorMessage,
  onViewPlans,
}: SubscriptionLimitModalProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();



  const handleUpgrade = () => {
    navigate("/pricing");
    onClose();
  };

  const getLimitTypeText = () => {
    switch (limitType) {
      case "cards":
        return t("limits.cards");
      case "collections":
        return t("limits.collections");
      case "wishlist":
        return t("limits.wishlist");
      default:
        return t("limits.elements");
    }
  };

  // Función para traducir el nombre del plan
  const getTranslatedPlanName = (planType: string) => {
    // Convertir a minúsculas y eliminar espacios
    const normalizedPlanType = planType.toLowerCase().trim();

    // Mapear los nombres de planes en mayúsculas a sus claves de traducción
    // Primero intentamos con el nombre normalizado
    if (
      normalizedPlanType === "aprendiz" ||
      normalizedPlanType === "apprentice"
    ) {
      return t("plans.aprendiz");
    } else if (
      normalizedPlanType === "entrenador" ||
      normalizedPlanType === "trainer"
    ) {
      return t("plans.entrenador");
    } else if (
      normalizedPlanType === "maestro" ||
      normalizedPlanType === "master"
    ) {
      return t("plans.maestro");
    }

    // Si no coincide con ninguno de los anteriores, intentamos con el nombre original
    // pero convertido a formato de clave (primera letra minúscula)
    const planKey = planType.charAt(0).toLowerCase() + planType.slice(1);

    // Intentamos buscar una traducción para este plan
    const translation = t(`plans.${planKey}`, { defaultValue: planType });

    // Si la traducción es igual al planType, significa que no se encontró una traducción
    // En ese caso, devolvemos el nombre original
    return translation !== planKey ? translation : planType;
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {t("limits.limitReached", { type: getLimitTypeText() })}
          </DialogTitle>
          <DialogDescription className="pt-2">{errorMessage}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            {t("limits.currentPlanLimit", {
              plan: getTranslatedPlanName(currentPlan),
              type: getLimitTypeText(),
            })}
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={() => {
              onClose();
              onViewPlans?.();
            }}
          >
            {t("limits.upgradePlan")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

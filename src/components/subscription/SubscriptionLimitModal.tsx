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
  const { t } = useTranslation();

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
              plan: currentPlan,
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

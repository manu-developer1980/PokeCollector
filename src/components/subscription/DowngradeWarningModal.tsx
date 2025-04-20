import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { SubscriptionPlan } from "@/lib/stripe";
import { useTranslation } from "react-i18next";

interface DowngradeWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPlan: string;
  targetPlan: SubscriptionPlan;
  currentStats?: {
    totalCards?: number;
    totalCollections?: number;
    totalWishlist?: number;
  };
}

export function DowngradeWarningModal({
  isOpen,
  onClose,
  onConfirm,
  currentPlan,
  targetPlan,
  currentStats,
}: DowngradeWarningModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            {t("subscription.downgrade.confirmTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("subscription.downgrade.description", {
              currentPlan: currentPlan,
              targetPlan: targetPlan,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-red-600 font-medium">
            {t("subscription.downgrade.warning")}
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
            variant="destructive"
            onClick={onConfirm}
          >
            {t("subscription.downgrade.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

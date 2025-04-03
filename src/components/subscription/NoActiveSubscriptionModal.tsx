import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { useTranslation } from "react-i18next";

interface NoActiveSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewPlans: () => void;
  action: string;
}

export function NoActiveSubscriptionModal({
  isOpen,
  onClose,
  onViewPlans,
  action,
}: NoActiveSubscriptionModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("subscription.requiredTitle")}</DialogTitle>
          <DialogDescription>
            {t("subscription.requiredDescription", { action })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            {t("common.cancel")}
          </Button>
          <Button onClick={onViewPlans}>{t("subscription.viewPlans")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

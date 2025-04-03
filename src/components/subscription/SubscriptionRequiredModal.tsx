import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Crown, Sparkles, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SubscriptionRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

export function SubscriptionRequiredModal({
  isOpen,
  onClose,
  feature,
}: SubscriptionRequiredModalProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleViewPlans = () => {
    navigate("/pricing");
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
            <Crown className="h-6 w-6 text-yellow-500" />
            {t("subscription.upgradeExperience")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {feature
              ? t("subscription.requiredDescription", { action: feature })
              : t("subscription.discoverPremium")}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>{t("subscription.features.unlimitedCollections")}</span>
            </li>
            <li className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>{t("subscription.features.extendedWishlist")}</span>
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span>{t("subscription.features.exclusiveFeatures")}</span>
            </li>
          </ul>
        </div>
        <DialogFooter className="sm:justify-center gap-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            {t("subscription.later")}
          </Button>
          <Button
            onClick={handleViewPlans}
            className="gap-2"
          >
            <Crown className="h-4 w-4" />
            {t("subscription.viewPlans")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

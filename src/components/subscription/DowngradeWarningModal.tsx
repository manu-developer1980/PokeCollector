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
import { AlertTriangle } from "lucide-react";
import { PLAN_FEATURES, SubscriptionPlan } from "@/lib/stripe";

interface DowngradeWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPlan: SubscriptionPlan;
  targetPlan: SubscriptionPlan;
  currentStats: {
    cardsCount: number;
    collectionsCount: number;
    wishlistCount: number;
  } | null;
}

export function DowngradeWarningModal({
  isOpen,
  onClose,
  onConfirm,
  currentPlan,
  targetPlan,
  currentStats = { cardsCount: 0, collectionsCount: 0, wishlistCount: 0 },
}: DowngradeWarningModalProps) {
  const targetFeatures = PLAN_FEATURES[targetPlan];
  const stats = currentStats || {
    cardsCount: 0,
    collectionsCount: 0,
    wishlistCount: 0,
  };

  const willLoseCards = stats.cardsCount > targetFeatures.maxCards;
  const willLoseCollections =
    stats.collectionsCount > targetFeatures.maxCollections;
  const willLoseWishlist = stats.wishlistCount > targetFeatures.maxWishlist;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Advertencia de Cambio de Plan
          </DialogTitle>
          <DialogDescription>
            Al cambiar al plan {targetFeatures.name}, se aplicarán las
            siguientes restricciones:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {willLoseCards && (
            <div className="text-sm text-red-600">
              • Se mantendrán solo las {targetFeatures.maxCards} cartas más
              recientes (actualmente tienes {stats.cardsCount})
            </div>
          )}
          {willLoseCollections && (
            <div className="text-sm text-red-600">
              • Se mantendrán solo las {targetFeatures.maxCollections}{" "}
              colecciones más recientes (actualmente tienes{" "}
              {stats.collectionsCount})
            </div>
          )}
          {willLoseWishlist && (
            <div className="text-sm text-red-600">
              • Se mantendrán solo las {targetFeatures.maxWishlist} cartas en la
              lista de deseos (actualmente tienes {stats.wishlistCount})
            </div>
          )}
          <div className="text-sm font-medium">
            Esta acción no se puede deshacer. ¿Estás seguro de que deseas
            continuar?
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
          >
            Confirmar Cambio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

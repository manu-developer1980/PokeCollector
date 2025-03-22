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

interface DowngradeWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPlan: SubscriptionPlan;
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
  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Confirmar cambio de plan
          </DialogTitle>
          <DialogDescription>
            Estás a punto de cambiar de {currentPlan} a {targetPlan}. Este
            cambio reducirá los límites de tu cuenta.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-red-600 font-medium">
            Importante: Si excedes los límites del nuevo plan, no podrás añadir
            más items hasta que liberes espacio.
          </p>
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
            Confirmar cambio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

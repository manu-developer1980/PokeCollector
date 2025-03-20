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

interface NoActiveSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewPlans: () => void;
  action?: string;
}

export function NoActiveSubscriptionModal({
  isOpen,
  onClose,
  onViewPlans,
  action = "realizar esta acción",
}: NoActiveSubscriptionModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
            <Crown className="h-6 w-6 text-yellow-500" />
            Suscripción Requerida
          </DialogTitle>
          <DialogDescription className="text-center">
            Necesitas una suscripción activa para {action}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-muted-foreground">
            Descubre nuestros planes y elige el que mejor se adapte a tus
            necesidades
          </p>
        </div>
        <DialogFooter className="flex gap-2 sm:justify-center">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={onViewPlans}
            className="flex items-center gap-2"
          >
            <Crown className="h-4 w-4" />
            Ver planes disponibles
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

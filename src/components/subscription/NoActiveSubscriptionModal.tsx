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
  action: string;
}

export function NoActiveSubscriptionModal({
  isOpen,
  onClose,
  onViewPlans,
  action,
}: NoActiveSubscriptionModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suscripción Requerida</DialogTitle>
          <DialogDescription>
            Necesitas una suscripción activa para {action}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button onClick={onViewPlans}>Ver Planes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

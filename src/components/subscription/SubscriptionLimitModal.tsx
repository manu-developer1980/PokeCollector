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

interface SubscriptionLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: "cards" | "collections" | "wishlist" | null;
  currentPlan: string;
  errorMessage: string;
}

export function SubscriptionLimitModal({
  isOpen,
  onClose,
  limitType,
  currentPlan,
  errorMessage,
}: SubscriptionLimitModalProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate("/pricing");
    onClose();
  };

  const getLimitTypeText = () => {
    switch (limitType) {
      case "cards":
        return "cartas en tu colección";
      case "collections":
        return "colecciones";
      case "wishlist":
        return "cartas en tu lista de deseos";
      default:
        return "elementos";
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Límite de {getLimitTypeText()} alcanzado</DialogTitle>
          <DialogDescription className="pt-2">{errorMessage}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Tu plan actual ({currentPlan}) ha alcanzado su límite. Actualiza tu
            plan para obtener acceso a más {getLimitTypeText()} y otras
            funcionalidades.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button onClick={handleUpgrade}>Mejorar Plan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

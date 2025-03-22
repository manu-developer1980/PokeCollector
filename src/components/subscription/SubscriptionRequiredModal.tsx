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
            Mejora tu experiencia
          </DialogTitle>
          <DialogDescription className="text-center">
            {feature
              ? `Para acceder a ${feature}, necesitas actualizar tu plan de suscripción.`
              : "Descubre todas las características premium de PokéCollector."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Colecciones ilimitadas</span>
            </li>
            <li className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Lista de deseos extendida</span>
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span>Características premium exclusivas</span>
            </li>
          </ul>
        </div>
        <DialogFooter className="sm:justify-center gap-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Más tarde
          </Button>
          <Button
            onClick={handleViewPlans}
            className="gap-2"
          >
            <Crown className="h-4 w-4" />
            Ver planes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

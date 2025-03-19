import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { SUBSCRIPTION_PLANS, PLAN_FEATURES } from "@/lib/polar";

interface PlanUpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
}

export function PlanUpgradeDialog({
  isOpen,
  onClose,
  currentPlan,
}: PlanUpgradeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true);

    try {
      if (!user?.email) {
        throw new Error("Usuario no autenticado");
      }

      // Add success URL and cancel URL
      const response = await supabase.functions.invoke("create-checkout", {
        body: {
          productPriceId: planId,
          customerEmail: user.email,
          metadata: {
            user_id: user.id,
          },
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/pricing`,
        },
      });

      // More detailed error logging
      if (response.error) {
        console.error("Error detallado:", {
          error: response.error,
          message: response.error.message,
          context: response.error.context,
          status: response.error.status,
          data: response.data,
        });

        throw new Error(
          `Error del servidor: ${
            response.error.message || JSON.stringify(response.error)
          }`
        );
      }

      if (!response.data?.url) {
        console.error("Respuesta sin URL:", response.data);
        throw new Error("No se recibió la URL de checkout");
      }

      window.location.href = response.data.url;
    } catch (error) {
      console.error("Error completo:", error);
      toast({
        title: "Error al procesar el pago",
        description: error.message || "Por favor, intenta nuevamente más tarde",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium">{PLAN_FEATURES.ENTRENADOR.name}</h3>
            <p className="text-sm text-muted-foreground">
              {PLAN_FEATURES.ENTRENADOR.price}€/mes
            </p>
            <ul className="text-sm text-muted-foreground mb-4">
              {PLAN_FEATURES.ENTRENADOR.features.map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
            <Button
              onClick={() => handleUpgrade(SUBSCRIPTION_PLANS.ENTRENADOR)}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading
                ? "Procesando..."
                : `Actualizar a ${PLAN_FEATURES.ENTRENADOR.name}`}
            </Button>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">{PLAN_FEATURES.MAESTRO.name}</h3>
            <p className="text-sm text-muted-foreground">
              {PLAN_FEATURES.MAESTRO.price}€/mes
            </p>
            <ul className="text-sm text-muted-foreground mb-4">
              {PLAN_FEATURES.MAESTRO.features.map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
            <Button
              onClick={() => handleUpgrade(SUBSCRIPTION_PLANS.MAESTRO)}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading
                ? "Procesando..."
                : `Actualizar a ${PLAN_FEATURES.MAESTRO.name}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

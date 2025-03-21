import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import {
  SUBSCRIPTION_PLANS,
  PLAN_FEATURES,
  SubscriptionPlan,
} from "@/lib/stripe";

interface PlanChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: SubscriptionPlan;
  currentSubscriptionId: string;
}

export function PlanChangeDialog({
  isOpen,
  onClose,
  currentPlan,
  currentSubscriptionId,
}: PlanChangeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [prorationAmount, setProrationAmount] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handlePlanChange = async (planKey: SubscriptionPlan) => {
    setIsLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No se pudo obtener la sesión");
      }

      const newPriceId = SUBSCRIPTION_PLANS[planKey];

      const response = await supabase.functions.invoke("change-subscription", {
        body: {
          subscriptionId: currentSubscriptionId,
          newPriceId,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Si hay un monto de proración, mostrar al usuario y confirmar
      if (response.data.prorationAmount > 0) {
        setProrationAmount(response.data.prorationAmount / 100); // Convertir de centavos a euros

        // Si se requiere pago adicional, redirigir a la página de pago
        if (response.data.subscription.latest_invoice?.payment_intent) {
          window.location.href =
            response.data.subscription.latest_invoice.payment_intent.client_secret;
        }
      } else {
        toast({
          title: "Plan actualizado",
          description: "Tu plan ha sido actualizado exitosamente",
        });
        onClose();
      }
    } catch (error) {
      console.error("Error al cambiar plan:", error);
      toast({
        title: "Error al cambiar plan",
        description:
          "Hubo un error al procesar tu solicitud. Por favor, intenta nuevamente.",
        variant: "destructive",
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
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Cambiar Plan</DialogTitle>
          <DialogDescription>
            Selecciona el plan al que deseas cambiar. Si hay una diferencia en
            el precio, se te cobrará o acreditará el monto correspondiente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* No mostramos el plan Aprendiz ya que es gratuito */}
          <div className="space-y-2">
            <h3 className="font-medium">{PLAN_FEATURES.ENTRENADOR.name}</h3>
            <p className="text-sm text-muted-foreground">
              {PLAN_FEATURES.ENTRENADOR.description}
            </p>
            <p className="text-sm text-muted-foreground">
              {PLAN_FEATURES.ENTRENADOR.price}€/mes
            </p>
            <ul className="text-sm text-muted-foreground mb-4">
              {PLAN_FEATURES.ENTRENADOR.features.map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
            <Button
              onClick={() => handlePlanChange("ENTRENADOR")}
              disabled={isLoading || currentPlan === "ENTRENADOR"}
              className="w-full"
            >
              {isLoading
                ? "Procesando..."
                : currentPlan === "ENTRENADOR"
                ? "Plan actual"
                : `Actualizar a ${PLAN_FEATURES.ENTRENADOR.name}`}
            </Button>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">{PLAN_FEATURES.MAESTRO.name}</h3>
            <p className="text-sm text-muted-foreground">
              {PLAN_FEATURES.MAESTRO.description}
            </p>
            <p className="text-sm text-muted-foreground">
              {PLAN_FEATURES.MAESTRO.price}€/mes
            </p>
            <ul className="text-sm text-muted-foreground mb-4">
              {PLAN_FEATURES.MAESTRO.features.map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
            <Button
              onClick={() => handlePlanChange("MAESTRO")}
              disabled={isLoading || currentPlan === "MAESTRO"}
              className="w-full"
            >
              {isLoading
                ? "Procesando..."
                : currentPlan === "MAESTRO"
                ? "Plan actual"
                : `Actualizar a ${PLAN_FEATURES.MAESTRO.name}`}
            </Button>
          </div>
        </div>
        {prorationAmount !== null && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p>
              Monto a pagar por el cambio de plan: {prorationAmount.toFixed(2)}€
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { PLAN_FEATURES } from "@/lib/stripe";
import type { Subscription } from "@/hooks/useSubscription";

interface CheckoutFlowProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  currentSubscription: Subscription | null;
}

export function CheckoutFlow({
  isOpen,
  onClose,
  planId,
  currentSubscription,
}: CheckoutFlowProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const selectedPlan = Object.values(PLAN_FEATURES).find(
    (plan) => plan.id === planId
  );

  const handleCheckout = async () => {
    if (!user || !selectedPlan) return;

    setIsLoading(true);

    try {
      // Si ya existe una suscripción activa, mostrar error
      if (currentSubscription?.status === "active") {
        toast({
          title: "Suscripción existente",
          description: "Ya tienes una suscripción activa.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      // Crear sesión de checkout
      const { data, error } = await supabase.functions.invoke(
        "create-stripe-checkout",
        {
          body: {
            priceId: planId,
            customerEmail: user.email,
            metadata: {
              user_id: user.id,
              plan_name: selectedPlan.name,
            },
            successUrl: `${window.location.origin}/checkout/success`,
            cancelUrl: `${window.location.origin}/pricing`,
          },
        }
      );

      if (error) throw error;

      // Redirigir a Stripe
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No se recibió URL de checkout");
      }
    } catch (error) {
      console.error("Error al crear checkout:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar el checkout. Intenta nuevamente.",
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirmar suscripción</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Plan seleccionado:</h4>
              <p className="text-2xl font-bold">{selectedPlan?.name}</p>
            </div>
            <div>
              <h4 className="font-medium">Precio:</h4>
              <p className="text-2xl">
                ${selectedPlan?.price}
                <span className="text-base text-muted-foreground">/mes</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCheckout}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continuar al pago
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

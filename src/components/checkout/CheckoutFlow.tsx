import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
    try {
      const requestData = {
        priceId: planId,
        customerEmail: user.email,
        metadata: {
          user_id: user.id,
          plan_name: selectedPlan.name,
        },
        successUrl: `${window.location.origin}/checkout-success`,
        cancelUrl: `${window.location.origin}/dashboard`,
      };

      console.log("Checkout request data:", requestData);

      const { data, error } = await supabase.functions.invoke(
        "create-stripe-checkout",
        {
          body: requestData,
        }
      );

      if (error) {
        console.error("Checkout error:", error);
        throw error;
      }

      if (!data?.url) {
        throw new Error("No se recibió la URL de checkout");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Error completo:", error);
      toast({
        title: "Error al procesar el pago",
        description:
          "Error al conectar con el servicio de pagos. Por favor, intenta nuevamente.",
        variant: "destructive",
        duration: 5000,
      });
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
                {selectedPlan?.price}€
                <span className="text-base text-muted-foreground">/mes</span>
              </p>
            </div>
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
            onClick={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Continuar al pago"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

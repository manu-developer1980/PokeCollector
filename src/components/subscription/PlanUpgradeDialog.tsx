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

interface PlanUpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: SubscriptionPlan;
  showWelcomeMessage?: boolean;
}

export function PlanUpgradeDialog({
  isOpen,
  onClose,
  currentPlan,
  showWelcomeMessage = false,
}: PlanUpgradeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleUpgrade = async (planKey: SubscriptionPlan) => {
    setIsLoading(true);

    try {
      if (!user?.email) {
        throw new Error("Usuario no autenticado");
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("No se pudo obtener la sesión");
      }

      // Obtener el ID del precio del plan seleccionado
      const priceId = SUBSCRIPTION_PLANS[planKey];

      if (!priceId) {
        throw new Error(`Información del plan ${planKey} no disponible`);
      }

      const requestData = {
        priceId,
        customerEmail: user.email,
        metadata: {
          user_id: user.id,
          plan: planKey,
        },
        successUrl: `${window.location.origin}/checkout/success`,
        cancelUrl: `${window.location.origin}/pricing`,
      };

      console.log("Enviando solicitud de checkout:", requestData);

      const { data, error } = await supabase.functions.invoke(
        "create-stripe-checkout",
        {
          body: requestData,
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) {
        console.error("Error de función:", error);
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
          <DialogTitle>
            {showWelcomeMessage
              ? "¡Bienvenido a PokéCollector!"
              : "Mejora tu Plan"}
          </DialogTitle>
          <DialogDescription>
            {showWelcomeMessage
              ? "Comienza con el plan Aprendiz gratuito y mejora cuando lo necesites para acceder a más funcionalidades."
              : "Descubre los beneficios de nuestros planes premium"}
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
              onClick={() => handleUpgrade("ENTRENADOR")}
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
              onClick={() => handleUpgrade("MAESTRO")}
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
      </DialogContent>
    </Dialog>
  );
}

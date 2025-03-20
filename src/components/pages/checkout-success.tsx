import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/components/ui/use-toast";

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const { subscription, refetchSubscription } = useSubscription();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        await refetchSubscription();

        if (!subscription?.status === "active") {
          toast({
            title: "Verificación pendiente",
            description:
              "Tu suscripción está siendo procesada. Esto puede tomar unos minutos.",
            duration: 5000,
          });
        }
      } catch (error) {
        console.error("Error verificando suscripción:", error);
        toast({
          title: "Error de verificación",
          description: "No se pudo verificar el estado de tu suscripción.",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifySubscription();
  }, [refetchSubscription, toast]);

  if (isVerifying) {
    return (
      <div className="container max-w-2xl mx-auto py-16">
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center justify-center">
            <div className="pokeball mb-4" />
            <p className="text-[18px] font-bold text-muted-foreground animate-pulse">
              Verificando tu suscripción...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-16">
      <div className="text-center space-y-6">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />

        <h1 className="text-3xl font-bold">¡Pago exitoso!</h1>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            Tu suscripción ha sido procesada correctamente. Ya puedes comenzar a
            disfrutar de todas las características de tu nuevo plan.
          </p>

          {subscription?.status === "active" && (
            <p className="text-green-600 font-medium">
              Plan activo: {subscription.plan_type}
            </p>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/pricing")}
          >
            Ver planes
          </Button>

          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-primary"
          >
            Ir al dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

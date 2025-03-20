import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/components/ui/use-toast";

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const { subscription, loading, refetchSubscription } = useSubscription();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;
  const RETRY_INTERVAL = 3000; // 3 segundos

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        const updatedSubscription = await refetchSubscription();

        if (!updatedSubscription || updatedSubscription.status !== "active") {
          if (retryCount < MAX_RETRIES) {
            // Programar otro intento
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
            }, RETRY_INTERVAL);

            toast({
              title: "Verificación en proceso",
              description: `Verificando estado de suscripción... Intento ${
                retryCount + 1
              }/${MAX_RETRIES}`,
              duration: 2000,
            });
          } else {
            toast({
              title: "Verificación pendiente",
              description:
                "La activación de tu suscripción puede tomar unos minutos. Por favor, revisa tu dashboard más tarde.",
              duration: 10000,
            });
            setIsVerifying(false);
          }
        } else {
          setIsVerifying(false);
          toast({
            title: "¡Suscripción activada!",
            description:
              "Tu suscripción está activa y puedes comenzar a usar todas las funciones.",
            duration: 5000,
          });
        }
      } catch (error) {
        console.error("Error verificando suscripción:", error);
        setIsVerifying(false);
        toast({
          title: "Error de verificación",
          description: "No se pudo verificar el estado de tu suscripción.",
          variant: "destructive",
        });
      }
    };

    if (!loading && retryCount < MAX_RETRIES) {
      verifySubscription();
    }
  }, [refetchSubscription, toast, loading, retryCount]);

  if (loading || isVerifying) {
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
        <Button onClick={() => navigate("/dashboard")}>Ir al Dashboard</Button>
      </div>
    </div>
  );
}

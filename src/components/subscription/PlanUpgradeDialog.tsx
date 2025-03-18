import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { PLAN_FEATURES, SubscriptionPlan } from "@/lib/polar";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface PlanUpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: SubscriptionPlan;
}

export function PlanUpgradeDialog({ isOpen, onClose, currentPlan }: PlanUpgradeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { subscription } = useSubscription();

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: planId,
          currentPlanId: subscription?.id
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el proceso de actualización. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Actualizar Plan</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {Object.entries(PLAN_FEATURES).map(([planType, plan]) => (
            planType !== currentPlan && (
              <div key={planType} className="flex flex-col gap-2 p-4 border rounded-lg">
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="text-sm text-gray-500">{plan.description}</p>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <span>✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isLoading}
                  className="mt-4"
                >
                  {isLoading ? "Procesando..." : `Actualizar a ${plan.name}`}
                </Button>
              </div>
            )
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}


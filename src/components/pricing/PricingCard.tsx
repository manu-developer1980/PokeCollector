import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Check, Crown } from "lucide-react";
import { useAuth } from "../../../supabase/auth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { PlanFeature } from "@/lib/stripe";
import { toast } from "@/components/ui/use-toast";

interface PricingCardProps {
  plan: PlanFeature;
  isPopular?: boolean;
  onSelectPlan: (planId: string) => void;
  isCurrentPlan: boolean;
}

export function PricingCard({
  plan,
  isPopular,
  onSelectPlan,
  isCurrentPlan,
}: PricingCardProps) {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();

  const handleSelectPlan = () => {
    if (!user) {
      sessionStorage.setItem("selectedPlan", plan.id);
      navigate(`/signup?plan=${plan.name.toLowerCase()}`);
      return;
    }

    if (subscription?.status === "active" && !isCurrentPlan) {
      toast({
        title: "Suscripción existente",
        description:
          "Ya tienes una suscripción activa. Cancela tu suscripción actual antes de cambiar de plan.",
        variant: "destructive",
      });
      return;
    }

    onSelectPlan(plan.id);
  };

  return (
    <Card className={isPopular ? "border-primary" : ""}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
            <Crown className="w-4 h-4" />
            Popular
          </span>
        </div>
      )}

      <CardHeader className="text-center">
        <h3 className="text-2xl font-bold">{plan.name}</h3>
        <p className="text-muted-foreground">{plan.description}</p>
        <div className="mt-4">
          <span className="text-4xl font-bold">{plan.price}€</span>
          <span className="text-muted-foreground">/mes</span>
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li
              key={index}
              className="flex items-center gap-2"
            >
              <Check className="w-5 h-5 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={isPopular ? "default" : "outline"}
          disabled={isCurrentPlan}
          onClick={handleSelectPlan}
        >
          {isCurrentPlan ? "Plan actual" : "Seleccionar plan"}
        </Button>
      </CardFooter>
    </Card>
  );
}

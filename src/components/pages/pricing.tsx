import { useState } from "react";
import { PricingCard } from "../pricing/PricingCard";
import { PLAN_FEATURES } from "@/lib/stripe";
import { useAuth } from "../../../supabase/auth";
import { useSubscription } from "@/hooks/useSubscription";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";

export default function PricingPage() {
  const { user } = useAuth();
  const { subscription, loading } = useSubscription();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      window.location.href = "/login?redirect=/pricing";
      return;
    }
    setSelectedPlanId(planId);
    setIsCheckoutOpen(true);
  };

  if (loading) {
    return (
      <div className="container py-12 space-y-8">
        <div className="text-center">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Planes y Precios</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Elige el plan que mejor se adapte a tus necesidades de coleccionista
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {Object.values(PLAN_FEATURES).map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            isPopular={plan.name === "Entrenador"}
            onSelectPlan={handleSelectPlan}
          />
        ))}
      </div>

      {user && selectedPlanId && (
        <CheckoutFlow
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          planId={selectedPlanId}
          currentSubscription={subscription}
        />
      )}
    </div>
  );
}

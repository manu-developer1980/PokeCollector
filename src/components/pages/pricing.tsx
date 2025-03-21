import { useState } from "react";
import { PricingCard } from "../pricing/PricingCard";
import { PLAN_FEATURES } from "@/lib/stripe";
import { useAuth } from "../../../supabase/auth";
import { useSubscription } from "@/hooks/useSubscription";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function PricingPage() {
  const { user } = useAuth();
  const { subscription, loading } = useSubscription();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (loading) {
    return (
      <div className="container py-12 space-y-8">
        <div className="text-center">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  const currentPlanType = subscription?.plan_type?.toUpperCase() || "APRENDIZ";

  return (
    <div className="container py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Planes y Precios</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Estos son nuestros planes para ti. Empieza con el gratuito y sube de
          nivel cuando lo necesites
        </p>
      </div>

      <div className="flex flex-row justify-center flex-wrap gap-6">
        {Object.entries(PLAN_FEATURES).map(([planType, plan]) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            isPopular={plan.name === "Entrenador"}
            isCurrentPlan={planType === currentPlanType}
            showButton={false}
          />
        ))}
      </div>

      {!user && (
        <div className="flex justify-center mt-8">
          <Link to={user ? "/dashboard" : "/signup"}>
            <Button
              size="lg"
              className="px-8 py-6 text-lg"
            >
              Empezar Gratis
            </Button>
          </Link>
        </div>
      )}

      {selectedPlanId && (
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

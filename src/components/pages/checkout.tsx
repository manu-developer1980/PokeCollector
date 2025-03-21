import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import { CheckoutFlow } from "../checkout/CheckoutFlow";
import { Loader2 } from "lucide-react";
import { PLAN_FEATURES, type PlanFeature } from "@/lib/stripe";
import LoadingSpinner from "@/components/ui/LoaderSpinner";

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PlanFeature | null>(null);
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !user.email_confirmed_at)) {
      navigate("/pricing");
      return;
    }

    const params = new URLSearchParams(location.search);
    const planId = params.get("plan");
    const interval = params.get("interval") as "month" | "year";

    if (!planId) {
      navigate("/pricing");
      return;
    }

    const plan = Object.values(PLAN_FEATURES).find((p) => p.id === planId);
    if (plan) {
      const planWithInterval = {
        ...plan,
        interval,
        price: interval === "year" ? plan.price * 12 * 0.8 : plan.price,
      };
      setSelectedPlan(planWithInterval);
    } else {
      navigate("/pricing");
    }

    setIsLoading(false);
  }, [location.search, navigate, user, loading]);

  const handleCancel = () => {
    navigate("/pricing");
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Cargando datos..." />
      </div>
    );
  }

  if (!selectedPlan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-yellow-50 py-20">
      <CheckoutFlow
        plan={selectedPlan}
        onCancel={handleCancel}
      />
    </div>
  );
}

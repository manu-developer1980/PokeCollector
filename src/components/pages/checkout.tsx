import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import CheckoutFlow from "../checkout/CheckoutFlow";
import { Loader2 } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  isPopular?: boolean;
}

const defaultPlans: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "Basic collection tracking",
    price: 0,
    interval: "month",
    features: [
      "Up to 100 cards in collection",
      "Basic search functionality",
      "Single collection",
      "Community access",
    ],
  },
  {
    id: "price_trainer_monthly", // ID de Polar para el plan mensual
    name: "Trainer",
    description: "For serious collectors",
    price: 9.99,
    interval: "month",
    features: [
      "Unlimited cards in collection",
      "Advanced search filters",
      "Up to 5 custom collections",
      "Card condition tracking",
      "Collection value estimates",
      "Priority support",
    ],
    isPopular: true,
  },
  {
    id: "price_trainer_yearly", // ID de Polar para el plan anual
    name: "Master",
    description: "For professional collectors",
    price: 19.99,
    interval: "month",
    features: [
      "Everything in Trainer",
      "Unlimited custom collections",
      "Price trend analytics",
      "Collection export",
      "API access",
      "Dedicated support",
      "Early access to new features",
    ],
  },
];

const CheckoutPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Parse query parameters to get plan ID and interval
    const params = new URLSearchParams(location.search);
    const planId = params.get("plan");
    const interval = (params.get("interval") as "month" | "year") || "month";

    if (!planId) {
      navigate("/pricing");
      return;
    }

    // Find the selected plan
    const plan = defaultPlans.find((p) => p.id === planId);
    if (plan) {
      // Apply interval to the plan
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
  }, [location.search, navigate]);

  useEffect(() => {
    if (!loading && !user && !isLoading) {
      navigate("/pricing"); // Cambiado de /login a /pricing
    }
  }, [user, loading, navigate, location.search, isLoading]);

  const handleCancel = () => {
    navigate("/pricing");
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
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
};

export default CheckoutPage;

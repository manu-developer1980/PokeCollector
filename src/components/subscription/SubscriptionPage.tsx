import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { useSubscription } from "@/hooks/useSubscription";
import { PlanUpgradeDialog } from "@/components/subscription/PlanUpgradeDialog";

const PLAN_FEATURES = {
  APRENDIZ: {
    features: ["Búsqueda básica de cartas", "1 colección"],
  },
  PREMIUM_MENSUAL: {
    features: [
      "Todas las características Free",
      "Colecciones ilimitadas",
      "Análisis de precios",
    ],
  },
  PREMIUM_ANUAL: {
    features: ["Todas las características Premium", "Ahorra 2 meses"],
  },
};

const SubscriptionPage = () => {
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const { subscription } = useSubscription();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tu Suscripción</h1>
        <Button
          onClick={() => setIsPlanDialogOpen(true)}
          variant="outline"
        >
          Cambiar Plan
        </Button>
      </div>

      {/* Mostrar detalles de la suscripción actual */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          Plan Actual: {subscription?.plan_type}
        </h2>
        <div className="space-y-2">
          {PLAN_FEATURES[subscription?.plan_type || "APRENDIZ"].features.map(
            (feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>{feature}</span>
              </div>
            )
          )}
        </div>
      </div>

      <PlanUpgradeDialog
        isOpen={isPlanDialogOpen}
        onClose={() => setIsPlanDialogOpen(false)}
        currentPlan={subscription?.plan_type || "APRENDIZ"}
      />
    </div>
  );
};

export default SubscriptionPage;

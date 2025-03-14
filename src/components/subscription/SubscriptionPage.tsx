import React, { useState, useEffect } from "react";
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

interface SubscriptionInfo {
  status: string;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
  polarPriceId?: string;
}

const SubscriptionPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionInfo();
  }, []);

  const fetchSubscriptionInfo = async () => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(
          "status, current_period_end, cancel_at_period_end, polar_price_id"
        )
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;

      setSubscription({
        status: data?.status || "free",
        currentPeriodEnd: data?.current_period_end,
        cancelAtPeriodEnd: data?.cancel_at_period_end,
        polarPriceId: data?.polar_price_id,
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setSubscription({
        status: "free",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    navigate("/pricing");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isPremium = subscription?.status === "active";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tu Suscripción</h1>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Plan Actual</CardTitle>
            <Badge variant={isPremium ? "default" : "outline"}>
              {isPremium ? "Premium" : "Free"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscription?.currentPeriodEnd && (
              <p className="text-sm text-gray-600">
                Próxima renovación:{" "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
            {subscription?.cancelAtPeriodEnd && (
              <p className="text-sm text-amber-600">
                Tu suscripción se cancelará al final del período actual
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleUpgrade}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {isPremium ? "Cambiar Plan" : "Mejorar a Premium"}
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Características de tu plan</h2>
        <ul className="space-y-2">
          {!isPremium ? (
            <>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Búsqueda básica de cartas</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>1 colección</span>
              </li>
            </>
          ) : (
            <>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Búsqueda avanzada de cartas</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Colecciones ilimitadas</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Análisis de precios</span>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SubscriptionPage;

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase/supabase";
import { useAuth } from "../../supabase/auth";

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  plan_type: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return null;
    }

    try {
      // Primero obtenemos todas las suscripciones del usuario
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching subscription:", error);
        return null;
      }

      // Si hay múltiples suscripciones, tomamos la más reciente
      if (data && data.length > 0) {
        console.log(
          `Found ${data.length} subscriptions, using the most recent one`
        );
        return data[0];
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const refetchSubscription = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchSubscription();
    setSubscription(data);
    return data;
  }, [fetchSubscription]);

  useEffect(() => {
    // Obtener la suscripción inicial
    refetchSubscription();

    // Configurar una suscripción en tiempo real a cambios en la tabla de suscripciones
    // Esto es más eficiente que usar un intervalo
    const subscriptionChannel = supabase
      .channel("subscription-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subscriptions",
          filter: user ? `user_id=eq.${user.id}` : undefined,
        },
        (payload) => {
          console.log("Cambio en suscripción detectado:", payload);
          refetchSubscription();
        }
      )
      .subscribe();

    // Limpiar la suscripción cuando el componente se desmonte
    return () => {
      supabase.removeChannel(subscriptionChannel);
    };
  }, [refetchSubscription, user]);

  return {
    subscription,
    isLoading,
    refetchSubscription,
  };
};

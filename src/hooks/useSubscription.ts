import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase/supabase";

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan_type: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  is_active: boolean;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        console.log("No session found");
        setSubscription(null);
        return null;
      }

      // Modificamos la consulta para asegurar headers correctos y manejo de respuesta
      const { data, error: subscriptionError } = await supabase
        .from("subscriptions")
        .select()
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subscriptionError) {
        console.log("Subscription query result:", {
          data,
          error: subscriptionError,
        });

        // Si no hay datos, es un caso válido
        if (subscriptionError.code === "PGRST116") {
          setSubscription(null);
          return null;
        }

        throw subscriptionError;
      }

      console.log("Subscription found:", data);
      setSubscription(data);
      return data;
    } catch (error) {
      console.error("Error in fetchSubscription:", error);
      setError(error as Error);
      setSubscription(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refetchSubscription = useCallback(async () => {
    setLoading(true);
    setError(null);
    return await fetchSubscription();
  }, [fetchSubscription]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription,
    loading,
    error,
    refetchSubscription,
  };
};

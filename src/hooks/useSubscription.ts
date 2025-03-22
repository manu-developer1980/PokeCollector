import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase/supabase";

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
        setSubscription(null);
        return null;
      }

      const { data, error: subscriptionError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (subscriptionError) {
        if (subscriptionError.code === "PGRST116") {
          setSubscription(null);
          return null;
        }
        throw subscriptionError;
      }

      console.log("Fetched subscription:", data); // Añadir log para debug
      setSubscription(data);
      return data;
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setError(error as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refrescar la suscripción cuando cambie
  useEffect(() => {
    fetchSubscription();

    // Suscribirse a cambios en la tabla de subscriptions
    const subscriptionChannel = supabase
      .channel("subscription_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subscriptions",
        },
        (payload) => {
          console.log("Subscription change detected:", payload);
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      subscriptionChannel.unsubscribe();
    };
  }, [fetchSubscription]);

  return {
    subscription,
    loading,
    error,
    refetchSubscription: fetchSubscription,
  };
};

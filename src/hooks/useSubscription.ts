import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase/supabase";
import { useAuth } from "../../supabase/auth";

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
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching subscription:", error);
        return null;
      }

      return data;
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
    refetchSubscription();
  }, [refetchSubscription]);

  return {
    subscription,
    isLoading,
    refetchSubscription,
  };
};

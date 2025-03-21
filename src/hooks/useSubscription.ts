import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../supabase/auth";
import { supabase } from "../../supabase/supabase";

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching subscription:", error);
      return null;
    }

    return data;
  }, [user]);

  const refetchSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSubscription();
      setSubscription(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, [fetchSubscription]);

  useEffect(() => {
    refetchSubscription();
  }, [refetchSubscription]);

  return { subscription, loading, refetchSubscription };
};
